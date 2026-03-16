"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      setProfile(data);
    }
    load();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    await supabase.from('profiles').update(profile).eq('id', profile.id);
    setSaving(false);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row p-4 gap-4">
      {/* LEFT: Editor */}
      <div className="w-full md:w-1/3 space-y-6 overflow-y-auto pr-2">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-600"></div>
          <h2 className="font-bold">Editor / {profile.username}</h2>
        </div>

        <div className="card-frost p-6 space-y-4">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bio</label>
          <textarea 
            className="input-frost min-h-[100px]" 
            value={profile.bio} 
            onChange={e => setProfile({...profile, bio: e.target.value})}
          />
          <button onClick={handleUpdate} className="btn-blue w-full py-3">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="hidden md:flex flex-1 card-frost bg-[#080808] relative overflow-hidden items-center justify-center border-zinc-800">
        {/* Mock Shader Background */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-900 to-black pointer-events-none" />
        
        <div className="relative text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-full bg-zinc-800 mx-auto border-4 border-blue-500 shadow-2xl shadow-blue-500/20" />
          <h1 className="text-3xl font-black italic">@{profile.username}</h1>
          <p className="text-zinc-400 max-w-xs">{profile.bio}</p>
          <div className="flex gap-2 justify-center">
             {/* Mock Links */}
             <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
             <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
          </div>
        </div>

        <div className="absolute bottom-6 right-6">
          <span className="text-[10px] font-bold text-zinc-600 uppercase">Live Preview</span>
        </div>
      </div>
    </div>
  );
}
