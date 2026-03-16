'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [profile, setProfile] = useState({ username: '', bio: '', instagram: '', tiktok: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return window.location.href = '/login'; // Redirect if not auth

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      ...profile,
      updated_at: new Date()
    });
    if (error) alert("Error saving!");
    else alert("Profile Live at softcard.cc/" + profile.username);
  };

  if (loading) return <div className="bg-black h-screen text-white p-10 font-mono">INITIALIZING...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-black italic tracking-tighter uppercase">Dashboard</h1>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')} className="text-xs uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full hover:bg-white hover:text-black transition">Logout</button>
        </header>

        <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2rem] space-y-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Your Vanity URL</label>
            <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-4 py-3">
              <span className="text-zinc-600 mr-1">softcard.cc/</span>
              <input value={profile.username} onChange={e => setProfile({...profile, username: e.target.value.toLowerCase()})} className="bg-transparent outline-none text-white w-full" placeholder="username" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Socials</label>
            <input value={profile.instagram} onChange={e => setProfile({...profile, instagram: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-white/20" placeholder="Instagram Username" />
            <input value={profile.tiktok} onChange={e => setProfile({...profile, tiktok: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-white/20" placeholder="TikTok Username" />
          </div>

          <button onClick={handleSave} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[0.98] transition-transform">Save Profile</button>
        </div>
      </div>
    </div>
  );
}
