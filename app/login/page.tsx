'use client';
import { Suspense } from 'react'; //
import { createBrowserClient } from '@supabase/ssr';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSearchParams } from 'next/navigation';

// Move the logic into a sub-component
function LoginContent() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const searchParams = useSearchParams();
  const claimedName = searchParams.get('claim');

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-black text-white mb-2 text-center italic tracking-tighter">SOFTCARD</h1>
      {claimedName && (
        <p className="text-zinc-400 text-center mb-6 text-sm">
          Sign up to claim <span className="text-white font-bold">softcard.cc/{claimedName}</span>
        </p>
      )}
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={[]}
        redirectTo={`${window.location.origin}/dashboard${claimedName ? `?claim=${claimedName}` : ''}`}
      />
    </div>
  );
}

// Wrap the page in Suspense to fix the Vercel Build Error
export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <Suspense fallback={<div className="text-white uppercase font-black italic">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
