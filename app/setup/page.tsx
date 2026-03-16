"use client"
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Palette, User, Link2, Image as ImageIcon, Check } from 'lucide-react'

function SetupWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '', bio: '', theme_color: '#3b82f6', links: [] as any[]
  });
  const router = useRouter();

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save everything at once
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: formData.username.toLowerCase(),
      bio: formData.bio,
      theme_color: formData.theme_color,
      links: formData.links,
      is_published: true
    });

    if (!error) router.push(`/${formData.username}`);
    else alert(error.message);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`w-12 h-1.5 rounded-full transition-all ${step >= i ? 'bg-blue-500' : 'bg-zinc-800'}`} />
        ))}
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {step === 1 && (
          <div className="space-y-6 text-center">
            <User className="mx-auto text-blue-500" size={48} />
            <h2 className="text-3xl font-black italic">Your profile</h2>
            <div className="space-y-4 text-left">
              <input 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-[22px] px-6 py-4 outline-none focus:border-blue-500" 
                placeholder="Display Name / Username" 
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
              <textarea 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-[22px] px-6 py-4 outline-none min-h-[120px]" 
                placeholder="Tell people about yourself..." 
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <ImageIcon className="mx-auto text-purple-500" size={48} />
            <h2 className="text-3xl font-black italic">Pick a background</h2>
            <div className="grid grid-cols-2 gap-4">
              {['#000', '#1a1a1a', '#2563eb', '#db2777'].map(color => (
                <button 
                  key={color} 
                  onClick={() => setFormData({...formData, theme_color: color})}
                  className={`h-24 rounded-[28px] border-4 ${formData.theme_color === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <Link2 className="mx-auto text-green-500" size={48} />
            <h2 className="text-3xl font-black italic">Add your socials</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setFormData({...formData, links: [...formData.links, { label: 'Discord', url: '' }]})}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-[22px] font-bold text-zinc-400 hover:text-white"
              >
                + Add Custom Link
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center">
            <Check className="mx-auto text-blue-500" size={64} />
            <h2 className="text-3xl font-black italic">Looks good?</h2>
            <p className="text-zinc-500">Your corner of the internet is ready.</p>
          </div>
        )}

        <div className="pt-8">
          <button 
            onClick={() => step < 4 ? setStep(step + 1) : handleComplete()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[24px] shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            {step === 4 ? 'LAUNCH SITE' : 'CONTINUE'}
          </button>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-full mt-4 text-zinc-500 font-bold hover:text-white">
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WizardPage() {
  return <Suspense><SetupWizard /></Suspense>
}