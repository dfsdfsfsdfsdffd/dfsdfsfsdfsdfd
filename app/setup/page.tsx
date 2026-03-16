"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ username: '', bio: '', theme: 'shader', color: '#3b82f6', socials: [] as any[] });
  const router = useRouter();

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleFinish = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: data.username.toLowerCase(),
      bio: data.bio,
      theme_color: data.color,
      is_published: true,
      links: data.socials
    });

    if (!error) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
      {/* Progress Dots */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-blue-500 w-4' : 'bg-zinc-800'} transition-all`} />
        ))}
      </div>

      <div className="w-full max-w-md text-center space-y-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Your profile</h2>
            <p className="text-zinc-500">Choose your unique handle and bio.</p>
            <input className="input-frost" placeholder="Username" value={data.username} onChange={e => setData({...data, username: e.target.value})} />
            <textarea className="input-frost min-h-[120px]" placeholder="Tell people about yourself..." onChange={e => setData({...data, bio: e.target.value})} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Pick a background</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Shader', 'Solid Color', 'Image', 'Video'].map(type => (
                <button key={type} onClick={() => setData({...data, theme: type.toLowerCase()})} className={`p-8 card-frost hover:border-blue-500 transition-all ${data.theme === type.toLowerCase() ? 'border-blue-500 bg-blue-500/5' : ''}`}>
                  <div className="text-sm font-bold">{type}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <h2 className="text-4xl font-bold">Choose a color</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#ef4444'].map(c => (
                <button key={c} onClick={() => setData({...data, color: c})} className={`w-10 h-10 rounded-full border-2 ${data.color === c ? 'border-white' : 'border-transparent'}`} style={{backgroundColor: c}} />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Add your socials</h2>
            <div className="grid grid-cols-4 gap-4">
              {['Discord', 'TikTok', 'Instagram', 'Twitter'].map(s => (
                <button key={s} className="p-4 card-frost flex items-center justify-center hover:bg-white/5 transition-all">
                  {s[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-8">
          {step > 1 && <button onClick={back} className="flex-1 font-bold text-zinc-500">Back</button>}
          <button onClick={step === 4 ? handleFinish : next} className="btn-blue flex-1">
            {step === 4 ? 'Looks Good' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
