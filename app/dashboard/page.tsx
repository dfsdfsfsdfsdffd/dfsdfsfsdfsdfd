"use client";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main style={{ height: '100vh', backgroundColor: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <h1>hi</h1>
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', background: '#ff5cad', border: 'none', borderRadius: '8px', color: 'white' }}>
        Logout
      </button>
    </main>
  );
}
