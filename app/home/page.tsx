import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-8xl font-black tracking-tighter uppercase italic italic underline decoration-neutral-800">
          UNBOUND
        </h1>
        <p className="text-neutral-400 font-mono text-sm tracking-[0.3em] uppercase">
          [ A UI-Driven Medieval Odyssey ]
        </p>
        <div className="flex gap-4 justify-center pt-10">
          <Link href="/login" className="px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:invert transition-all">
            Enter Realm
          </Link>
        </div>
      </div>
    </div>
  );
}
