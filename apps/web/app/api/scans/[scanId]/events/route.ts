import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redis, scanProgressChannel } from '@/lib/redis';
import { prisma } from '@deadlink-sentinel/db';

// Server-Sent Events endpoint.
// The worker publishes ScanProgressEvent JSON to Redis pub/sub;
// this route subscribes and forwards each message to the browser.
// Chosen over WebSockets because progress is one-directional and SSE works
// through HTTP/2 proxies without a protocol upgrade.

export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } },
) {
  // Demo scans have no owner and are readable by anyone holding the scanId
  // (the id itself is the secret — same trust model as an unguessable share link).
  const demoScan = await prisma.scan.findFirst({
    where: { id: params.scanId, siteId: 'demo' },
    select: { id: true, status: true },
  });

  let scan = demoScan;

  if (!scan) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Verify the scan belongs to the requesting user
    scan = await prisma.scan.findFirst({
      where: {
        id: params.scanId,
        site: { userId: session.user.id },
      },
      select: { id: true, status: true },
    });
  }

  if (!scan) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Already done — no need to hold a connection
  if (scan.status === 'COMPLETED' || scan.status === 'FAILED' || scan.status === 'CANCELLED') {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(`data: ${JSON.stringify({ type: 'ALREADY_DONE', status: scan.status })}\n\n`);
        controller.close();
      },
    });
    return sseResponse(stream);
  }

  // Subscribe to Redis channel and pipe events to the SSE stream
  const subscriber = redis.duplicate();
  const channel = scanProgressChannel(params.scanId);

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      await subscriber.subscribe(channel);
      subscriber.on('message', (_channel: string, message: string) => {
        try {
          controller.enqueue(enc.encode(`data: ${message}\n\n`));
        } catch {
          // Client disconnected — subscriber cleanup happens in cancel()
        }
      });

      // Heartbeat every 20 s to keep the connection alive through proxies
      const hb = setInterval(() => {
        try { controller.enqueue(enc.encode(': heartbeat\n\n')); } catch { clearInterval(hb); }
      }, 20_000);

      request.signal.addEventListener('abort', () => {
        clearInterval(hb);
        void subscriber.unsubscribe(channel).then(() => subscriber.disconnect());
        controller.close();
      });
    },

    cancel() {
      void subscriber.unsubscribe(channel).then(() => subscriber.disconnect());
    },
  });

  return sseResponse(stream);
}

function sseResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering on Railway
    },
  });
}
