"use client"
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Plus, Save, Palette } from 'lucide-react'

function DashboardContent() {
  const [links, setLinks] = useState([{ label: '', url: '' }]); 
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('#000000');
  const [saving, setSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) { setBio(data.bio || ''); setLinks(data.links || []); setTheme(data.theme_color || '#000000'); }
      }
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ bio, links, theme_color: theme }).eq('id', user?.id)
    setSaving(false); alert("Published! ✨")
  }

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-black italic">EDITOR</h2>
        <button onClick={save} className="btn-bubbly bg-white text-black py-2 px-6">{saving ? '...' : 'PUBLISH'}</button>
      </header>

      <div className="card-bubbly space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Bio</label>
          <textarea className="input-bubbly min-h-[100px]" value={bio} onChange={e => setBio(e.target.value)} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Links</label>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-center bg-black/20 p-3 rounded-[22px] border border-zinc-800">
              <input className="bg-transparent outline-none flex-1 text-sm font-bold" placeholder="Title" value={link.label} onChange={e => { const n = [...links]; n[i].label = e.target.value; setLinks(n); }} />
              <input className="bg-transparent outline-none flex-1 text-xs text-zinc-500" placeholder="URL" value={link.url} onChange={e => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }} />
              <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))}><Trash2 size={16} className="text-zinc-600 hover:text-red-500"/></button>
            </div>
          ))}
          <button onClick={() => setLinks([...links, { label: '', url: '' }])} className="text-xs font-bold text-zinc-500 hover:text-white">+ ADD LINK</button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><Palette size={12}/> Background Color</label>
          <input type="color" className="w-full h-12 rounded-xl bg-zinc-900 border-none cursor-pointer" value={theme} onChange={e => setTheme(e.target.value)} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() { return <Suspense><DashboardContent/></Suspense> }
