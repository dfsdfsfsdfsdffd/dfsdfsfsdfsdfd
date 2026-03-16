"use client" // Switch to client component for audio handling
import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'

export default function PublicProfile({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [hasEntered, setHasEntered] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('username', params.username).single()
      setProfile(data)
    }
    load()
  }, [params.username])

  const handleEnter = () => {
    setHasEntered(true)
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e))
    }
  }

  if (!profile) return null

  return (
    <div className="public-profile">
      <style dangerouslySetInnerHTML={{ __html: `
        .enter-overlay {
          position: fixed; inset: 0; background: #020617; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
        }
        .profile-content { 
          opacity: ${hasEntered ? 1 : 0}; 
          transition: opacity 1s ease;
        }
        /* ... existing CSS from previous turn ... */
      `}} />

      {/* CLICK TO ENTER (Enables Audio) */}
      {!hasEntered && (
        <div className="enter-overlay" onClick={handleEnter}>
          <div style={{textAlign: 'center'}}>
            <p style={{letterSpacing: '2px', opacity: 0.6}}>[ CLICK TO ENTER ]</p>
          </div>
        </div>
      )}

      {profile.audio_url && (
        <audio ref={audioRef} src={profile.audio_url} loop />
      )}

      <div className="profile-content">
         {/* Render your background and profile info here exactly like the dashboard preview */}
         <div className="bg-layer">
            {profile.background_type === "video" && <video src={profile.background_value} autoPlay loop muted playsInline />}
            {/* ... other bg types */}
         </div>
         
         <div className="profile-card">
            <img src={profile.avatar_url} className="pfp" style={{boxShadow: `0 0 40px ${profile.accent_color}`}} />
            <h1 className="name">{profile.display_name}</h1>
            <p className="bio">{profile.bio}</p>
            {/* links mapping... */}
         </div>
      </div>
    </div>
  )
}
