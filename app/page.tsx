import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-glow flex flex-col items-center justify-center text-center p-6">
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center max-w-7xl">
        <div className="font-black text-xl italic tracking-tighter">softcard.cc</div>
        <div className="flex gap-8 text-sm font-medium text-zinc-400">
          <Link href="/features" className="hover:text-white">Features</Link>
          <Link href="/community" className="hover:text-white">Community</Link>
          <Link href="/login" className="btn-blue py-2 px-6 text-xs">Get Started →</Link>
        </div>
      </nav>

      <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <span className="bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          New: Version 2.0 Live Now
        </span>
        <h1 className="text-7xl font-bold tracking-tight">
          Your corner of <br /> <span className="text-blue-500">the internet.</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          One link-in-bio page for everything you do. Socials, projects, content — all in one place.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/setup" className="btn-blue">Create Your Page →</Link>
          <button className="px-8 py-4 rounded-full border border-zinc-800 font-bold hover:bg-white/5 transition-all">
            See how it works
          </button>
        </div>
      </div>
    </div>
  );
}
