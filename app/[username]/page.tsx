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
  const accent = profile.accent_color || '#7000ff';

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh; width: 100vw; background: #050505;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
        }

        /* --- DYNAMIC GRADIENT BG --- */
        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        
        .animated-bg {
          width: 100%; height: 100%;
          background: radial-gradient(circle at 50% 50%, ${accent}33 0%, #000 70%);
          position: relative;
        }
        
        .animated-bg::before {
          content: "";
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at center, ${accent}22 0%, transparent 50%);
          animation: rotate 15s linear infinite;
          filter: blur(80px);
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        /* --- CARD --- */
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 500px;
          padding: 40px;
        }

        .pfp {
          width: 110px; height: 110px; 
          object-fit: cover; margin-bottom: 25px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.1);
          box-shadow: ${profile.accent_glow ? `0 0 40px ${accent}66` : '0 10px 30px rgba(0,0,0,0.5)'};
        }

        .display-name { 
          font-size: 36px; font-weight: 800; margin-bottom: 15px;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.5px;
        }

        .bio { 
          font-size: 18px; margin-bottom: 25px; 
          color: ${profile.bio_color || 'rgba(255,255,255,0.8)'}; 
          max-width: 85%; line-height: 1.4;
        }

        /* --- BADGES (Back where they were) --- */
        .badge-row {
          display: flex; justify-content: center; gap: 10px; margin-bottom: 25px;
        }
        
        .badge {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 14px; border-radius: 8px;
          font-size: 11px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase;
          transition: 0.3s;
        }
        .badge:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }

        .tags-row { 
          display: flex; flex-wrap: wrap; justify-content: center; 
          gap: 15px; margin-bottom: 35px; opacity: 0.6;
        }
        .tag { font-size: 14px; font-weight: 500; }

        .social-row { display: flex; justify-content: center; gap: 28px; }
        .social-link { transition: 0.3s; opacity: 0.7; }
        .social-link:hover { opacity: 1; transform: scale(1.15); }
        .social-icon { width: 24px; height: 24px; }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: bold; letter-spacing: 4px; font-size: 12px;
        }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" ? (
          <video ref={videoRef} src={profile.background_value} className="bg-content" loop muted playsInline />
        ) : profile.background_type === "image" ? (
          <img src={profile.background_value} className="bg-content" alt="bg" />
        ) : (
          <div className="animated-bg" />
        )}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        <img src={profile.avatar_url} className="pfp" alt="profile" />
        <div className="display-name">{profile.display_name}</div>
        
        <div className="bio">{profile.bio}</div>

        <div className="badge-row">
          {profile.badges?.user && <div className="badge">USER</div>}
          {profile.badges?.dev && (
            <div className="badge" style={{ borderColor: accent, color: accent }}>DEV</div>
          )}
        </div>

        <div className="tags-row">
          {profile.age && <span className="tag">🎂 {profile.age}</span>}
          {profile.gender && <span className="tag">⚥ {profile.gender}</span>}
          {profile.timezone && <span className="tag">🌍 {profile.timezone}</span>}
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
