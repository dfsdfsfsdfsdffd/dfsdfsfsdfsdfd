'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [profile, setProfile] = useState<any>({ links: [] });

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user?.id, ...profile });
    alert("Saved.");
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-white selection:text-black">
      {/* Editor Area */}
      <div className="w-full max-w-md border-r border-white/5 p-10 space-y-10">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Softcard</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Identity</label>
            <input 
              className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-white/30 transition-all" 
              placeholder="Display Name"
              value={profile.display_name || ''}
              onChange={e => setProfile({...profile, display_name: e.target.value})}
            />
            <textarea 
              className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-white/30 transition-all h-24 resize-none" 
              placeholder="Short bio..."
              value={profile.bio || ''}
              onChange={e => setProfile({...profile, bio: e.target.value})}
            />
          </div>

          <button onClick={save} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">
            Save Profile
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 to-black flex items-center justify-center">
        <div className="w-[300px] h-[580px] bg-zinc-900/40 border border-white/10 rounded-[3rem] p-8 text-center backdrop-blur-xl">
           <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto mb-6 border border-white/5" />
           <h2 className="font-bold italic text-xl">{profile.display_name || 'Preview'}</h2>
           <p className="text-zinc-500 text-xs mt-2">{profile.bio || 'Your bio here'}</p>
        </div>
      </div>
    </div>
  );
}
