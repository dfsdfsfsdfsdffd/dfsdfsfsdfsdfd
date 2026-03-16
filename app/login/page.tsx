'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function LoginPage() {
  const router = useRouter();

  // Create the client once and keep it in memory
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  // This helper ensures we redirect to the correct domain (Local, Vercel, or Softcard.cc)
  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? 
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
      window.location.origin;
    
    // Trim the trailing slash and add the callback path
    url = url.replace(/\/$/, '');
    return `${url}/auth/callback`;
  };

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
            variables: { 
              default: { 
                colors: { 
                  brand: '#ffffff', 
                  brandButtonText: '#000000',
                  inputBackground: 'transparent',
                  inputText: 'white',
                  inputBorder: '#27272a',
                } 
              } 
            }
          }}
          theme="dark"
          providers={[]}
          redirectTo={getURL()}
        />
      </div>
    </div>
  );
}
