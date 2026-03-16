import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-glow flex flex-col items-center justify-center text-center p-6 relative">
      
      {/* Navbar */}
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm rotate-45 flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-sm" />
          </div>
          <span className="font-black text-xl italic tracking-tighter">softcard.cc</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-500">
          <span className="hover:text-white cursor-pointer transition-colors">Features</span>
          <span className="hover:text-white cursor-pointer transition-colors">Community</span>
          <span className="text-white bg-blue-600/10 border border-blue-500/20 px-5 py-2 rounded-full">
            Coming Soon
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        {/* Version Badge */}
        <div className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full">
          <span className="bg-blue-500 w-1.5 h-1.5 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Under Construction
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-[0.85]">
          Your corner of <br /> 
          <span className="text-blue-500 drop-shadow-[0_0_35px_rgba(59,130,246,0.4)]">the internet.</span>
        </h1>

        {/* Description */}
        <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
          The next generation of bio-links. Beautiful, fast, and completely customizable. 
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
          <button className="btn-primary">
            Claim Your Handle <Sparkles size={18} />
          </button>
          <button className="btn-secondary">
            View Showreel
          </button>
        </div>
      </div>

      {/* Subtle Bottom Vignette */}
      <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
