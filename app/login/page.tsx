'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // 1. Create the Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setLoading(false);
        return alert("Auth Error: " + authError.message);
      }

      if (authData?.user) {
        // 2. Insert into the public.profiles table
        // We use a small delay to ensure the session is active
        const { error: dbError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: username,
            hp: 100,
            gold: 10,
            level: 1
          });

        if (dbError) {
          setLoading(false);
          console.error("Full DB Error:", dbError);
          return alert(`Database Error: ${dbError.message} (Code: ${dbError.code})`);
        }

        router.push('/start');
      }
    } else {
      // Regular Login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setLoading(false);
        return alert("Login Error: " + loginError.message);
      }
      
      router.push('/start');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm p-8 border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-[0.2em]">Unbound</h1>
          <p className="text-neutral-500 text-xs mt-2 uppercase tracking-widest">
            {isSignUp ? 'Create your lineage' : 'Resume your journey'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[10px] text-neutral-500 uppercase mb-1 ml-1">Username</label>
              <input
                type="text"
                placeholder="Ex: Thane_Erik"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-neutral-800 p-3 text-sm focus:border-white outline-none transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] text-neutral-500 uppercase mb-1 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="herald@realm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-neutral-800 p-3 text-sm focus:border-white outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-500 uppercase mb-1 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-neutral-800 p-3 text-sm focus:border-white outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 uppercase tracking-widest text-sm hover:bg-neutral-200 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Processing...' : isSignUp ? 'Begin Odyssey' : 'Enter Void'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-neutral-500 text-[10px] uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4"
          >
            {isSignUp ? 'Already a member? Log In' : 'New traveler? Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
