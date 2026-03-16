'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full text-center space-y-12">
        <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none">
          Soft<span className="text-zinc-500">card</span>
        </h1>
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 to-zinc-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
          <div className="relative flex bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
            <span className="flex items-center pl-6 text-zinc-500 font-bold">softcard.cc/</span>
            <input 
              type="text" 
              placeholder="username"
              className="w-full bg-transparent py-5 px-2 outline-none font-bold text-xl placeholder:text-zinc-700"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
            <button 
              onClick={() => router.push(`/login?claim=${username}`)}
              className="bg-white text-black px-8 font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
            >
              Claim
            </button>
          </div>
        </div>
        
        <p className="text-zinc-500 font-medium tracking-wide uppercase text-sm">
          Join 2,000+ creators building their identity.
        </p>
      </div>
    </div>
  );
}
