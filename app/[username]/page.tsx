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

  const socials = profile.links?.filter((l: any) => !l.title || l.title === "New Link") || []
  const buttons = profile.links?.filter((l: any) => l.title && l.title !== "New Link") || []

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
          /* Respect the Glass Toggle from Dashboard */
          background: ${profile.show_glass_card ? 'rgba(0, 0, 0, 0.4)' : 'transparent'};
          backdrop-filter: ${profile.show_glass_card ? 'blur(12px)' : 'none'};
          border: ${profile.show_glass_card ? '1px solid rgba(255,255,255,0.1)' : 'none'};
          padding: 35px; border-radius: 20px;
          width: 90%; max-width: 400px;
          transition: all 0.3s ease;
        }

        .pfp {
          width: 90px; height: 90px; border-radius: 50%; object-fit: cover;
          margin-bottom: 15px; box-shadow: 0 0 30px ${profile.accent_color}88;
        }

        .name-container { 
          position: relative; 
          display: inline-block; 
          margin-bottom: 15px; 
        }
        .display-name { font-size: 26px; font-weight: 700; line-height: 1; }
        
        /* Adjusted Username Position */
        .username { 
          font-size: 12px; 
          opacity: 0.5; 
          position: absolute; 
          left: -45px; /* Pulls it over to the side like your reference */
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
        }

        .bio { font-size: 14px; opacity: 0.8; margin-bottom: 20px; }

        .badge-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .badge {
          padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1);
          text-transform: uppercase; letter-spacing: 1px;
        }

        .social-row { display: flex; justify-content: center; gap: 20px; align-items: center; }
        .social-icon { 
          width: 26px; height: 26px; 
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)); 
          transition: transform 0.2s;
        }
        .social-icon:hover { transform: scale(1.1); }

        .btn-list { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .link-btn {
          padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1); color: white; text-decoration: none;
          transition: background 0.2s;
        }
        .link-btn:hover { background: rgba(255,255,255,0.1); }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ CLICK TO ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" && <video ref={videoRef} src={profile.background_value} className="bg-content" loop muted playsInline />}
        {profile.background_type === "image" && <img src={profile.background_value} className="bg-content" />}
        {profile.background_type === "gradient" && <div className="bg-content" style={{background: profile.background_value}} />}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        <img src={profile.avatar_url} className="pfp" />
        
        <div className="name-container">
          <div className="username">@{profile.username}</div>
          <div className="display-name">{profile.display_name}</div>
        </div>

        <div className="badge-row">
          {profile.badges?.user && <div className="badge">User</div>}
          {profile.badges?.dev && <div className="badge" style={{borderColor: profile.accent_color, color: profile.accent_color}}>Dev</div>}
        </div>

        <div className="bio">{profile.bio}</div>

        <div className="social-row">
          {socials.map((l: any) => (
            <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank">
              <img src={getIcon(l.url)} className="social-icon" />
            </a>
          ))}
        </div>

        <div className="btn-list">
          {buttons.map((l: any) => (
            <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} className="link-btn" target="_blank">
              {l.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
