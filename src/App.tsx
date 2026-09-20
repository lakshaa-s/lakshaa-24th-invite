import Hero from './components/Hero';
import VideoInvite from './components/VideoInvite';
import Details from './components/Details';
import RsvpTable from './components/RsvpTable';
import Donate from './components/Donate';
import DressInspo from './components/DressInspo';
import Reveal from './components/Reveal';
import { CONFIG } from './config';

export default function App() {
  return (
    <main className="bg-ink font-sans selection:bg-yellow-600 selection:text-white">
      <Hero />
      <div id="invite" className="relative mx-auto flex max-w-5xl flex-col items-center gap-24 px-5 pb-24 md:px-8">
        <Reveal className="w-full"><VideoInvite /></Reveal>
        <Details />
        <Reveal className="flex w-full justify-center"><DressInspo /></Reveal>
        <Reveal className="flex w-full justify-center"><RsvpTable /></Reveal>
        <Reveal className="flex w-full justify-center"><Donate /></Reveal>
        <Reveal>
          <footer className="text-center text-sm text-zinc-500">
            <p className="font-display text-lg italic text-zinc-400">The house always wins.</p>
            <p>{CONFIG.bringNote}</p>
          </footer>
        </Reveal>
      </div>
    </main>
  );
}
