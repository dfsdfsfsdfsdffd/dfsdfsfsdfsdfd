'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase]);

  if (!user) return <div className="bg-black h-screen text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-black italic tracking-tighter italic uppercase">Welcome, {user.email}</h1>
      <p className="text-zinc-500 mt-4 font-bold">This is your private dashboard.</p>
    </div>
  );
}
