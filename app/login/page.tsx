"use client"
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Create the Auth Account
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { username: username.toLowerCase() } }
    })

    if (error) { alert(error.message); setLoading(false); return; }

    // 2. Create the Profile Row (Crucial: This stops the NULL username issue)
    if (data.user) {
      await supabase.from('profiles').insert([{ 
        id: data.user.id, 
        username: username.toLowerCase(),
        is_published: true,
        links: [] 
      }])
      router.push('/dashboard')
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-[400px] space-y-10 animate-in fade-in zoom-in-95 duration-1000">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black italic tracking-tighter">softcard</h1>
        <p className="text-zinc-500 font-medium">Claim your link in seconds.</p>
      </div>

      <form onSubmit={handleClaim} className="space-y-3">
        <input placeholder="CHOOSE USERNAME" className="input-bubbly uppercase italic font-black text-center" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" className="input-bubbly" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="input-bubbly" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full btn-bubbly bg-white text-black hover:bg-zinc-200 mt-4">
          {loading ? 'CLAIMING...' : 'CLAIM MY LINK'} <ArrowRight size={18} />
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return <div className="min-h-screen flex items-center justify-center p-6"><Suspense><LoginForm /></Suspense></div>
}
