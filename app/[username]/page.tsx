import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', params.username.toLowerCase()).single()
  
  if (!profile) return notFound()

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 px-6 text-center" style={{ backgroundColor: profile.theme_color }}>
      <div className="w-24 h-24 rounded-[36px] bg-white/10 border border-white/20 backdrop-blur-md mb-6 flex items-center justify-center text-4xl font-black italic">
        {profile.username[0].toUpperCase()}
      </div>
      <h1 className="text-4xl font-black italic tracking-tighter">@{profile.username}</h1>
      <p className="text-white/60 mt-4 max-w-xs font-medium">{profile.bio}</p>

      <div className="w-full max-w-[400px] mt-12 space-y-4">
        {profile.links?.map((l: any, i: number) => (
          <a key={i} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank"
             className="block w-full p-5 bg-white/5 border border-white/10 rounded-[28px] font-bold hover:bg-white hover:text-black transition-all duration-500 hover:scale-[1.05] shadow-2xl">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  )
}
