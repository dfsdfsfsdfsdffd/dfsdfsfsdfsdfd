import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { username: string } }) {
  const username = params.username;

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
    return <div className="h-screen bg-black text-white flex items-center justify-center font-mono uppercase tracking-widest">404 // user_not_found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center selection:bg-white selection:text-black">
      <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 mb-6 shadow-2xl" />
      <h1 className="text-4xl font-black italic tracking-tighter uppercase">@{profile.username}</h1>
      <p className="text-zinc-500 mt-2 font-medium">{profile.bio || 'Link in bio.'}</p>

      <div className="mt-12 w-full max-w-sm space-y-4">
        {profile.links?.map((link: any, i: number) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            className="group block w-full p-4 border border-white/10 bg-zinc-900/50 rounded-2xl text-center transition-all hover:bg-white hover:text-black hover:scale-[1.02]"
          >
            <span className="font-bold uppercase tracking-tight">{link.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
