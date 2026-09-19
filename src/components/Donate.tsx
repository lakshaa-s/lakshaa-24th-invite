import { Heart } from 'lucide-react';
import { CONFIG } from '../config';

export default function Donate() {
  const { charity, appeal, url } = CONFIG.donation;
  return (
    <section className="w-full max-w-2xl text-center" aria-labelledby="donate-heading">
      <Heart className="mx-auto h-6 w-6 text-yellow-500" aria-hidden="true" />
      <h2 id="donate-heading" className="mt-3 font-display text-3xl text-white md:text-4xl">
        Feeling generous?
      </h2>
      <p className="mt-3 text-white/70">
        Thinking of a gift? If you'd like to do something kind in honour of my birthday, you're welcome
        to donate to the {charity} {appeal}. Completely optional.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-yellow-600/60 bg-black/40 px-6 py-3 text-sm font-medium text-yellow-100 backdrop-blur transition hover:border-yellow-400 hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
      >
        Donate to {charity}
      </a>
    </section>
  );
}
