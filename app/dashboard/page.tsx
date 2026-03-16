'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [profile, setProfile] = useState<any>(null);

  // Example: Saving a new link
  const addLink = async () => {
    const newLinks = [...(profile.links || []), { label: 'New Link', url: 'https://' }];
    await supabase.from('profiles').update({ links: newLinks }).eq('id', profile.id);
    setProfile({...profile, links: newLinks});
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar Editor */}
      <div className="w-full max-w-md border-r border-white/5 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8 italic">Customize Bio</h2>
        
        <div className="space-y-6">
          <section>
            <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest">Display Name</label>
            <input className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl mt-2 outline-none focus:border-white/40" placeholder="Display Name" />
          </section>

          <section>
            <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest">Links</label>
            {profile?.links?.map((link: any, i: number) => (
              <div key={i} className="mt-2 bg-zinc-900 p-4 rounded-xl border border-white/5">
                <input className="bg-transparent w-full font-bold outline-none" value={link.label} />
                <input className="bg-transparent w-full text-xs text-zinc-500 outline-none" value={link.url} />
              </div>
            ))}
            <button onClick={addLink} className="w-full mt-4 py-3 border border-dashed border-white/20 rounded-xl text-zinc-500 hover:text-white hover:border-white/40 transition-all">
              + Add New Link
            </button>
          </section>
        </div>
      </div>

      {/* Live Preview (The guns.lol feel) */}
      <div className="flex-1 flex items-center justify-center bg-zinc-950/50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />
        <div className="w-[320px] h-[600px] bg-zinc-900 border-[8px] border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden relative">
           <div className="p-8 text-center mt-12">
              <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto mb-4 border border-white/10" />
              <h3 className="font-bold text-lg">@username</h3>
              <div className="mt-8 space-y-3">
                <div className="w-full py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">Link 1</div>
                <div className="w-full py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">Link 2</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}