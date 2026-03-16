import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      {/* Blue Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />
      
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="font-black text-2xl italic tracking-tighter">softcard.cc</div>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full text-sm font-bold transition-all">
          Get Started →
        </Link>
      </nav>

      <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          The new standard for bio links
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight">
          Your corner of <br /> 
          <span className="text-blue-500">the internet.</span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto">
          One link-in-bio page for everything you do. Socials, projects, content — all in one place.
        </p>

        <div className="flex gap-4 justify-center pt-6">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            Create Your Page
          </Link>
          <button className="px-10 py-4 rounded-full border border-zinc-800 font-bold hover:bg-white/5 transition-all text-zinc-300">
            See how it works
          </button>
        </div>
      </div>
    </div>
  );
}
