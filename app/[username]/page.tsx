import { createClient } from '@supabase/supabase-js';

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  // In the newest Next.js, we have to "await" the params
  const { username } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white font-mono">
        404 | USER_NOT_FOUND
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20 px-6 font-sans">
      {/* Profile Header */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 mb-4" />
      <h1 className="text-3xl font-black italic uppercase tracking-tighter">@{profile.username}</h1>
      <p className="text-zinc-500 mt-2 text-sm">{profile.bio || 'No description provided.'}</p>

      {/* Social Links */}
      <div className="mt-10 w-full max-w-xs space-y-3">
        {profile.links?.map((link: any, i: number) => (
          <a 
            key={i} 
            href={link.url} 
            target="_blank" 
            className="block w-full p-4 bg-zinc-900/50 border border-white/5 text-center rounded-xl hover:bg-white hover:text-black hover:scale-105 transition-all duration-200"
          >
            {link.title}
          </a>
        ))}
      </div>
    </div>
  );
}
