import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="mesh-bg" />

      {/* Navigation */}
      <nav className="absolute top-0 w-full max-w-7xl flex items-center justify-between p-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter">✶ frost.rip</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Community</a>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex flex-col items-center text-center px-6 z-10 max-w-3xl">
        {/* The "NEW" Badge */}
        <div className="mb-8 group cursor-pointer bg-blue-950/30 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md">
          <span className="bg-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded-sm">NEW</span>
          <span className="text-[11px] font-medium text-blue-200/80">
            V1.2.5b Fix up video background audio & playing issues.
          </span>
          <ArrowRight size={12} className="text-blue-400" />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6">
          Your corner of <br />
          <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600">
            the internet.
          </span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-lg mb-10 leading-relaxed">
          One link-in-bio page for everything you do. Socials, projects, content — all in one place, completely free.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
            Create Your Page <ArrowRight size={18} />
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-zinc-300 font-bold py-4 px-10 rounded-full border border-white/5 transition-all backdrop-blur-md">
            See how it works
          </button>
        </div>
      </div>
    </main>
  )
}
