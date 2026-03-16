"use client" // This MUST be the very first line

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, ExternalLink, LogOut } from 'lucide-react'

function DashboardContent() {
  const [links, setLinks] = useState([{ label: '', url: '' }])
  const [bio, setBio] = useState('')
  const [themeColor, setThemeColor] = useState('#0a0a0a')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      links, bio, theme_color: themeColor, is_published: true
    }).eq('id', user?.id)
    
    setSaving(false)
    if (!error) alert("Profile Live! ✨")
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Bubbly Header */}
        <header className="flex justify-between items-center bg-zinc-900/40 p-6 rounded-[32px] border border-zinc-800/50 backdrop-blur-xl">
          <div>
            <h1 className="text-xl font-black">softcard.cc/{username}</h1>
            <a href={`/${username}`} target="_blank" className="text-zinc-500 text-xs flex items-center gap-1 hover:text-white transition">
              view live <ExternalLink size={12} />
            </a>
          </div>
          <div className="flex gap-3">
             <button onClick={handleLogout} className="p-3 bg-zinc-800 rounded-full hover:bg-red-900/20 hover:text-red-500 transition-all">
                <LogOut size={18} />
             </button>
             <button onClick={save} className="bg-white text-black px-8 py-3 rounded-full font-black text-sm active:scale-95 transition-all shadow-xl shadow-white/5">
                {saving ? '...' : 'Publish'}
             </button>
          </div>
        </header>

        {/* Bubbly Bio */}
        <section className="space-y-3 px-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">Bio</label>
          <textarea 
            className="w-full bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-[28px] outline-none focus:border-zinc-500 transition-all min-h-[120px] resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something bubbly..."
          />
        </section>

        {/* Bubbly Links */}
        <section className="space-y-4 px-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">Links</label>
            <button onClick={() => setLinks([...links, { label: '', url: '' }])} className="text-zinc-400 hover:text-white transition text-xs flex items-center gap-1 font-bold">
              <Plus size={14} /> Add Link
            </button>
          </div>
          <div className="space-y-3">
            {links.map((link, i) => (
              <div key={i} className="group flex gap-3 items-center bg-zinc-900/20 border border-zinc-800/50 p-4 rounded-[24px] hover:border-zinc-700 transition-all">
                <div className="flex-1 space-y-1">
                  <input 
                    className="w-full bg-transparent px-2 outline-none text-sm font-bold placeholder:text-zinc-700"
                    placeholder="Link Name"
                    value={link.label}
                    onChange={(e) => { const n = [...links]; n[i].label = e.target.value; setLinks(n); }}
                  />
                  <input 
                    className="w-full bg-transparent px-2 outline-none text-xs text-zinc-500"
                    placeholder="URL (https://...)"
                    value={link.url}
                    onChange={(e) => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }}
                  />
                </div>
                <button onClick={() => {
                  const n = links.filter((_, idx) => idx !== i);
                  setLinks(n);
                }} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Bubbly Color */}
        <section className="space-y-3 px-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">Background</label>
          <div className="flex gap-4 items-center bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-[24px]">
            <input 
              type="color" 
              className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-full overflow-hidden"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
            />
            <span className="text-xs font-mono text-zinc-500 uppercase">{themeColor}</span>
          </div>
        </section>
      </div>
    </div>
  )
}

// 2. Wrap in Suspense to prevent the Prerender error
export default function DashboardPage() {
  return (
    <Suspense fallback={<div></div>}>
      <DashboardContent />
    </Suspense>
  )
}
