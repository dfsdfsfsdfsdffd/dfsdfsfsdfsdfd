'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-800/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-xl w-full text-center space-y-12">
        <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Soft<span className="text-zinc-600">card</span>
        </h1>
        
        <div className="relative group max-w-md mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <div className="relative flex bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
            <span className="flex items-center pl-6 text-zinc-600 font-bold tracking-tight">softcard.cc/</span>
            <input 
              type="text" 
              placeholder="username"
              className="w-full bg-transparent py-5 px-2 outline-none font-bold text-xl placeholder:text-zinc-800"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
            <button 
              onClick={() => router.push(`/login?claim=${username}`)}
              className="bg-white text-black px-8 font-black uppercase tracking-tighter hover:bg-zinc-200 transition-colors"
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
