import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6">
      <div className="mesh-bg" />

      {/* Navbar */}
      <nav className="absolute top-0 w-full max-w-7xl flex items-center justify-between p-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter italic">✶ frost.rip</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-500">
            <span>Features</span>
            <span>Community</span>
          </div>
          <button className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 btn-glow">
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center z-10 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
        
        {/* Update Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-950/20 border border-blue-500/20 px-3 py-1 rounded-full backdrop-blur-md">
          <span className="bg-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded-sm">NEW</span>
          <span className="text-[11px] font-medium text-blue-200/60">
            V1.2.5b Fix up video background audio & playing issues.
          </span>
          <ArrowRight size={12} className="text-blue-500" />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
          Your corner of <br />
          <span className="text-blue-500">the internet.</span>
        </h1>

        <p className="text-zinc-500 text-lg md:text-xl max-w-lg mx-auto font-medium">
          One link-in-bio page for everything you do. Socials, projects, content — all in one place, completely free.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full flex items-center gap-2 btn-glow active:scale-95">
            Create Your Page <ArrowRight size={18} />
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-zinc-300 font-bold py-4 px-10 rounded-full border border-white/5 backdrop-blur-md transition-all">
            See how it works
          </button>
        </div>
      </div>
    </main>
  );
}
