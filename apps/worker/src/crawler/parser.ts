import * as cheerio from 'cheerio';

export type ParsedPage = {
  title: string | null;
  hasMetaDescription: boolean;
  links: ParsedLink[];
  headingIds: Set<string>; // all id= attributes on heading elements
};

export type ParsedLink = {
  href: string;
  fragment: string | null; // the #fragment part, if any
};

export function parsePage(html: string, baseUrl: string): ParsedPage {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim() || null;
  const hasMetaDescription = $('meta[name="description"]').length > 0;

  // Collect all heading IDs — used to verify #fragment anchors
  const headingIds = new Set<string>();
  $('h1,h2,h3,h4,h5,h6,[id]').each((_, el) => {
    const id = $(el).attr('id');
    if (id) headingIds.add(id);
  });

  const links: ParsedLink[] = [];
  const seen = new Set<string>();

  $('a[href]').each((_, el) => {
    const raw = $(el).attr('href');
    if (!raw) return;

    let resolved: URL;
    try {
      resolved = new URL(raw, baseUrl);
    } catch {
      return; // malformed href — skip
    }

    // Ignore non-http(s) schemes (mailto:, javascript:, tel:, etc.)
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return;

    const fragment = resolved.hash ? resolved.hash.slice(1) : null;

    // Deduplicate by full href (including fragment)
    const key = resolved.href;
    if (seen.has(key)) return;
    seen.add(key);

    links.push({ href: resolved.href, fragment });
  });

  return { title, hasMetaDescription, links, headingIds };
}
