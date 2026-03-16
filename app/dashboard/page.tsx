'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';

export default function Dashboard() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: searchParams.get('claim') || '',
    display_name: '',
    bio: '',
    links: [] as { label: string; url: string }[]
  });

  // Fetch existing profile on load
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  // THE SAVE FUNCTION
  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in");

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    });

    if (error) alert(error.message);
    else alert("Profile updated successfully!");
  };

  if (loading) return <div className="bg-black h-screen" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Editor Side */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black italic uppercase">Edit Bio</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Username</label>
              <input 
                className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl mt-2 outline-none"
                value={profile.username}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Display Name</label>
              <input 
                className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl mt-2 outline-none"
                value={profile.display_name}
                onChange={(e) => setProfile({...profile, display_name: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={saveProfile}
            className="w-full py-4 bg-white text-black font-black uppercase rounded-2xl hover:bg-zinc-200 transition-all"
          >
            Save Changes
          </button>
        </div>

        {/* Live Preview (Visual Only) */}
        <div className="hidden md:flex items-center justify-center bg-zinc-900/50 rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="text-center">
                <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto mb-4 border border-white/10" />
                <h3 className="font-bold">@{profile.username || 'username'}</h3>
                <p className="text-zinc-500 text-sm">{profile.display_name}</p>
            </div>
        </div>

      </div>
    </div>
  );
}
