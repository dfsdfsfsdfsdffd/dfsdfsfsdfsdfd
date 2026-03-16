"use client"
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Disc as Discord, ArrowRight, Sparkles } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false); const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    
    if (isSignUp) {
      // 1. Create Auth User
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { username: username.toLowerCase() } }
      })

      if (error) {
        alert(error.message); setLoading(false); return;
      }

      // 2. IMMEDIATELY create the database row (The "guns.lol" claim)
      if (data.user) {
        const { error: dbError } = await supabase.from('profiles').insert([{ 
          id: data.user.id, 
          username: username.toLowerCase(),
          is_published: true,
          links: []
        }])
        if (dbError) console.error(dbError)
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) router.push('/dashboard'); else alert(error.message)
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-[400px] space-y-10 animate-in fade-in zoom-in-95 duration-1000">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black italic tracking-tighter">softcard</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Claim your link in seconds.</p>
      </div>

      <div className="space-y-4">
        {/* Discord Login Option */}
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: `${window.location.origin}/dashboard` } })}
                className="w-full btn-main bg-[#5865F2] text-white hover:brightness-110 shadow-xl shadow-[#5865f2]/10">
          <Discord size={20} /> Continue with Discord
        </button>

        <div className="relative py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">or</div>

        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && <input placeholder="username" className="input-main uppercase italic font-black" value={username} onChange={e => setUsername(e.target.value)} required />}
          <input type="email" placeholder="email address" className="input-main" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="password" className="input-main" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="w-full btn-main bg-white text-black hover:bg-zinc-200 mt-4">
            {loading ? '...' : (isSignUp ? 'CLAIM MY LINK' : 'SIGN IN')} <ArrowRight size={18} />
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-xs font-bold text-zinc-500 hover:text-white transition-colors">
          {isSignUp ? "Already have an account? Login" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <div className="min-h-screen flex items-center justify-center p-6"><Suspense><LoginForm /></Suspense></div>
}
