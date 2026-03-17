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
        
        /* --- MINIMALIST CARD (IMAGE 3 STYLE) --- */
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 400px;
        }

        .pfp {
          width: 85px; height: 85px; 
          object-fit: cover;
          margin-bottom: 15px;
          border-radius: 50%;
          border: 2px solid ${profile.accent_color || 'rgba(255,255,255,0.2)'};
          box-shadow: ${profile.accent_glow ? `0 0 20px ${profile.accent_color}` : 'none'};
        }

        .display-name { 
          font-size: 24px; 
          font-weight: 700; 
          margin-bottom: 4px;
          color: ${profile.name_color || '#ffffff'}; 
        }

        /* Badge Row (Placed where the eye icon was) */
        .badge-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
          opacity: 0.8;
        }
        
        .badge-icon {
          position: relative;
          cursor: help;
          transition: 0.2s;
        }
        .badge-icon:hover { transform: scale(1.1); opacity: 1; }

        /* Simple Tooltip */
        .badge-icon::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 130%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.9);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: 0.2s;
        }
        .badge-icon:hover::after { opacity: 1; }

        .bio { 
          font-size: 14px; 
          margin-bottom: 20px; 
          color: ${profile.bio_color || '#ffffff'}; 
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .social-row { 
          display: flex; 
          justify-content: center; 
          gap: 18px; 
          margin-top: 5px; 
        }

        .social-link {
          transition: 0.2s;
          opacity: 0.8;
        }
        .social-link:hover {
          opacity: 1;
          transform: translateY(-2px);
        }

        .social-icon { 
          width: 20px; 
          height: 20px; 
          filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
        }

        /* Simple Tag Style */
        .tags-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 15px; }
        .tag { font-size: 12px; opacity: 0.7; }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ CLICK TO ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" && <video ref={videoRef} src={profile.background_value} className="bg-content" loop muted playsInline />}
        {profile.background_type === "image" && <img src={profile.background_value} className="bg-content" />}
        {profile.background_type === "gradient" && <div className="bg-content" style={{background: profile.background_value}} />}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        {/* Profile Picture */}
        <img src={profile.avatar_url} className="pfp" alt="profile" />

        {/* Name */}
        <div className="display-name">{profile.display_name}</div>

        {/* Badge Row (Eye icon replacement) */}
        {(profile.badges?.user || profile.badges?.dev) && (
          <div className="badge-row">
            {profile.badges?.user && (
              <div className="badge-icon" data-tooltip="Verified User">
                <User size={14} strokeWidth={2.5} />
              </div>
            )}
            {profile.badges?.dev && (
              <div className="badge-icon" data-tooltip="Developer" style={{ color: profile.accent_color }}>
                <Code size={14} strokeWidth={2.5} />
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        <div className="bio">{profile.bio}</div>

        {/* Tags (Age, Gender, etc.) */}
        <div className="tags-row">
          {profile.age && <span className="tag">{profile.age}</span>}
          {profile.gender && <span className="tag">{profile.gender}</span>}
          {profile.timezone && <span className="tag">{profile.timezone}</span>}
        </div>

        {/* Social Icons (Floating Glyph Style) */}
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
