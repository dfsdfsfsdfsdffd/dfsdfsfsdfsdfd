// app/start/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function StartPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const selectClass = async (className: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({ class: className }).eq('id', user.id);
    router.push('/play'); // Where the actual game happens
  };

  const classes = [
    { name: 'Vanguard', desc: 'A heavy-plated defender. High HP, Low Agility.', color: 'border-red-900' },
    { name: 'Inquisitor', desc: 'Master of runes and lore. High Mind, Low Strength.', color: 'border-blue-900' },
    { name: 'Outlaw', desc: 'A shadow on the road. High Speed, Low Defense.', color: 'border-green-900' }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-12">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase">Origin Selection</h1>
          <p className="text-neutral-600 font-mono text-xs italic">Your lineage determines your initial stats.</p>
        </header>

        <div className="grid gap-4">
          {classes.map((cls) => (
            <button key={cls.name} onClick={() => selectClass(cls.name)}
              className={`group w-full p-8 border border-neutral-900 hover:border-neutral-500 text-left transition-all hover:bg-neutral-950`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black uppercase tracking-widest group-hover:text-white text-neutral-400">
                  {cls.name}
                </h3>
                <span className="text-[10px] text-neutral-700 group-hover:text-neutral-500">[ SELECT ]</span>
              </div>
              <p className="text-neutral-600 text-sm font-mono leading-relaxed group-hover:text-neutral-400">
                {cls.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}