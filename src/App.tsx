import Hero from './components/Hero';
import VideoInvite from './components/VideoInvite';
import Details from './components/Details';
import RsvpTable from './components/RsvpTable';
import Reveal from './components/Reveal';

export default function App() {
  return (
    <main className="bg-ink font-sans selection:bg-yellow-600 selection:text-white">
      <Hero />
      <div id="invite" className="relative mx-auto flex max-w-5xl flex-col items-center gap-24 px-5 pb-24 md:px-8">
        <Reveal className="w-full"><VideoInvite /></Reveal>
        <Details />
        <Reveal className="flex w-full justify-center"><RsvpTable /></Reveal>
        <Reveal>
          <footer className="text-center text-sm text-zinc-500">
            <p className="font-display text-lg italic text-zinc-400">The house always wins.</p>
            <p>The house is also providing drinks.</p>
          </footer>
        </Reveal>
      </div>
    </main>
  );
}
