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
          width: 450px; height: 450px;
          background: ${accent};
          filter: blur(100px);
          border-radius: 50%;
          opacity: 0.3;
          animation: move 18s infinite alternate;
        }

        .blob-2 {
          position: absolute;
          bottom: -50px; right: -50px;
          width: 500px; height: 500px;
          background: ${accent};
          filter: blur(130px);
          border-radius: 50%;
          opacity: 0.2;
          animation: move 22s infinite alternate-reverse;
        }

        @keyframes move {
          from { transform: translate(-15%, -15%) scale(1); }
          to { transform: translate(15%, 15%) scale(1.1); }
        }

        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        /* --- MAIN CARD --- */
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 480px;
          padding: 40px;
          background: transparent;
        }

        /* --- FLOATING BADGES (TOP RIGHT) --- */
        .floating-badges {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .badge-icon {
          opacity: 0.7;
          transition: 0.3s ease;
          cursor: help;
        }
        .badge-icon:hover { opacity: 1; transform: scale(1.1); }

        .pfp {
          width: 115px; height: 115px; 
          object-fit: cover; margin-bottom: 25px;
          border-radius: 50%;
          border: 2px solid ${accent};
          box-shadow: 0 0 30px ${accent}33;
        }

        .display-name { 
          font-size: 34px; font-weight: 700; margin-bottom: 10px;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.5px;
        }

        .bio { 
          font-size: 17px; margin-bottom: 25px; 
          color: ${profile.bio_color || 'rgba(255,255,255,0.85)'}; 
          max-width: 85%; line-height: 1.45;
        }

        .tags-row { 
          display: flex; flex-wrap: wrap; justify-content: center; 
          gap: 16px; margin-bottom: 35px; opacity: 0.55;
        }
        .tag { font-size: 14px; font-weight: 500; }

        .social-row { display: flex; justify-content: center; gap: 26px; }
        .social-link { transition: 0.3s ease; opacity: 0.75; }
        .social-link:hover { opacity: 1; transform: translateY(-4px); }
        .social-icon { width: 24px; height: 24px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3)); }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: 700; letter-spacing: 5px; font-size: 13px;
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
                <User size={18} strokeWidth={2} />
              </div>
            )}
            {profile.badges?.dev && (
              <div className="badge-icon" title="Developer" style={{ color: accent }}>
                <Code size={18} strokeWidth={2} />
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
