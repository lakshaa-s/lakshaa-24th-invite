import { useRef, useState } from 'react';
import { MapPin, TrainFront, CalendarPlus, MessageCircle, Mail } from 'lucide-react';
import { CONFIG } from '../config';

type Answer = 'yes' | 'no';
type Status = 'idle' | 'sending' | Answer | 'error';

const CHIP_STYLES: Record<Answer, React.CSSProperties> = {
  yes: { '--chip-color': '#111', '--chip-edge': '#6b5212', '--chip-accent': '#d4af37' } as React.CSSProperties,
  no: { '--chip-color': '#8e0f1c', '--chip-edge': '#3d050b', '--chip-accent': '#f6efe0' } as React.CSSProperties,
};

const SAVED_RSVP_KEY = 'lakshaa-24th-rsvp';

// So the confirmation (address + transport) survives a closed tab or a phone
// browser being killed, instead of only living in React state.
function readSavedRsvp(): { name: string; answer: Answer } | null {
  try {
    const raw = localStorage.getItem(SAVED_RSVP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function escapeIcsText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

function toIcsStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function transportLines() {
  return CONFIG.transport.map((t) => `${t.station} (${t.line}) — ${t.connection}`);
}

function buildShareText() {
  return [
    "🎲 You're All In — Lakshaa's 24th: Casino Royale 🎰",
    '',
    `📅 ${CONFIG.date}, ${CONFIG.time}`,
    `📍 ${CONFIG.locationFull}`,
    `🖤 ${CONFIG.dressCode} — bring your best poker face`,
    `🍸 ${CONFIG.bringNote}`,
    '',
    '🚕 Getting there:',
    ...transportLines(),
    '',
    'The house always wins. See you at the table 🥂',
  ].join('\n');
}

function buildInviteIcs() {
  const start = new Date(CONFIG.eventStartUTC);
  const end = new Date(start.getTime() + CONFIG.eventDurationHours * 60 * 60 * 1000);
  const description = ['Casino Royale night.', CONFIG.bringNote, '', 'Getting there:', ...transportLines()].join('\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//lakshaa-24th-invite//EN',
    'BEGIN:VEVENT',
    `UID:lakshaa-24th-${start.getTime()}@invite`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    "SUMMARY:Lakshaa's 24th — Casino Royale",
    `LOCATION:${escapeIcsText(CONFIG.locationFull)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export default function RsvpTable() {
  const saved = readSavedRsvp();
  const [name, setName] = useState(saved?.name ?? '');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<Status>(saved?.answer ?? 'idle');
  const [flipping, setFlipping] = useState<Answer | null>(null);
  const [nameMissing, setNameMissing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const send = async (answer: Answer) => {
    if (!name.trim()) {
      setNameMissing(true);
      nameRef.current?.focus();
      return;
    }
    if (!navigator.onLine) {
      setStatus('error');
      return;
    }
    setFlipping(answer);
    setStatus('sending');

    // Apps Script sends no CORS headers, so this goes out "no-cors" and the
    // response is opaque either way — waiting on it just means sitting through
    // Apps Script's occasional cold-start latency for no extra information.
    // Fire it and let the sheet be the source of truth.
    fetch(CONFIG.rsvpEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        name: name.trim(),
        attending: answer === 'yes' ? 'All in' : 'Fold',
        contact: contact.trim(),
        // Apps Script emails this back to the guest if `contact` looks like an email.
        details: answer === 'yes' ? buildShareText() : '',
      }),
    }).catch(() => {});

    await new Promise((r) => setTimeout(r, 900)); // let the chip flip finish
    setStatus(answer);
    try {
      localStorage.setItem(SAVED_RSVP_KEY, JSON.stringify({ name: name.trim(), answer }));
    } catch {
      // Private browsing / blocked storage — confirmation just won't survive a reload.
    }
    setFlipping(null);
  };

  const chip = (answer: Answer) => {
    const yes = answer === 'yes';
    return (
      <button
        onClick={() => send(answer)}
        disabled={status === 'sending'}
        className="chip-btn chip-stage chip-idle group flex flex-col items-center rounded-full focus-visible:outline-none disabled:cursor-wait"
        style={{ animationDelay: answer === 'yes' ? '0ms' : '1600ms' }}
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
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-9xl font-black text-white/10"
        aria-hidden="true"
      >
        LS
      </div>

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
                {contact.includes('@') && (
                  <p className="mt-1 text-sm text-white/50">We've sent these details to {contact.trim()}.</p>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.locationFull)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-3 rounded-full border border-yellow-700/60 bg-black/40 px-6 py-3 transition hover:border-yellow-400 hover:bg-black/60"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-yellow-500" />
                  <span className="text-yellow-100 underline-offset-4 hover:underline">{CONFIG.locationFull}</span>
                </a>
                <div className="mx-auto mt-6 max-w-sm text-left">
                  <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-yellow-500/80">
                    <TrainFront className="h-4 w-4" /> Getting there
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-white/70">
                    {CONFIG.transport.map((t) => (
                      <li key={t.station}>
                        <span className="font-medium text-yellow-100">{t.station}</span>
                        <span className="text-white/50"> · {t.line}</span>
                        <br />
                        {t.connection}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`data:text/calendar;charset=utf-8,${encodeURIComponent(buildInviteIcs())}`}
                  download="lakshaas-24th.ics"
                  className="mt-6 inline-flex items-center gap-2 text-sm text-yellow-200/80 underline-offset-4 hover:text-yellow-100 hover:underline"
                >
                  <CalendarPlus className="h-4 w-4" /> Add to calendar, so you don't lose this
                </a>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(buildShareText())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-yellow-200/80 underline-offset-4 hover:text-yellow-100 hover:underline"
                  >
                    <MessageCircle className="h-4 w-4" /> Send to WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent("Lakshaa's 24th — Casino Royale")}&body=${encodeURIComponent(buildShareText())}`}
                    className="inline-flex items-center gap-2 text-sm text-yellow-200/80 underline-offset-4 hover:text-yellow-100 hover:underline"
                  >
                    <Mail className="h-4 w-4" /> Email me this
                  </a>
                </div>
              </>
            ) : (
              <p className="mt-3 text-white/80">You'll be missed. We'll have a martini in your honour.</p>
            )}
            <button
              onClick={() => {
                setStatus('idle');
                try {
                  localStorage.removeItem(SAVED_RSVP_KEY);
                } catch {
                  // ignore
                }
              }}
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
            <label htmlFor="rsvp-contact" className="sr-only">Email or phone number</label>
            <input
              id="rsvp-contact"
              type="text"
              autoComplete="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email or phone (optional)"
              className="mt-3 w-full max-w-sm rounded-full border border-white/20 bg-black/50 px-6 py-3 text-center text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
