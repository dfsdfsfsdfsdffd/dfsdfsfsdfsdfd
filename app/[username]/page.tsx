"use client"
import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'

const iconMap: any = {
  tiktok: "https://cdn.simpleicons.org/tiktok/ffffff",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
  x: "https://cdn.simpleicons.org/x/ffffff",
  youtube: "https://cdn.simpleicons.org/youtube/ffffff",
  twitch: "https://cdn.simpleicons.org/twitch/ffffff",
  discord: "https://cdn.simpleicons.org/discord/ffffff",
  github: "https://cdn.simpleicons.org/github/ffffff",
  spotify: "https://cdn.simpleicons.org/spotify/ffffff"
}

function getIcon(url: string) {
  const lower = url.toLowerCase();
  const found = Object.keys(iconMap).find(key => lower.includes(key));
  return found ? iconMap[found] : "https://cdn.simpleicons.org/pwa/ffffff";
}

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
      const { data } = await supabase.from('profiles').select('*').eq('username', params.username).single()
      setProfile(data)
    }
    loadProfile()
  }, [params.username])

  const handleEnter = () => {
    setHasEntered(true)
    if (audioRef.current) audioRef.current.play().catch(() => {});
    if (videoRef.current) videoRef.current.play().catch(() => {});
  }

  if (!profile) return null

  const socials = profile.links?.filter((l: any) => !l.url.includes('title') && (!l.title || l.title === "New Link")) || []

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh; width: 100vw; background: #000;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
        }
        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: bold; letter-spacing: 2px;
        }
        .bg-wrapper { position: absolute; inset: 0; z-index: 1; }
        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          ${profile.show_glass_card ? `
            background: rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.08);
          ` : 'background: transparent; border: none;'}
          padding: 40px; border-radius: 24px;
          width: 90%; max-width: 420px;
        }

        .pfp {
          width: 110px; height: 110px; 
          object-fit: cover;
          margin-bottom: 10px;
          border-radius: ${profile.avatar_shape === 'circle' ? '50%' : profile.avatar_shape === 'squircle' ? '25%' : '12px'};
          box-shadow: ${profile.accent_glow ? `0 0 40px ${profile.accent_color}` : 'none'};
        }

        .name-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
        }
        
        .display-name { 
          font-size: 32px; 
          font-weight: 600; 
          color: ${profile.name_color || '#ffffff'};
        }

        .bio { 
          font-size: 15px; 
          margin-top: 5px;
          margin-bottom: 15px;
          color: ${profile.bio_color || 'rgba(255,255,255,0.7)'}; 
        }

        .badge-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .badge {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        }

        .social-row { 
          display: flex; 
          justify-content: center; 
          gap: 15px; 
          margin-top: 25px; 
          flex-wrap: wrap;
        }
        .social-btn {
          width: 46px; height: 46px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          transition: 0.2s;
        }
        .social-btn:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        .social-icon { width: 22px; height: 22px; }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ CLICK TO ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" && <video ref={videoRef} src={profile.background_value} className="bg-content" loop muted playsInline />}
        {profile.background_type === "image" && <img src={profile.background_value} className="bg-content" />}
        {profile.background_type === "gradient" && <div className="bg-content" style={{background: profile.background_value}} />}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        <img src={profile.avatar_url} className="pfp" alt="profile" />
        
        <div className="name-row">
          <span className="display-name">{profile.display_name}</span>
        </div>

        <div className="bio">{profile.bio}</div>

        <div className="badge-row">
          {profile.badges?.user && <div className="badge">USER</div>}
          {profile.badges?.dev && (
            <div className="badge" style={{ borderColor: profile.accent_color, color: profile.accent_color }}>
              DEV
            </div>
          )}
        </div>

        <div className="social-row">
          {socials.map((l: any) => (
            <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" className="social-btn">
              <img src={getIcon(l.url)} className="social-icon" alt="icon" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
