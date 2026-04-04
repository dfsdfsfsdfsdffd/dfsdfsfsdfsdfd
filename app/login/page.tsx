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
    const restricted = ['home', 'login', 'start', 'admin'];

    if (isSignUp) {
      if (restricted.includes(username.toLowerCase())) return alert("Name forbidden.");

      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { display_name: username } }
      });

      if (error) return alert(error.message);
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, username });
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
      <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4 border border-neutral-900 p-8">
        <h2 className="text-xl font-bold uppercase tracking-widest text-center">
          {isSignUp ? 'New Soul' : 'Returning Thane'}
        </h2>
        {isSignUp && (
          <input type="text" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 p-3 focus:border-white outline-none font-mono text-sm" required />
        )}
        <input type="email" placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 p-3 focus:border-white outline-none font-mono text-sm" required />
        <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 p-3 focus:border-white outline-none font-mono text-sm" required />
        <button type="submit" className="w-full bg-white text-black font-bold p-3 uppercase tracking-tighter hover:bg-gray-200">
          {isSignUp ? 'Begin Journey' : 'Authenticate'}
        </button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-xs text-neutral-500 uppercase tracking-widest hover:text-white">
          {isSignUp ? 'Already Have Account?' : 'Create New Account'}
        </button>
      </form>
    </div>
  );
}
