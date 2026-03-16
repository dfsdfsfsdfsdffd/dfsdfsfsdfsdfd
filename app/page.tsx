'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/login?claim=${username.toLowerCase().trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in duration-1000">
        <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
          Soft<span className="text-zinc-600">card</span>
        </h1>
        
        <form onSubmit={handleClaim} className="relative group max-w-md mx-auto">
          <div className="absolute -inset-1 bg-white/10 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500" />
          <div className="relative flex bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
            <span className="flex items-center pl-6 text-zinc-500 font-bold">softcard.cc/</span>
            <input 
              type="text" 
              placeholder="username"
              className="w-full bg-transparent py-5 px-2 outline-none font-bold text-xl placeholder:text-zinc-800"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-white text-black px-8 font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
            >
              Claim
            </button>
          </div>
        </form>
        
        <p className="text-zinc-500 font-medium tracking-[0.2em] uppercase text-[10px]">
          The only link you'll ever need.
        </p>
      </div>
    </div>
  );
}
