import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
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
    return <div className="h-screen bg-black text-white flex items-center justify-center">404 | User Not Found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20 px-6">
      <div className="w-24 h-24 rounded-full bg-zinc-800 border border-white/10 mb-6" />
      <h1 className="text-4xl font-black italic uppercase italic">@{profile.username}</h1>
      <p className="text-zinc-500 mt-2">{profile.bio || 'Welcome to my profile'}</p>
      <div className="mt-12 w-full max-w-sm space-y-4">
        {profile.links?.map((link: any, i: number) => (
          <a key={i} href={link.url} target="_blank" className="block w-full p-4 bg-zinc-900 border border-white/5 text-center rounded-2xl hover:bg-white hover:text-black transition-all">
            <span className="font-bold uppercase tracking-tighter">{link.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
