import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function PublicProfile({ params }: { params: { username: string } }) {
  // 1. Fetch data from Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username.toLowerCase())
    .single()

  // 2. If the user doesn't exist, show 404
  if (!profile) return notFound()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20 px-6">
      <div className="w-20 h-20 bg-zinc-800 rounded-full mb-4 flex items-center justify-center text-2xl font-bold">
        {profile.username[0].toUpperCase()}
      </div>
      
      <h1 className="text-xl font-bold">@{profile.username}</h1>
      <p className="text-zinc-400 mt-2">{profile.bio}</p>

      <div className="w-full max-w-md mt-10 space-y-4">
        {profile.links?.map((link: any, i: number) => (
          <a 
            key={i}
            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
            target="_blank"
            className="block w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center hover:bg-zinc-800 transition"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
