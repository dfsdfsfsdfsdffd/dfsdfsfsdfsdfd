"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleClaim = () => {
    if (username) {
      // Redirect to signup and pass the desired username
      router.push(`/signup?username=${username}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-4 tracking-tighter">softcard.cc/</h1>
      <div className="flex bg-zinc-900 p-2 rounded-2xl border border-zinc-800 w-full max-w-md">
        <input 
          type="text" 
          placeholder="yourname"
          className="bg-transparent flex-1 p-3 outline-none text-xl"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />
        <button 
          onClick={handleClaim}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition"
        >
          Claim
        </button>
      </div>
      <p className="mt-4 text-zinc-500">Secure your unique profile link today.</p>
    </div>
  );
}