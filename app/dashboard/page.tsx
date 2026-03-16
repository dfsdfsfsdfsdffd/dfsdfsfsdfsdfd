"use client"
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, LogOut, Layout, Save } from 'lucide-react'

function DashboardContent() {
  const [links, setLinks] = useState([{ label: '', url: '' }]); 
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('#000000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { 
        setBio(data.bio || ''); 
        setLinks(data.links || []); 
        setTheme(data.theme_color || '#000000'); 
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ links, bio, theme_color: theme }).eq('id', user?.id)
    setSaving(false); alert("Profile Updated! ✨")
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic animate-pulse text-2xl">SOFTCARD...</div>

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-2xl mx-auto space-y-8">
      <header className="card-glass p-6 flex justify-between items-center">
        <h2 className="font-black italic flex items-center gap-2"><Layout size={20}/> EDITOR</h2>
        <div className="flex gap-2">
          <button onClick={() => { supabase.auth.signOut(); router.push('/login') }} className="p-3 bg-zinc-800 rounded-2xl hover:text-red-500 transition-colors"><LogOut size={18}/></button>
          <button onClick={saveProfile} className="btn-main bg-white text-black py-2 px-6 text-sm flex items-center gap-2">
            <Save size={16}/> {saving ? '...' : 'SAVE'}
          </button>
        </div>
      </header>

      <section className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Description</label>
          <textarea className="input-main min-h-[100px] resize-none" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell them who you are..." />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center ml-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Social Links</label>
            <button onClick={() => setLinks([...links, { label: '', url: '' }])} className="text-xs font-bold hover:text-white text-zinc-500 flex items-center gap-1"><Plus size={14}/> Add Link</button>
          </div>
          {links.map((link, i) => (
            <div key={i} className="card-glass p-4 flex gap-3 items-center group animate-in slide-in-from-left-2 duration-300">
              <div className="flex-1 space-y-2">
                <input className="w-full bg-transparent outline-none font-bold text-sm" placeholder="Title (e.g. Discord)" value={link.label} onChange={e => { const n = [...links]; n[i].label = e.target.value; setLinks(n); }} />
                <input className="w-full bg-transparent outline-none text-xs text-zinc-500" placeholder="URL" value={link.url} onChange={e => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }} />
              </div>
              <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function DashboardPage() { return <Suspense><DashboardContent/></Suspense> }
