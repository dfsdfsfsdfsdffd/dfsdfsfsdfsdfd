"use client"
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Disc as Discord, ArrowRight, Sparkles } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false); const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { username: username.toLowerCase() } }
      })
      if (!error && data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, username: username.toLowerCase(), is_published: true })
        router.push('/dashboard')
      } else alert(error?.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) router.push('/dashboard'); else alert(error.message)
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-[400px] space-y-10 animate-in fade-in zoom-in-95 duration-1000">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-4"><Sparkles className="text-white" size={24} /></div>
        <h1 className="text-6xl font-black italic tracking-tighter">softcard</h1>
        <p className="text-zinc-500 font-medium tracking-tight">The only link you'll ever need.</p>
      </div>

      <div className="space-y-4">
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: `${window.location.origin}/dashboard` } })}
                className="w-full btn-bubbly bg-[#5865F2] text-white hover:brightness-110 shadow-2xl shadow-[#5865f2]/10">
          <Discord size={20} /> Continue with Discord
        </button>

        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && <input placeholder="username" className="input-bubbly" value={username} onChange={e => setUsername(e.target.value)} required />}
          <input type="email" placeholder="email" className="input-bubbly" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="password" className="input-bubbly" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="w-full btn-bubbly bg-white text-black hover:bg-zinc-200 mt-4">
            {loading ? '...' : (isSignUp ? 'Create' : 'Sign In')} <ArrowRight size={18} />
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-xs font-bold text-zinc-500 hover:text-white transition-colors">
          {isSignUp ? "Already a member? Login" : "New here? Create an account"}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <div className="min-h-screen flex items-center justify-center p-6"><Suspense><LoginForm /></Suspense></div>
}
