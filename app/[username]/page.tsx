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
          height: 100vh; width: 100vw; background: #000;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
        }

        /* --- DYNAMIC BLURRED GRADIENT BACKGROUND --- */
        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        
        .animated-bg {
          width: 100%; height: 100%;
          background: #000;
          position: relative;
        }
        
        .blob {
          position: absolute;
          width: 500px; height: 500px;
          background: ${accent};
          filter: blur(120px);
          border-radius: 50%;
          opacity: 0.35;
          animation: move 20s infinite alternate;
        }

        .blob-2 {
          position: absolute;
          bottom: -100px; right: -100px;
          width: 600px; height: 600px;
          background: ${accent};
          filter: blur(150px);
          border-radius: 50%;
          opacity: 0.25;
          animation: move 25s infinite alternate-reverse;
        }

        @keyframes move {
          from { transform: translate(-10%, -10%) scale(1); }
          to { transform: translate(20%, 20%) scale(1.2); }
        }

        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        /* --- MAIN CARD --- */
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 550px;
          padding: 60px 40px;
          background: transparent;
        }

        /* --- FLOATING BADGES (TOP RIGHT) --- */
        .floating-badges {
          position: absolute;
          top: 25px;
          right: 25px;
          display: flex;
          gap: 12px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .badge-icon {
          opacity: 0.75;
          transition: 0.3s;
          cursor: help;
        }
        .badge-icon:hover { opacity: 1; transform: scale(1.15); }

        .pfp {
          width: 130px; height: 130px; 
          object-fit: cover; margin-bottom: 30px;
          border-radius: 50%;
          border: 3px solid ${accent};
          box-shadow: 0 0 40px ${accent}44;
        }

        .display-name { 
          font-size: 42px; font-weight: 800; margin-bottom: 12px;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -1px;
          text-shadow: 0 0 20px rgba(0,0,0,0.6);
        }

        .bio { 
          font-size: 20px; margin-bottom: 35px; 
          color: ${profile.bio_color || 'rgba(255,255,255,0.9)'}; 
          max-width: 90%; line-height: 1.5;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .tags-row { 
          display: flex; flex-wrap: wrap; justify-content: center; 
          gap: 20px; margin-bottom: 45px; opacity: 0.6;
        }
        .tag { font-size: 16px; font-weight: 500; }

        .social-row { display: flex; justify-content: center; gap: 32px; }
        .social-link { transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0.8; }
        .social-link:hover { opacity: 1; transform: translateY(-6px) scale(1.1); }
        .social-icon { width: 28px; height: 28px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: 800; letter-spacing: 6px; font-size: 14px;
        }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ CLICK TO ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" ? (
          <video ref={videoRef} src={profile.background_value} className="bg-content" loop muted playsInline />
        ) : profile.background_type === "image" ? (
          <img src={profile.background_value} className="bg-content" alt="bg" />
        ) : (
          <div className="animated-bg">
            <div className="blob"></div>
            <div className="blob-2"></div>
          </div>
        )}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        {/* Badges in Top Right */}
        {(profile.badges?.user || profile.badges?.dev) && (
          <div className="floating-badges">
            {profile.badges?.user && (
              <div className="badge-icon" title="Verified User">
                <User size={20} strokeWidth={2.5} />
              </div>
            )}
            {profile.badges?.dev && (
              <div className="badge-icon" title="Developer" style={{ color: accent }}>
                <Code size={20} strokeWidth={2.5} />
              </div>
            )}
          </div>
        )}

        <img src={profile.avatar_url} className="pfp" alt="profile" />
        
        <div className="display-name">{profile.display_name}</div>
        
        <div className="bio">{profile.bio}</div>

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
