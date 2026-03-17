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

  // Check if user has a custom background set
  const hasCustomBg = profile.background_value && profile.background_value !== "";

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh; width: 100vw; background: #000;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
        }

        /* --- BACKGROUND LOGIC --- */
        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        .default-animated-bg {
          width: 100%; height: 100%; background: #000; position: relative;
        }
        .trail {
          position: absolute; width: 150%; height: 150%; top: -25%; left: -25%;
          background: radial-gradient(ellipse at center, ${accent}22 0%, transparent 70%);
          filter: blur(60px); border-radius: 40%; animation: sweep 25s infinite linear;
        }
        @keyframes sweep {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1.1); }
        }

        /* --- PROFILE CARD --- */
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 500px;
        }

        /* --- BADGES (Moved closer to the content) --- */
        .floating-badges {
          position: absolute; top: -20px; right: -40px;
          display: flex; gap: 10px; padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px); border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* --- PFP WITH ACTUAL BORDER + GLOW --- */
        .pfp-container { position: relative; margin-bottom: 25px; }
        .pfp-glow {
          position: absolute; inset: -10px; background: ${accent};
          border-radius: 50%; filter: blur(30px); opacity: 0.5; z-index: -1;
        }
        .pfp {
          width: 125px; height: 125px; object-fit: cover; border-radius: 50%;
          border: 3px solid ${accent}; /* ACTUAL BORDER */
          position: relative; z-index: 2;
        }

        .display-name { 
          font-size: 38px; font-weight: 800; margin-bottom: 10px;
          color: ${profile.name_color || '#ffffff'};
        }

        .bio { 
          font-size: 18px; margin-bottom: 30px; opacity: 0.9;
          color: ${profile.bio_color || '#fff'}; max-width: 90%;
        }

        .social-row { display: flex; gap: 28px; }
        .social-icon { width: 26px; height: 26px; opacity: 0.8; transition: 0.2s; }
        .social-icon:hover { opacity: 1; transform: translateY(-3px); }

        .tag { font-size: 14px; opacity: 0.6; margin: 0 10px; }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: 800; letter-spacing: 5px;
        }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ ENTER ]</div>}

      <div className="bg-wrapper">
        {hasCustomBg ? (
          profile.background_type === "video" ? (
            <video ref={videoRef} src={profile.background_value} className="bg-content" loop muted playsInline />
          ) : (
            <img src={profile.background_value} className="bg-content" alt="custom-bg" />
          )
        ) : (
          <div className="default-animated-bg">
            <div className="trail"></div>
            <div className="trail" style={{ animationDirection: 'reverse', opacity: 0.5 }}></div>
          </div>
        )}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        {/* Badges positioned relative to the card, not the whole screen */}
        {(profile.badges?.user || profile.badges?.dev) && (
          <div className="floating-badges">
            {profile.badges?.user && <User size={20} strokeWidth={2.5} />}
            {profile.badges?.dev && <Code size={20} strokeWidth={2.5} style={{ color: accent }} />}
          </div>
        )}

        <div className="pfp-container">
          <div className="pfp-glow" />
          <img src={profile.avatar_url} className="pfp" alt="profile" />
        </div>

        <h1 className="display-name">{profile.display_name}</h1>
        <p className="bio">{profile.bio}</p>

        <div style={{ marginBottom: '35px' }}>
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
