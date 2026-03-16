'use client';
import { createBrowserClient } from '@supabase/ssr';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const searchParams = useSearchParams();
  const claimedName = searchParams.get('claim');

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2 text-center italic tracking-tighter">SOFTCARD</h1>
        {claimedName && (
          <p className="text-zinc-400 text-center mb-6 text-sm">
            Sign up to claim <span className="text-white font-bold">softcard.cc/{claimedName}</span>
          </p>
        )}
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#ffffff',
                  brandAccent: '#e4e4e7',
                }
              }
            }
          }}
          theme="dark"
          providers={[]}
          // This redirects them to the dashboard to finish setup
          redirectTo={`${window.location.origin}/dashboard${claimedName ? `?claim=${claimedName}` : ''}`}
        />
      </div>
    </div>
  );
}
