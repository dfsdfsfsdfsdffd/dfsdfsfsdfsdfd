'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Initializing the client here keeps us to 1 file
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      if (!isLogin) {
        setMessage('Check your email to confirm your account!');
        setLoading(false);
      } else {
        router.push('/game');
        router.refresh();
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
            Neon <span className="text-indigo-500">Quest</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            {isLogin ? 'Welcome back, Hero.' : 'Begin your journey today.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <input 
              required
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 outline-none focus:ring-2 ring-indigo-500 transition-all"
              type="email" 
              placeholder="Email Address" 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <input 
              required
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 outline-none focus:ring-2 ring-indigo-500 transition-all"
              type="password" 
              placeholder="Password" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          {message && (
            <p className="text-sm text-center text-indigo-400 font-medium bg-indigo-500/10 py-2 rounded-lg">
              {message}
            </p>
          )}

          <button 
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
          className="w-full mt-6 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}
