import { ScanBar } from './scan-bar';

export function CtaSection() {
  return (
    <section
      id="cta"
      className="grid min-h-[78vh] place-items-center px-6 pb-[120px] pt-[140px] text-center"
    >
      <div>
        <h2
          className="font-display font-black leading-none tracking-[-0.035em]"
          style={{ fontSize: 'clamp(40px,7vw,96px)' }}
        >
          STOP THE ROT.
          <br />
          <em className="not-italic text-sonar [text-shadow:0_0_44px_rgba(43,217,194,.45)]">
            START THE SWEEP.
          </em>
        </h2>
        <p className="mx-0 mb-[38px] mt-6 text-[17px] text-fog">
          Paste a URL. Get a health score in minutes. The first sweep is on us.
        </p>
        <ScanBar />
      </div>
    </section>
  );
}
