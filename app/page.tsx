import { createClient } from '@supabase/supabase-js';

// This forces the page to load fresh every time (essential for dashboards)
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Simple test fetch
  const { data: profile } = await supabase.from('profiles').select('*').single();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
          Softcard<span className="text-zinc-500">.cc</span>
        </h1>
        
        <div className="p-8 border border-white/10 bg-zinc-900/50 rounded-3xl backdrop-blur-xl">
          <p className="text-zinc-400 mb-6">Welcome to your dashboard. If you see this, your deployment is live.</p>
          
          <div className="space-y-4">
            <a href="/login" className="block w-full py-4 bg-white text-black font-bold uppercase rounded-2xl hover:scale-[1.02] transition-transform">
              Go to Login
            </a>
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Status: Connected to Vercel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
