import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', params.username).single();

  if (!profile) return notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative">
      {/* Subtle Scanline Effect Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-50 pointer-events-none bg-[length:100%_2px,3px_100%]" />

      <div className="w-full max-w-[420px] bg-zinc-900/30 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto border border-white/10" />
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">{profile.display_name}</h1>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">{profile.bio}</p>
        </div>

        <div className="mt-10 space-y-3">
          {profile.links?.map((link: any, i: number) => (
            <a key={i} href={link.url} className="block w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-center font-bold hover:bg-white hover:text-black transition-all duration-300">
              {link.label}
            </a>
          ))}
        </div>

        <div className="mt-12 text-center opacity-20 hover:opacity-100 transition-all cursor-default">
           <span className="text-[9px] uppercase tracking-[0.4em] font-black">Powered by Softcard</span>
        </div>
      </div>
    </div>
  );
}
