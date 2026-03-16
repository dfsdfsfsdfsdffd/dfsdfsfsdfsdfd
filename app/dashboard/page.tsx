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

  return (
    <div className="p-10 bg-black text-white min-h-screen">
      <h1 className="text-xl mb-4">Claim Your Link</h1>
      <input 
        className="bg-zinc-800 p-2 rounded w-full mb-4 border border-white/10" 
        value={username} 
        onChange={e => setUsername(e.target.value)} 
        placeholder="username" 
      />
      <button onClick={handleSave} className="bg-white text-black px-4 py-2 rounded font-bold w-full">
        Save Profile
      </button>
    </div>
  );
}
