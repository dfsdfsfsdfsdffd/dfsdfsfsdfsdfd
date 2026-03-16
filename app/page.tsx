"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [name, setName] = useState('')
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-black tracking-tighter">softcard.cc/</h1>
        
        <div className="flex bg-zinc-900 border border-zinc-800 p-2 rounded-2xl w-full max-w-md mx-auto">
          <input 
            className="bg-transparent flex-1 p-4 outline-none text-xl"
            placeholder="username"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
          />
          <button 
            onClick={() => router.push(`/login?username=${name}`)}
            className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition"
          >
            Claim
          </button>
        </div>
      </div>
    </main>
  )
}
