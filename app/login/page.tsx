// app/login/page.tsx
'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // 1. Check restricted usernames
      const restricted = ['home', 'login', 'start', 'admin', 'dashboard', 'settings'];
      if (restricted.includes(username.toLowerCase())) {
        return alert("That username is a forbidden word.");
      }

      // 2. Sign Up
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { username } } // Store username in metadata
      });

      if (error) return alert(error.message);
      
      // 3. Create profile entry
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, username });
        router.push('/start');
      }
    } else {
      // Login Logic
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert(error.message);
      router.push('/start');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <form onSubmit={handleAuth} className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-center uppercase">
          {isSignUp ? 'Create Identity' : 'Resume Journey'}
        </h2>
        
        <div className="space-y-4">
          {isSignUp && (
            <input type="text" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 p-4 focus:border-white outline-none font-mono" required />
          )}
          <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 p-4 focus:border-white outline-none font-mono" required />
          <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 p-4 focus:border-white outline-none font-mono" required />
        </div>

        <button type="submit" className="w-full bg-white text-black font-bold p-4 uppercase tracking-widest hover:bg-neutral-200">
          {isSignUp ? 'Confirm Registration' : 'Authenticate'}
        </button>

        <p className="text-center text-neutral-500 text-sm">
          {isSignUp ? 'Already a Thane?' : 'New to the realm?'} {' '}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-white underline underline-offset-4">
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </div>
  );
}