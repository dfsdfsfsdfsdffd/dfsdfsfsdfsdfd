import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user data based on the URL parameter
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) return notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))] z-50 pointer-events-none bg-[length:100%_2px,3px_100%]" />
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-800/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-[420px] z-10 space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="bg-zinc-900/30 border border-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-2xl text-center">
          {/* Avatar Placeholder */}
          <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-6 border border-white/10 flex items-center justify-center text-3xl font-black italic">
            {profile.username[0].toUpperCase()}
          </div>

          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
            {profile.display_name || `@${profile.username}`}
          </h1>
          <p className="text-zinc-500 text-sm mt-3 font-medium leading-relaxed">
            {profile.bio || "No bio yet."}
          </p>

          {/* Dynamic Links */}
          <div className="mt-10 space-y-3">
            {profile.links?.map((link: any, i: number) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 px-6 bg-white/5 border border-white/5 rounded-2xl font-bold hover:bg-white hover:text-black transition-all duration-300 text-center group"
              >
                <span className="group-hover:tracking-widest transition-all">{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="text-center opacity-20 hover:opacity-100 transition-opacity">
          <a href="/" className="text-[9px] font-black uppercase tracking-[0.4em]">
            Softcard<span className="text-zinc-500">.cc</span>
          </a>
        </div>
      </div>
    </div>
  );
}
