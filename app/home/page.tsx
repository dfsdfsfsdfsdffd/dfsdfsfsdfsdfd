// app/home/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-7xl font-black tracking-tighter uppercase italic text-white leading-none">
            Unbound<span className="text-neutral-500">RPG</span>
          </h1>
          <p className="text-neutral-400 font-mono text-sm tracking-widest uppercase">
            [ No Graphics // Pure Grit // Data Driven ]
          </p>
        </div>

        <p className="text-gray-400 text-lg leading-relaxed">
          The realm is not drawn in pixels, but forged in the database. 
          Claim your title, manage your stats, and survive the text-based odyssey.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/login" 
            className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 text-center">
            Enter The Void
          </Link>
          <button className="px-10 py-4 border border-neutral-800 text-neutral-400 font-bold uppercase tracking-widest hover:border-neutral-500 hover:text-white transition-all text-center">
            Learn More
          </button>
        </div>
      </div>

      <footer className="absolute bottom-8 text-neutral-600 text-xs font-mono uppercase tracking-tighter">
        v0.0.1-alpha // secure-auth by supabase
      </footer>
    </div>
  );
}