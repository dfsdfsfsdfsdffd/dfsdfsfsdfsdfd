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
          height: 100vh; width: 100vw; background: #080808;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
        }

        /* --- VIBRANT MOVING BG --- */
        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        .animated-bg { width: 100%; height: 100%; background: #000; position: relative; }
        
        .blob {
          position: absolute; width: 60vw; height: 60vw;
          background: radial-gradient(circle, ${accent}44 0%, transparent 70%);
          filter: blur(80px); border-radius: 50%;
          top: -10%; left: -10%; animation: float 15s infinite alternate ease-in-out;
        }
        .blob-2 {
          position: absolute; width: 50vw; height: 50vw;
          background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
          filter: blur(100px); border-radius: 50%;
          bottom: -10%; right: -10%; animation: float 20s infinite alternate-reverse ease-in-out;
        }

        @keyframes float {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(10%, 10%) scale(1.1); }
        }

        /* --- PROFILE CARD --- */
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 90%; max-width: 440px;
        }

        /* --- THE INTENSE GLOW (Matches Ref) --- */
        .pfp-container {
          position: relative; margin-bottom: 28px;
        }
        .pfp-glow {
          position: absolute; inset: -5px;
          background: ${accent};
          border-radius: 50%;
          filter: blur(25px);
          opacity: 0.6;
          z-index: -1;
        }
        .pfp {
          width: 120px; height: 120px; 
          object-fit: cover; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.1);
          position: relative; z-index: 2;
        }

        .display-name { 
          font-size: 34px; font-weight: 800; margin-bottom: 8px;
          color: ${profile.name_color || '#ffffff'};
          text-shadow: 0 0 20px ${accent}44;
        }

        .bio { 
          font-size: 16px; margin-bottom: 24px; opacity: 0.8;
          color: ${profile.bio_color || '#fff'}; line-height: 1.5;
        }

        /* --- FLOATING BADGES (TOP RIGHT) --- */
        .floating-badges {
          position: absolute; top: 25px; right: 25px;
          display: flex; gap: 10px; padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px); border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .social-row { display: flex; gap: 24px; margin-top: 10px; }
        .social-icon { width: 22px; height: 22px; opacity: 0.7; transition: 0.2s; }
        .social-icon:hover { opacity: 1; transform: translateY(-2px); }

        .tag { font-size: 13px; opacity: 0.5; margin: 0 8px; }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-size: 12px; letter-spacing: 5px; text-transform: uppercase;
        }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ Click to Enter ]</div>}

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
        {(profile.badges?.user || profile.badges?.dev) && (
          <div className="floating-badges">
            {profile.badges?.user && <User size={18} strokeWidth={2.5} />}
            {profile.badges?.dev && <Code size={18} strokeWidth={2.5} style={{ color: accent }} />}
          </div>
        )}

        <div className="pfp-container">
          <div className="pfp-glow" />
          <img src={profile.avatar_url} className="pfp" alt="profile" />
        </div>

        <h1 className="display-name">{profile.display_name}</h1>
        <p className="bio">{profile.bio}</p>

        <div style={{ marginBottom: '30px' }}>
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
