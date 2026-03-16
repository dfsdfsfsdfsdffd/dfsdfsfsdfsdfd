"use client"

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Disc as Discord, Mail, ArrowRight } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDiscordLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.toLowerCase() } }
      })
      if (!error && data.user) {
        await supabase.from('profiles').insert([{ id: data.user.id, username: username.toLowerCase() }])
        router.push('/dashboard')
      } else {
        alert(error?.message || "Check if username is taken")
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) router.push('/dashboard')
      else alert(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-[400px] space-y-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-black tracking-tighter italic">softcard</h1>
        <p className="text-zinc-500 font-medium">Claim your spot on the web.</p>
      </div>

      <div className="space-y-4">
        <button onClick={handleDiscordLogin} className="btn-main bg-[#5865F2] text-white hover:bg-[#4752C4]">
          <Discord size={20} />
          Continue with Discord
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800/50"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600">
            <span className="bg-[#050505] px-4">Direct Access</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && (
            <input 
              placeholder="desired username" 
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input 
            type="email" 
            placeholder="email address" 
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="password" 
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn-main bg-white text-black hover:bg-zinc-200 mt-4">
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            <ArrowRight size={18} />
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-xs font-bold text-zinc-500 hover:text-white transition-colors py-2"
        >
          {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="text-zinc-800 font-black italic animate-pulse">softcard...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
