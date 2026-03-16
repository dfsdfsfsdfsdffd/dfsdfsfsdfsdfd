"use client"
import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'

export default function PublicProfile({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [hasEntered, setHasEntered] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single()
      setProfile(data)
    }
    loadProfile()
  }, [params.username, supabase])

  const handleEnter = () => {
    setHasEntered(true)
    // Sync Audio and Video start
    if (audioRef.current) audioRef.current.play()
    if (videoRef.current) videoRef.current.play()
  }

  if (!profile) return null

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh;
          width: 100vw;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: ${profile.font_family || 'Inter'}, sans-serif;
        }
        .overlay {
          position: fixed; inset: 0; background: #020617; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
        }
        .bg-wrapper {
          position: absolute; inset: 0; z-index: 1;
        }
        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        /* This fix ensures the profile stays on top */
        .profile-card {
          position: relative;
          z-index: 5; 
          text-align: center;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          width: 100%;
          max-width: 450px;
        }
        .pfp {
          width: 120px; height: 120px; border-radius: 50%;
          object-fit: cover; margin-bottom: 15px;
          box-shadow: 0 0 30px ${profile.accent_color};
        }
        .username-display {
          font-size: 14px; opacity: 0.7; letter-spacing: 1px; margin-bottom: 5px;
        }
        .display-name { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
        .bio { opacity: 0.8; margin-bottom: 20px; }
        .links { display: flex; flex-direction: column; gap: 10px; }
        .link-btn {
          padding: 12px; border-radius: 8px;
          background: ${profile.accent_color};
          color: white; text-decoration: none; font-weight: 600;
        }
      `}</style>

      {/* Enter Screen */}
      {!hasEntered && (
        <div className="overlay" onClick={handleEnter}>
          <p style={{letterSpacing: '4px'}}>[ CLICK TO ENTER ]</p>
        </div>
      )}

      {/* Background Layer */}
      <div className="bg-wrapper">
        {profile.background_type === "video" && (
          <video 
            ref={videoRef}
            src={profile.background_value} 
            className="bg-content"
            loop muted playsInline 
          />
        )}
        {profile.background_type === "image" && (
          <img src={profile.background_value} className="bg-content" />
        )}
        {profile.background_type === "gradient" && (
          <div className="bg-content" style={{background: profile.background_value}} />
        )}
      </div>

      {/* Audio Layer */}
      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      {/* Profile Layer (The Part that was missing) */}
      <div className="profile-card">
        <img src={profile.avatar_url} className="pfp" />
        
        {/* Shows the @username you wanted */}
        <div className="username-display">@{profile.username}</div>
        
        <div className="display-name">{profile.display_name}</div>
        <div className="bio">{profile.bio}</div>

        <div className="links">
          {profile.links?.map((link: any) => (
            <a key={link.id} href={link.url} className="link-btn" target="_blank">
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
