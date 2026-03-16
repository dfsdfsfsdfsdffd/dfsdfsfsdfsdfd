'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [username, setUsername] = useState('');
  const [links, setLinks] = useState([{ title: '', url: '' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setUsername(data.username);
          setLinks(data.links || []);
        }
      }
      setLoading(false);
    }
    getUserData();
  }, [supabase]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in!");

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: username.toLowerCase().trim(),
      links: links
    });
    
    if (error) alert("Error: " + error.message);
    else alert("Saved! Check softcard.cc/" + username);
  };

  if (loading) return <div className="p-10 text-white bg-black h-screen">Loading...</div>;

  return (
    <div className="p-10 bg-black text-white min-h-screen font-sans">
      <h1 className="text-xl mb-6 font-bold">Claim Your Link</h1>
      <div className="max-w-md space-y-4">
        <input 
          className="bg-zinc-900 p-3 rounded-lg w-full border border-white/10 focus:border-white/30 outline-none" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="desired username" 
        />
        <button onClick={handleSave} className="bg-white text-black px-4 py-3 rounded-xl font-bold w-full hover:bg-zinc-200 transition">
          Save & Publish
        </button>
      </div>
    </div>
  );
}
