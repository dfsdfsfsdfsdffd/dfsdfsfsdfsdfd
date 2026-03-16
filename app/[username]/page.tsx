import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) return notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />

      {/* Main Card */}
      <div className="w-full max-w-[450px] z-10 space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="bg-zinc-900/40 border border-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl text-center">
          {/* Avatar */}
          <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4 border-2 border-white/5 relative overflow-hidden">
             {profile.avatar_url ? (
               <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-zinc-800">
                 {profile.username[0].toUpperCase()}
               </div>
             )}
          </div>

          <h1 className="text-2xl font-black italic tracking-tight">{profile.display_name || `@${profile.username}`}</h1>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{profile.bio}</p>

          {/* Links Section */}
          <div className="mt-8 space-y-3">
            {profile.links?.map((link: any, i: number) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 hover:scale-[1.02] transition-all active:scale-95 text-center group"
              >
                <span className="group-hover:tracking-widest transition-all">{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer Branding */}
        <div className="text-center opacity-30 hover:opacity-100 transition-opacity">
          <a href="/" className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            Created with <span className="text-lg italic tracking-tighter">Softcard.cc</span>
          </a>
        </div>
      </div>
    </div>
  );
}
