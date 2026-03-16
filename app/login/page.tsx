'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // This is the "Force Move" logic
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900/50 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
        <h1 className="text-3xl font-black italic text-white mb-8 text-center uppercase tracking-tighter">
          Soft<span className="text-zinc-600">card</span>
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: { default: { colors: { brand: '#ffffff', brandButtonText: '#000000' } } }
          }}
          theme="dark"
          providers={[]}
          // Make sure this matches your Supabase Dashboard EXACTLY
          redirectTo="https://dfsdfsfsdfsdfd-ten.vercel.app/dashboard"
        />
      </div>
    </div>
  );
}
