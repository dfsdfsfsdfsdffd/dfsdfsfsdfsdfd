"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, User, Globe, Layout } from 'lucide-react';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If no profile exists, send them to the setup wizard
      if (error || !data || !data.username) {
        router.push('/setup');
      } else {
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        bio: profile.bio,
        links: profile.links,
        theme_color: profile.theme_color
      })
      .eq('id', profile.id);

    setSaving(false);
    if (!error) alert("Updated instantly! check softcard.cc/" + profile.username);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row p-6 gap-6">
      {/* LEFT: The Editor (Image 6 Style) */}
      <div className="w-full md:w-[400px] space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Layout size={20}/></div>
          <h1 className="font-bold text-xl">Editor / {profile.username}</h1>
        </div>

        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-[28px] p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Bio</label>
            <textarea 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-blue-500 min-h-[120px] transition-all"
              value={profile.bio || ''}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={18}/> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* RIGHT: Live Preview (Auto-updates) */}
      <div className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-[32px] relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Live Preview</span>
        </div>

        {/* This mimics your public page */}
        <div className="text-center space-y-6 max-w-sm w-full p-8">
           <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-3xl font-black italic shadow-2xl" 
                style={{ borderColor: profile.theme_color }}>
             {profile.username[0].toUpperCase()}
           </div>
           <div>
             <h2 className="text-3xl font-black tracking-tighter">@{profile.username}</h2>
             <p className="text-zinc-500 mt-2 font-medium">{profile.bio || 'No bio set yet'}</p>
           </div>
           
           <div className="space-y-3">
             {profile.links?.map((l: any, i: number) => (
               <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl font-bold">
                 {l.label}
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
