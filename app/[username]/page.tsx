import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) return notFound();

  return (
    // Main Container: Prevents the "big ass" look by centering everything
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden selection:bg-pink-200 selection:text-black">
      
      {/* BACKGROUND: Blurred & Dimmed */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110 blur-[80px] opacity-40 transition-all duration-700"
        style={{ backgroundImage: `url(${profile.bg_url || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853'})` }}
      />

      {/* CARD: This is the "Uniform" part. Max-width keeps it sleek on desktop. */}
      <div className="relative z-10 w-full max-w-[400px] aspect-[3/4] flex flex-col items-center justify-center px-8 text-center animate-in fade-in zoom-in duration-1000">
        
        {/* AVATAR: Circular with glow */}
        <div className="w-28 h-28 rounded-full border-[3px] border-white/10 overflow-hidden mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
            className="w-full h-full object-cover"
            alt="pfp"
          />
        </div>

        {/* IDENTITY */}
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white/90 tracking-tighter uppercase italic drop-shadow-md">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-white/30 text-xs font-medium tracking-[0.4em] mb-4">~♡</p>
        </div>

        {/* SOCIALS: Centered Pink Glow Icons */}
        <div className="flex gap-6 pt-4 items-center">
          {profile.instagram && (
            <a href={`https://instagram.com/${profile.instagram}`} className="text-pink-300/50 hover:text-pink-200 transition-all hover:drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
               <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          )}
        </div>

        {/* FOOTER: Viewcount */}
        <div className="absolute bottom-10 flex items-center gap-2 opacity-20 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
           507
        </div>
      </div>
    </div>
  );
}
