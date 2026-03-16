import { createClient } from '@supabase/supabase-js';

export default async function Page({ params }: { params: { username: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) return <div className="p-20 text-center text-white">404 | User not found</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20 font-sans">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter">@{profile.username}</h1>
      <p className="text-zinc-500 mt-2">{profile.bio || 'No bio yet'}</p>
      <div className="mt-10 w-full max-w-xs space-y-3">
        {profile.links?.map((link: any, i: number) => (
          <a key={i} href={link.url} target="_blank" className="block w-full p-4 bg-white/5 border border-white/10 text-center rounded-xl hover:bg-white/10 transition">
            {link.title}
          </a>
        ))}
      </div>
    </div>
  );
}
