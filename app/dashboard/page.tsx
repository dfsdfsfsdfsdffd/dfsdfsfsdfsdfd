'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard() {
  const supabase = createClientComponentClient();
  const [username, setUsername] = useState('');
  const [links, setLinks] = useState([{ title: '', url: '' }]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      username: username.toLowerCase().trim(),
      links: links
    });
    if (error) alert("Username taken or error!");
    else alert("Saved! View at softcard.cc/" + username);
  };

  return (
    <div className="p-10 bg-black text-white min-h-screen">
      <h1 className="text-xl mb-4">Claim Username</h1>
      <input className="bg-zinc-800 p-2 rounded w-full mb-4" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
      <button onClick={handleSave} className="bg-white text-black px-4 py-2 rounded font-bold">Save Profile</button>
    </div>
  );
}