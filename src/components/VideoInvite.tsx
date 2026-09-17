import { useState } from 'react';
import { Play } from 'lucide-react';
import { CONFIG } from '../config';

export default function VideoInvite() {
  const [playing, setPlaying] = useState(false);
  const hasVideo = CONFIG.videoEmbedUrl.length > 0;

  return (
    <section className="w-full" aria-labelledby="video-heading">
      <h2 id="video-heading" className="mb-6 text-center font-display text-4xl text-white md:text-5xl">
        Ocean's 24
      </h2>
      <div className="[perspective:1400px]">
        <div className="frame-gold video-glow transition-transform duration-700 [transform:rotateX(8deg)] hover:[transform:rotateX(0deg)]">
          <div className="crt-screen crt-flicker relative aspect-video overflow-hidden rounded-[0.9rem] bg-zinc-900">
            <div className="sweep-light" aria-hidden="true" />
            <span className="pointer-events-none absolute left-4 top-3 z-10 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-yellow-200/80">
              <span className="crt-dot h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
              CH 24 · LIVE
            </span>
            {playing && hasVideo ? (
              <iframe
                src={CONFIG.videoEmbedUrl}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Ocean's 24 invite video"
              />
            ) : (
              <button
                onClick={() => hasVideo && setPlaying(true)}
                disabled={!hasVideo}
                aria-label={hasVideo ? 'Play the invite video' : 'Invite video coming soon'}
                className="group bg-felt absolute inset-0 flex h-full w-full items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-yellow-400"
              >
                <span className="pointer-events-none absolute font-display text-[40vw] font-black leading-none text-black/25 md:text-[22rem]">
                  24
                </span>
                <span className="relative flex flex-col items-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-yellow-500/70 bg-black/60 backdrop-blur transition-transform duration-300 group-enabled:group-hover:scale-110">
                    <Play className="ml-1 h-9 w-9 text-yellow-200" fill="currentColor" />
                  </span>
                  <span className="text-gold mt-4 font-display text-lg italic">
                    {hasVideo ? 'Play the invite' : 'Transmission incoming'}
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
