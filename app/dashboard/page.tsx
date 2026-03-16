"use client"
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, ExternalLink, LogOut, Layout } from 'lucide-react'

function DashboardContent() {
  const [links, setLinks] = useState([{ label: '', url: '' }]); const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('#000000'); const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login'); setUser(user);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setBio(data.bio || ''); setLinks(data.links || []); setTheme(data.theme_color || '#000000'); }
      setLoading(false);
    }
    init();
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from('profiles').upsert({ id: user.id, links, bio, theme_color: theme, is_published: true });
    setSaving(false); alert("Live! ✨");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic animate-pulse">SOFTCARD...</div>

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-2xl mx-auto space-y-8">
      <header className="bubbly-card p-6 flex justify-between items-center">
        <h2 className="font-black italic flex items-center gap-2"><Layout size={18}/> Dashboard</h2>
        <div className="flex gap-2">
          <button onClick={() => { supabase.auth.signOut(); router.push('/login') }} className="p-3 bg-zinc-800 rounded-2xl hover:text-red-500 transition-colors"><LogOut size={18}/></button>
          <button onClick={save} className="btn-bubbly bg-white text-black py-2 px-6 text-sm">{saving ? '...' : 'Publish'}</button>
        </div>
      </header>

      <div className="grid gap-6">
        <section className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Your Bio</p>
          <textarea className="input-bubbly min-h-[100px] resize-none" value={bio} onChange={e => setBio(e.target.value)} />
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center ml-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Links</p>
            <button onClick={() => setLinks([...links, { label: '', url: '' }])} className="text-xs font-bold hover:text-white text-zinc-500 flex items-center gap-1"><Plus size={14}/> Add</button>
          </div>
          {links.map((l, i) => (
            <div key={i} className="bubbly-card p-4 flex gap-3 items-center group">
              <div className="flex-1 space-y-2">
                <input className="w-full bg-transparent outline-none font-bold text-sm" placeholder="Title" value={l.label} onChange={e => { const n = [...links]; n[i].label = e.target.value; setLinks(n); }} />
                <input className="w-full bg-transparent outline-none text-xs text-zinc-500" placeholder="URL" value={l.url} onChange={e => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }} />
              </div>
              <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-zinc-700 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Background</p>
          <input type="color" className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 p-1 cursor-pointer" value={theme} onChange={e => setTheme(e.target.value)} />
        </section>
      </div>
    </div>
  )
}

export default function DashboardPage() { return <Suspense><DashboardContent/></Suspense> }
