import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import SceneBoundary from './SceneBoundary';

// three.js is heavy, so it loads in its own chunk after the text has painted.
const CasinoScene = lazy(() => import('./CasinoScene'));

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  // Wait for fonts so the numbers painted onto the wheel use Bodoni.
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && setReady(true));
    return () => { cancelled = true; };
  }, []);

  // Pause rendering when the hero is scrolled off-screen (saves phone batteries).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,#2a0a10_0%,#050505_65%)]"
        aria-hidden="true"
      />
      <div
        className="text-gold pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display text-[46vw] font-black leading-none opacity-[0.06] md:text-[26rem]"
        aria-hidden="true"
      >
        LS
      </div>
      <div className="absolute inset-0" aria-hidden="true">
        {ready && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <CasinoScene active={visible} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink" />

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-6xl flex-col px-6 pt-16 md:justify-center md:px-10 md:pt-0">
        <p className="rise font-display text-xl italic text-red-400/90 md:text-2xl">You're invited to</p>
        <h1 className="rise shimmer text-gold mt-2 font-display text-[clamp(4rem,14vw,10rem)] font-black leading-[0.85] tracking-tight [animation-delay:120ms]">
          Lakshaa's
          <br />
          24th
        </h1>
        <p className="rise mt-3 w-fit rounded-full border border-yellow-600/60 bg-black/40 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-yellow-200 backdrop-blur [animation-delay:200ms]">
          ✨ Her golden birthday ✨
        </p>
        <p className="rise mt-6 max-w-sm text-lg font-light text-zinc-300 [animation-delay:260ms] md:text-xl">
          A night at the Casino Royale. {CONFIG.date}, {CONFIG.time}.
        </p>
        <a
          href="#invite"
          className="rise pointer-events-auto mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-yellow-600/60 bg-black/40 px-6 py-3 text-sm font-medium text-yellow-100 backdrop-blur transition hover:border-yellow-400 hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400 [animation-delay:400ms]"
        >
          Watch the invite
        </a>
      </div>
    </section>
  );
}
