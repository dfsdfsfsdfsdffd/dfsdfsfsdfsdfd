"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [links, setLinks] = useState([{ label: '', url: '' }])
  const [bio, setBio] = useState('')
  const [themeColor, setThemeColor] = useState('#0a0a0a')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setUsername(data.username)
        setBio(data.bio || '')
        setLinks(data.links || [{ label: '', url: '' }])
        setThemeColor(data.theme_color || '#0a0a0a')
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      links, bio, theme_color: themeColor, is_published: true
    }).eq('id', user?.id)
    
    if (!error) alert("Profile Live!")
  }

  if (loading) return <div className="p-10 text-zinc-500">Loading your profile...</div>

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-xl mx-auto space-y-10">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-bold">softcard.cc/{username}</h1>
        <button onClick={save} className="bg-white text-black px-6 py-2 rounded-full font-bold">Publish</button>
      </header>

      <section className="space-y-4">
        <label className="text-xs text-zinc-500 font-bold uppercase">Bio</label>
        <textarea 
          className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </section>

      <section className="space-y-4">
        <div className="flex justify-between">
          <label className="text-xs text-zinc-500 font-bold uppercase">Links</label>
          <button onClick={() => setLinks([...links, { label: '', url: '' }])} className="text-xs text-zinc-400">+ Add</button>
        </div>
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input 
              className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex-1"
              placeholder="Label"
              value={link.label}
              onChange={(e) => { const n = [...links]; n[i].label = e.target.value; setLinks(n); }}
            />
            <input 
              className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex-1"
              placeholder="URL"
              value={link.url}
              onChange={(e) => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }}
            />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <label className="text-xs text-zinc-500 font-bold uppercase">Background Color</label>
        <input 
          type="color" 
          className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-1 cursor-pointer"
          value={themeColor}
          onChange={(e) => setThemeColor(e.target.value)}
        />
      </section>
    </div>
  )
}
