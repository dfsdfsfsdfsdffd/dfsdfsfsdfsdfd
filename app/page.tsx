'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [claim, setClaim] = useState('');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
      <div className="w-full max-w-xl text-center space-y-12">
        <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Soft<span className="text-zinc-600">card</span>
        </h1>
        
        <div className="glass-card p-2 flex items-center group">
          <span className="pl-6 text-zinc-600 font-bold text-xl">softcard.cc/</span>
          <input 
            className="flex-1 bg-transparent py-6 px-2 outline-none font-bold text-2xl placeholder:text-zinc-800"
            placeholder="username"
            onChange={(e) => setClaim(e.target.value)}
          />
          <button 
            onClick={() => router.push(`/login?claim=${claim}`)}
            className="bg-white text-black h-[60px] px-10 rounded-2xl font-black uppercase tracking-tighter hover:bg-zinc-200 transition-all"
          >
            Claim
          </button>
        </div>
      </div>
    </div>
  );
}
