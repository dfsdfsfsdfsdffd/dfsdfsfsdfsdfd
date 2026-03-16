"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, ExternalLink } from 'lucide-react'

export default function Dashboard() {
  const [links, setLinks] = useState([{ label: '', url: '' }])
  const [bio, setBio] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setUsername(data.username)
      if (data.links) setLinks(data.links)
      setBio(data.bio || '')
    }
    setLoading(false)
  }

  const addLink = () => setLinks([...links, { label: '', url: '' }])
  
  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    setLinks(newLinks)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({ 
      links, 
      bio, 
      is_published: true,
      updated_at: new Date() 
    }).eq('id', user?.id)
    
    setSaving(false)
    if (!error) alert("Profile Published!")
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading editor...</div>

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold">softcard.cc/{username}</h1>
            <a href={`/${username}`} target="_blank" className="text-zinc-500 text-sm flex items-center gap-1 hover:text-white transition">
              View public page <ExternalLink size={14} />
            </a>
          </div>
          <button 
            onClick={saveProfile} 
            className="bg-white text-black px-8 py-2.5 rounded-full font-bold hover:bg-zinc-200 transition shadow-lg shadow-white/5"
          >
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>

        {/* Bio Section */}
        <section className="space-y-3">
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Your Bio</label>
          <textarea 
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-zinc-600 transition h-24 resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What's on your mind?"
          />
        </section>

        {/* Links Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Links</label>
            <button onClick={addLink} className="text-zinc-400 hover:text-white transition flex items-center gap-1 text-sm">
              <Plus size={16} /> Add Link
            </button>
          </div>

          <div className="space-y-3">
            {links.map((link, i) => (
              <div key={i} className="flex gap-3 items-center bg-zinc-900/30 p-3 rounded-2xl border border-zinc-800">
                <div className="flex-1 space-y-2">
                  <input 
                    className="w-full bg-transparent p-1 outline-none text-sm font-bold placeholder:text-zinc-700"
                    placeholder="Title (e.g. Discord)"
                    value={link.label}
                    onChange={(e) => {
                      const n = [...links]; n[i].label = e.target.value; setLinks(n)
                    }}
                  />
                  <input 
                    className="w-full bg-transparent p-1 outline-none text-xs text-zinc-500"
                    placeholder="URL (https://...)"
                    value={link.url}
                    onChange={(e) => {
                      const n = [...links]; n[i].url = e.target.value; setLinks(n)
                    }}
                  />
                </div>
                <button onClick={() => removeLink(i)} className="text-zinc-600 hover:text-red-400 transition p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
