import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { CONFIG } from '../config';

const photoUrl = (file: string) => `${import.meta.env.BASE_URL}dress-inspo/${file}`;

export default function DressInspo() {
  const [open, setOpen] = useState<{ set: number; photo: number } | null>(null);

  const step = useCallback((dir: 1 | -1) => {
    setOpen((cur) => {
      if (!cur) return cur;
      const n = CONFIG.dressInspo[cur.set].photos.length;
      return { set: cur.set, photo: (cur.photo + dir + n) % n };
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, step]);

  const current = open ? CONFIG.dressInspo[open.set] : null;
  const photo = current && open ? current.photos[open.photo] : null;
  const iconBtn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-yellow-600/60 bg-black/60 text-yellow-100 backdrop-blur transition hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400';

  return (
    <section className="w-full max-w-2xl text-center" aria-labelledby="inspo-heading">
      <Sparkles className="mx-auto h-6 w-6 text-yellow-500" aria-hidden="true" />
      <h2 id="inspo-heading" className="mt-3 font-display text-3xl text-white md:text-4xl">
        Not sure what to wear?
      </h2>
      <p className="mt-3 text-white/70">
        Think Great Gatsby glamour: sequins, sharp suits, feathers, gold and black. Tap for some inspo.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {CONFIG.dressInspo.map((set, i) => (
          <button
            key={set.label}
            onClick={() => setOpen({ set: i, photo: 0 })}
            className="inline-flex items-center gap-2 rounded-full border border-yellow-600/60 bg-black/40 px-6 py-3 text-sm font-medium text-yellow-100 backdrop-blur transition hover:border-yellow-400 hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
          >
            {set.label}
          </button>
        ))}
      </div>

      {current && photo && open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.label}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <img
            src={photoUrl(photo.file)}
            alt={photo.alt}
            className="max-h-[82svh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button className={`${iconBtn} absolute right-4 top-4`} onClick={() => setOpen(null)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          {current.photos.length > 1 && (
            <>
              <button
                className={`${iconBtn} absolute left-3 top-1/2 -translate-y-1/2`}
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className={`${iconBtn} absolute right-3 top-1/2 -translate-y-1/2`}
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <p className="absolute inset-x-0 bottom-4 text-center text-sm text-white/60">
            {current.label} · {open.photo + 1} / {current.photos.length}
          </p>
        </div>
      )}
    </section>
  );
}
