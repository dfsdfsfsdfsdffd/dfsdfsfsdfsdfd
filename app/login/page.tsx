'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) return alert(authError.message);
      if (authData.user) {
        const { error: dbError } = await supabase.from('profiles').insert({ 
          id: authData.user.id, 
          username: username 
        });
        if (dbError) return alert("DB Error: " + dbError.message);
        router.push('/start');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert(error.message);
      router.push('/start');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4 border border-neutral-800 p-8">
        <h2 className="text-xl font-bold uppercase text-center tracking-widest">Unbound</h2>
        {isSignUp && (
          <input type="text" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 p-3 outline-none" required />
        )}
        <input type="email" placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-700 p-3 outline-none" required />
        <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-700 p-3 outline-none" required />
        <button type="submit" className="w-full bg-white text-black font-bold p-3 uppercase hover:bg-gray-200">
          {isSignUp ? 'Create Character' : 'Login'}
        </button>
        <p className="text-center text-xs text-neutral-500 cursor-pointer" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account?' : 'Need an account?'}
        </p>
      </form>
    </div>
  );
}
