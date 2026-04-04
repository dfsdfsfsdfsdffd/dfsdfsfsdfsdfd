import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">
          Neon <span className="text-indigo-500">Quest</span>
        </h1>
        <p className="text-zinc-400 max-w-sm mx-auto">
          A minimalist 2D RPG experience. Level up, gain gold, and survive the UI.
        </p>
        <Link href="/login">
          <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 shadow-xl shadow-indigo-500/20">
            ENTER THE REALM
          </button>
        </Link>
      </div>
    </main>
  );
}