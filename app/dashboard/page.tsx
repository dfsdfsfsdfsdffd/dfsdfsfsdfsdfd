'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [profile, setProfile] = useState<any>({
    username: '',
    display_name: '',
    bio: '',
    links: []
  });

  // Load existing data
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  // THE SAVE FUNCTION
  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Not logged in");

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: profile.username.toLowerCase(),
      display_name: profile.display_name,
      bio: profile.bio,
      links: profile.links,
      updated_at: new Date().toISOString(),
    });

    if (error) alert(error.message);
    else alert("Profile Live!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans selection:bg-white selection:text-black">
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Dashboard</h1>
        
        <div className="space-y-4">
          <input 
            className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl outline-none focus:border-white/40" 
            placeholder="username"
            value={profile.username}
            onChange={e => setProfile({...profile, username: e.target.value})}
          />
          <input 
            className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl outline-none focus:border-white/40" 
            placeholder="Display Name"
            value={profile.display_name}
            onChange={e => setProfile({...profile, display_name: e.target.value})}
          />
          <textarea 
            className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl outline-none focus:border-white/40 h-32" 
            placeholder="Bio"
            value={profile.bio}
            onChange={e => setProfile({...profile, bio: e.target.value})}
          />
          
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:invert transition-all"
          >
            Save & Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
