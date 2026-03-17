"use client"
import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { User, Code } from "lucide-react"

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
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 500px;
          padding: 20px;
        }

        .pfp {
          width: 100px; height: 100px; 
          object-fit: cover;
          margin-bottom: 24px;
          border-radius: 50%;
          border: 2px solid ${profile.accent_color || 'rgba(255,255,255,0.4)'};
          box-shadow: ${profile.accent_glow ? `0 0 30px ${profile.accent_color}` : '0 0 15px rgba(0,0,0,0.5)'};
        }

        .display-name { 
          font-size: 32px; 
          font-weight: 700; 
          margin-bottom: 12px;
          color: ${profile.name_color || '#ffffff'};
          text-shadow: 0 0 10px rgba(0,0,0,0.5);
        }

        /* Badge Row - Increased spacing and size */
        .badge-row {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-bottom: 18px;
          min-height: 20px;
        }
        
        .badge-icon {
          position: relative;
          cursor: help;
          transition: 0.3s ease;
          opacity: 0.8;
        }
        .badge-icon:hover { 
          transform: scale(1.2); 
          opacity: 1; 
          filter: drop-shadow(0 0 8px ${profile.accent_color || '#ffffff'});
        }

        .badge-icon::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 150%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.9);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: 0.2s;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .badge-icon:hover::after { opacity: 1; }

        .bio { 
          font-size: 17px; 
          margin-bottom: 28px; 
          color: ${profile.bio_color || '#ffffff'}; 
          font-weight: 400;
          line-height: 1.5;
          max-width: 80%;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .tags-row { 
          display: flex; 
          flex-wrap: wrap; 
          justify-content: center; 
          gap: 12px; 
          margin-bottom: 32px;
          opacity: 0.7;
        }
        .tag { font-size: 14px; letter-spacing: 0.5px; }

        .social-row { 
          display: flex; 
          justify-content: center; 
          gap: 24px; 
        }

        .social-link {
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0.75;
        }
        .social-link:hover {
          opacity: 1;
          transform: translateY(-4px);
        }

        .social-icon { 
          width: 24px; 
          height: 24px; 
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
        }
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

        <div className="display-name">{profile.display_name}</div>

        <div className="badge-row">
          {profile.badges?.user && (
            <div className="badge-icon" data-tooltip="Verified User">
              <User size={18} strokeWidth={2} />
            </div>
          )}
          {profile.badges?.dev && (
            <div className="badge-icon" data-tooltip="Developer" style={{ color: profile.accent_color }}>
              <Code size={18} strokeWidth={2} />
            </div>
          )}
        </div>

        <div className="bio">{profile.bio}</div>

        <div className="tags-row">
          {profile.age && <span className="tag">{profile.age}</span>}
          {profile.gender && <span className="tag">{profile.gender}</span>}
          {profile.timezone && <span className="tag">{profile.timezone}</span>}
        </div>

        <div className="social-row">
          {socials.map((l: any) => (
            <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" className="social-link">
              <img src={getIcon(l.url)} className="social-icon" alt="icon" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
