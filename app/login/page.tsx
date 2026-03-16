'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function LoginPage() {
  const supabase = createClientComponentClient();

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-[#111] border border-white/10 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">softcard.cc</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['github', 'discord']} // You can add these later
          redirectTo="http://softcard.cc/dashboard"
        />
      </div>
    </div>
  );
}