'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [profile, setProfile] = useState({ username: '', bio: '', instagram: '', tiktok: '', bg_url: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return window.location.href = '/login';

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      ...profile,
      updated_at: new Date()
    });
    if (error) alert(error.message);
    else alert("Success! Your profile is live.");
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic uppercase tracking-tighter">Initializing...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 selection:bg-white selection:text-black">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Soft<span className="text-zinc-600">card</span></h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mt-1 font-bold">Project Dashboard</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-6 py-2 rounded-full hover:bg-zinc-200 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6">
          {/* URL Section */}
          <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Profile Identity</h2>
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-bold text-zinc-600 uppercase mb-2 block ml-1">Claimed URL</label>
                <div className="flex items-center bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-white/30 transition">
                  <span className="text-zinc-500 font-bold">softcard.cc/</span>
                  <input 
                    value={profile.username} 
                    onChange={e => setProfile({...profile, username: e.target.value.toLowerCase()})}
                    className="bg-transparent outline-none flex-1 font-bold text-lg ml-1" 
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customization Section */}
          <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Customization</h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase mb-2 block ml-1">Background Image URL</label>
                <input 
                  value={profile.bg_url} 
                  onChange={e => setProfile({...profile, bg_url: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none font-bold focus:border-white/30 transition" 
                  placeholder="https://images.com/your-bg.jpg"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase mb-2 block ml-1">Instagram Handle</label>
                <input 
                  value={profile.instagram} 
                  onChange={e => setProfile({...profile, instagram: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none font-bold focus:border-white/30 transition" 
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:scale-[0.99] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Deploy Changes
          </button>
        </div>

      </div>
    </div>
  );
}
