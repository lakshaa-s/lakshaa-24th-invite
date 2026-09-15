import { PointerEvent, ReactNode, useRef } from 'react';
import { CONFIG } from '../config';

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function PlayingCard({ rank, suit, red, title, children }: {
  rank: string;
  suit: string;
  red?: boolean;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ink = red ? 'text-red-700' : 'text-zinc-900';

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reducedMotion || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg) translateZ(30px)`;
    el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div className="[perspective:900px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        ref={ref}
        className="playing-card relative flex aspect-[5/7] flex-col items-center justify-center rounded-2xl bg-card p-4 text-center text-zinc-900 ring-1 ring-yellow-700/40"
      >
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-yellow-700/40" />
        <div className={`absolute left-4 top-3 flex flex-col items-center font-display leading-none ${ink}`}>
          <span className="text-2xl font-bold">{rank}</span>
          <span className="text-xl">{suit}</span>
        </div>
        <div className={`absolute bottom-3 right-4 flex rotate-180 flex-col items-center font-display leading-none ${ink}`}>
          <span className="text-2xl font-bold">{rank}</span>
          <span className="text-xl">{suit}</span>
        </div>
        <span className={`font-display text-5xl ${ink}`} aria-hidden="true">{suit}</span>
        <h3 className="mt-3 font-display text-xl italic">{title}</h3>
        <p className="mt-1 text-sm font-medium leading-snug text-zinc-700">{children}</p>
        <div className="glare pointer-events-none absolute inset-0 rounded-2xl" />
      </div>
    </div>
  );
}

export default function Details() {
  return (
    <section className="w-full" aria-labelledby="details-heading">
      <h2 id="details-heading" className="mb-10 text-center font-display text-4xl md:text-5xl">
        The hand you're dealt
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        <PlayingCard rank="A" suit="♥" red title="The date">{CONFIG.date}</PlayingCard>
        <PlayingCard rank="K" suit="♠" title="The time">{CONFIG.time}</PlayingCard>
        <PlayingCard rank="Q" suit="♦" red title="The place">
          {CONFIG.locationTeaser}
          <br />
          <span className="text-zinc-500">Revealed when you RSVP</span>
        </PlayingCard>
        <PlayingCard rank="J" suit="♣" title="The dress">{CONFIG.dressCode}</PlayingCard>
      </div>
    </section>
  );
}
