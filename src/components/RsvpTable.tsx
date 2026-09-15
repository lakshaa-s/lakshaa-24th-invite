import { useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { CONFIG } from '../config';

type Answer = 'yes' | 'no';
type Status = 'idle' | 'sending' | Answer | 'error';

const CHIP_STYLES: Record<Answer, React.CSSProperties> = {
  yes: { '--chip-color': '#111', '--chip-edge': '#6b5212', '--chip-accent': '#d4af37' } as React.CSSProperties,
  no: { '--chip-color': '#8e0f1c', '--chip-edge': '#3d050b', '--chip-accent': '#f6efe0' } as React.CSSProperties,
};

export default function RsvpTable() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [flipping, setFlipping] = useState<Answer | null>(null);
  const [nameMissing, setNameMissing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const send = async (answer: Answer) => {
    if (!name.trim()) {
      setNameMissing(true);
      nameRef.current?.focus();
      return;
    }
    setFlipping(answer);
    setStatus('sending');
    try {
      const [res] = await Promise.all([
        fetch(CONFIG.rsvpEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name: name.trim(), attending: answer === 'yes' ? 'All in' : 'Fold' }),
        }),
        new Promise((r) => setTimeout(r, 900)), // let the chip flip finish
      ]);
      if (!res.ok) throw new Error(`RSVP failed: ${res.status}`);
      setStatus(answer);
    } catch {
      setStatus('error');
    } finally {
      setFlipping(null);
    }
  };

  const chip = (answer: Answer) => {
    const yes = answer === 'yes';
    return (
      <button
        onClick={() => send(answer)}
        disabled={status === 'sending'}
        className="chip-btn chip-stage group flex flex-col items-center rounded-full focus-visible:outline-none disabled:cursor-wait"
      >
        <span
          className={`chip block h-36 w-36 sm:h-44 sm:w-44 ${flipping === answer ? 'is-flipping' : ''} group-focus-visible:ring-4 group-focus-visible:ring-yellow-400`}
          style={CHIP_STYLES[answer]}
        >
          <span className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <span className={`font-display text-2xl font-black sm:text-3xl ${yes ? 'text-gold' : 'text-card'}`}>
              {yes ? 'All in' : 'Fold'}
            </span>
          </span>
        </span>
        <span className="mt-6 text-sm text-red-100/80">{yes ? "I'll be there" : "Can't make it"}</span>
      </button>
    );
  };

  return (
    <section
      className="bg-felt relative w-full max-w-3xl overflow-hidden rounded-[2.5rem] border-[10px] border-[#2a0308] px-6 py-12 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)] md:px-12"
      aria-labelledby="rsvp-heading"
    >
      <div className="pointer-events-none absolute inset-4 rounded-[1.8rem] border-2 border-white/15" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 id="rsvp-heading" className="font-display text-4xl text-white drop-shadow md:text-5xl">
          Place your bets
        </h2>

        {status === 'yes' || status === 'no' ? (
          <div className="rise py-10" aria-live="polite">
            <h3 className="text-gold font-display text-3xl md:text-4xl">
              {status === 'yes' ? 'The house accepts your wager.' : 'Maybe next hand.'}
            </h3>
            {status === 'yes' ? (
              <>
                <p className="mt-3 text-white/80">See you at the table, {name.trim().split(' ')[0]}.</p>
                <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-yellow-700/60 bg-black/40 px-6 py-3">
                  <MapPin className="h-5 w-5 shrink-0 text-yellow-500" />
                  <span className="text-yellow-100">{CONFIG.locationFull}</span>
                </div>
              </>
            ) : (
              <p className="mt-3 text-white/80">You'll be missed. We'll have a martini in your honour.</p>
            )}
            <button
              onClick={() => setStatus('idle')}
              className="mx-auto mt-8 block text-sm text-red-200 underline opacity-70 hover:opacity-100"
            >
              Change RSVP
            </button>
          </div>
        ) : (
          <>
            <p className="mb-8 mt-2 text-red-100/80">Tell the house who's playing, then pick a chip.</p>
            <label htmlFor="rsvp-name" className="sr-only">Your name</label>
            <input
              ref={nameRef}
              id="rsvp-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameMissing(false); }}
              placeholder="Your name"
              className={`w-full max-w-sm rounded-full border bg-black/50 px-6 py-3 text-center text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${nameMissing ? 'border-yellow-400' : 'border-white/20'}`}
            />
            <p className="mb-8 mt-2 h-5 text-sm text-yellow-300" role="alert">
              {nameMissing && 'Add your name so the house knows who bet.'}
              {status === 'error' && "Your RSVP didn't go through. Check your connection and try again."}
            </p>
            <div className="flex flex-wrap justify-center gap-10 sm:gap-16">
              {chip('yes')}
              {chip('no')}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
