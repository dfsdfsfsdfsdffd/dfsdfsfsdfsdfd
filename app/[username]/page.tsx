import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function PublicProfile({ params }: { params: { username: string } }) {
  // Fetch the profile based on the URL username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username.toLowerCase())
    .single()

  if (!profile) return notFound()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-24 px-6">
      {/* Profile Header */}
      <div className="w-24 h-24 rounded-full bg-zinc-800 border border-zinc-700 mb-6 flex items-center justify-center text-3xl font-bold uppercase">
        {profile.username[0]}
      </div>
      
      <h1 className="text-2xl font-bold">@{profile.username}</h1>
      <p className="text-zinc-500 mt-2 max-w-sm text-center">{profile.bio}</p>

      {/* Links List */}
      <div className="w-full max-w-[450px] mt-10 space-y-4">
        {profile.links?.map((link: any, i: number) => (
          <a 
            key={i}
            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
            target="_blank"
            className="block w-full p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center font-medium hover:scale-[1.02] hover:bg-zinc-800 transition-all active:scale-95"
          >
            {link.label}
          </a>
        ))}
      </div>
      
      <div className="mt-auto pb-10">
        <p className="text-zinc-700 text-xs font-bold tracking-widest uppercase">softcard.cc</p>
      </div>
    </div>
  )
}
