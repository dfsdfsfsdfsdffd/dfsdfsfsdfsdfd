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
  const accent = profile.accent_color || '#ff0000';

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh; width: 100vw; background: #000;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
        }

        /* --- SWEEPING LIGHT TRAILS BG --- */
        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        .animated-bg { width: 100%; height: 100%; background: #000; position: relative; }
        
        .trail {
          position: absolute;
          width: 150%; height: 150%;
          top: -25%; left: -25%;
          background: radial-gradient(ellipse at center, ${accent}22 0%, transparent 70%);
          filter: blur(60px);
          border-radius: 40%;
          animation: sweep 25s infinite linear;
        }

        .trail-2 {
          position: absolute;
          width: 120%; height: 120%;
          bottom: -10%; right: -10%;
          background: radial-gradient(ellipse at center, ${accent}15 0%, transparent 60%);
          filter: blur(80px);
          border-radius: 35%;
          animation: sweep 30s infinite linear reverse;
        }

        @keyframes sweep {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1.1); }
        }

        /* --- PROFILE CARD (SHRUNK FOR SCALE) --- */
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 100%;
        }

        /* --- THE VIBRANT GLOW --- */
        .pfp-container {
          position: relative; margin-bottom: 20px;
        }
        .pfp-glow {
          position: absolute; inset: -4px;
          background: ${accent};
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.5;
          z-index: -1;
        }
        .pfp {
          width: 90px; height: 90px; 
          object-fit: cover; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.1);
          position: relative; z-index: 2;
        }

        .display-name { 
          font-size: 26px; font-weight: 700; margin-bottom: 6px;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.5px;
        }

        .bio { 
          font-size: 14px; margin-bottom: 20px; opacity: 0.8;
          color: ${profile.bio_color || '#fff'}; line-height: 1.4;
          max-width: 250px;
        }

        /* --- BADGES HELD AT TOP RIGHT --- */
        .floating-badges {
          position: absolute; top: 30px; right: 30px;
          display: flex; gap: 8px; padding: 10px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px); border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 10;
        }

        .social-row { display: flex; gap: 18px; }
        .social-icon { width: 18px; height: 18px; opacity: 0.6; transition: 0.3s; }
        .social-icon:hover { opacity: 1; transform: scale(1.1); }

        .tag { font-size: 11px; opacity: 0.4; margin: 0 6px; font-weight: 500; }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" ? (
          <video ref={videoRef} src={profile.background_value} className="bg-content" loop muted playsInline />
        ) : profile.background_type === "image" ? (
          <img src={profile.background_value} className="bg-content" alt="bg" />
        ) : (
          <div className="animated-bg">
            <div className="trail"></div>
            <div className="trail-2"></div>
          </div>
        )}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        {(profile.badges?.user || profile.badges?.dev) && (
          <div className="floating-badges">
            {profile.badges?.user && <User size={16} strokeWidth={2} />}
            {profile.badges?.dev && <Code size={16} strokeWidth={2} style={{ color: accent }} />}
          </div>
        )}

        <div className="pfp-container">
          <div className="pfp-glow" />
          <img src={profile.avatar_url} className="pfp" alt="profile" />
        </div>

        <h1 className="display-name">{profile.display_name}</h1>
        <p className="bio">{profile.bio}</p>

        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
          {profile.age && <span className="tag">{profile.age}</span>}
          {profile.gender && <span className="tag">{profile.gender}</span>}
          {profile.timezone && <span className="tag">{profile.timezone}</span>}
        </div>

        <div className="social-row">
          {socials.map((l: any) => (
            <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer">
              <img src={getIcon(l.url)} className="social-icon" alt="icon" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
