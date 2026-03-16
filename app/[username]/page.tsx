import { createClient } from '@supabase/supabase-js';

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', params.username).single();

  if (!profile) return <div className="text-white text-center mt-20">User not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20">
      <h1 className="text-3xl font-bold italic">@{profile.username}</h1>
      <div className="mt-10 w-full max-w-xs space-y-4">
        {profile.links?.map((link: any, i: number) => (
          <a key={i} href={link.url} className="block w-full p-4 border border-white/20 text-center rounded-full hover:bg-white hover:text-black transition">
            {link.title}
          </a>
        ))}
      </div>
    </div>
  );
}