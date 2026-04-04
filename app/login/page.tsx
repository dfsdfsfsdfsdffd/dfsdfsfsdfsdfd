'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (!error) router.push('/game');
    else alert(error.message);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isLogin ? 'Welcome Back' : 'Create Hero'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            className="w-full p-3 bg-zinc-800 rounded-lg text-white outline-none focus:ring-2 ring-indigo-500"
            type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            className="w-full p-3 bg-zinc-800 rounded-lg text-white outline-none focus:ring-2 ring-indigo-500"
            type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-sm text-zinc-500 hover:text-white"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </main>
  );
}