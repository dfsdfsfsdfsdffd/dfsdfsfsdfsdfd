"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Your supabase client

export default function Dashboard() {
  const [links, setLinks] = useState([{ label: '', url: '' }]);
  const [isPublished, setIsPublished] = useState(false);

  const addLink = () => setLinks([...links, { label: '', url: '' }]);

  const handlePublish = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('profiles')
      .update({ links, is_published: true })
      .eq('id', user?.id);
    
    if (!error) setIsPublished(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button 
            onClick={handlePublish}
            className={`px-6 py-2 rounded-full font-medium transition ${isPublished ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isPublished ? 'Published!' : 'Publish'}
          </button>
        </header>

        <div className="space-y-4">
          {links.map((link, i) => (
            <div key={i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex gap-4">
              <input 
                placeholder="Label (e.g. Instagram)" 
                className="bg-black border border-zinc-700 p-2 rounded-lg flex-1"
                onChange={(e) => {
                  const newLinks = [...links];
                  newLinks[i].label = e.target.value;
                  setLinks(newLinks);
                }}
              />
              <input 
                placeholder="URL" 
                className="bg-black border border-zinc-700 p-2 rounded-lg flex-1"
                onChange={(e) => {
                  const newLinks = [...links];
                  newLinks[i].url = e.target.value;
                  setLinks(newLinks);
                }}
              />
            </div>
          ))}
          <button onClick={addLink} className="w-full py-3 border-2 border-dashed border-zinc-700 rounded-xl text-zinc-500 hover:border-zinc-500 transition">
            + Add New Link
          </button>
        </div>
      </div>
    </div>
  );
}