'use client';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function StartPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const selectClass = async (className: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { error } = await supabase.from('profiles').update({ class: className }).eq('id', user.id);
    if (error) return alert("Fate blocked your choice. Try again.");
    router.push('/play'); 
  };

  const roles = [
    { name: 'Vanguard', desc: 'Heavy armor, slow feet, iron will.' },
    { name: 'Inquisitor', desc: 'Forbidden knowledge and frail bones.' },
    { name: 'Outlaw', desc: 'Daggers in the dark. Gold over glory.' }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <h1 className="text-center text-2xl font-bold tracking-[0.5em] uppercase border-b border-neutral-900 pb-4">SELECT ORIGIN</h1>
        <div className="space-y-4">
          {roles.map((r) => (
            <button key={r.name} onClick={() => selectClass(r.name)}
              className="w-full p-6 border border-neutral-900 hover:border-white text-left group transition-all">
              <h2 className="text-lg font-bold group-hover:italic uppercase">{r.name}</h2>
              <p className="text-neutral-500 text-xs font-mono mt-1">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
