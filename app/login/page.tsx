'use client';
import { createBrowserClient } from '@supabase/ssr';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 border border-white/10 rounded-xl bg-zinc-900">
        <h1 className="text-2xl font-bold mb-4 text-center">softcard.cc</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          showLinks={false}
          redirectTo="https://softcard.cc/dashboard"
        />
      </div>
    </div>
  );
}
