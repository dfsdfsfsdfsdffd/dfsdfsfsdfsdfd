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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes blobFloat {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }

        .container {
          height: 100vh; width: 100vw; background: #000;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
        }

        /* --- POLISHED BACKGROUND --- */
        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        
        .animated-bg {
          width: 100%; height: 100%;
          background: #000;
          position: relative;
        }
        
        .blob {
          position: absolute;
          width: 50vw; height: 50vw;
          background: ${accent};
          filter: blur(120px);
          border-radius: 50%;
          opacity: 0.25;
          top: -10%; left: -10%;
          animation: blobFloat 20s infinite ease-in-out;
        }

        .blob-2 {
          position: absolute;
          width: 60vw; height: 60vw;
          background: ${accent};
          filter: blur(150px);
          border-radius: 50%;
          opacity: 0.15;
          bottom: -15%; right: -15%;
          animation: blobFloat 25s infinite ease-in-out reverse;
        }

        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        /* --- MAIN CONTENT --- */
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 480px;
          padding: 40px;
          animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        /* --- GLASS BADGES --- */
        .floating-badges {
          position: absolute;
          top: 0;
          right: 20px;
          display: flex;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .badge-icon {
          opacity: 0.6;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: help;
        }
        .badge-icon:hover { opacity: 1; transform: scale(1.1) rotate(5deg); }

        .pfp {
          width: 110px; height: 110px; 
          object-fit: cover; margin-bottom: 24px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 30px ${accent}22;
          transition: 0.5s ease;
        }
        .pfp:hover { transform: scale(1.02); border-color: ${accent}; }

        .display-name { 
          font-size: 32px; font-weight: 700; margin-bottom: 8px;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.02em;
          text-shadow: 0 2px 10px rgba(0,0,0,0.4);
        }

        .bio { 
          font-size: 16px; margin-bottom: 24px; 
          color: ${profile.bio_color || 'rgba(255,255,255,0.75)'}; 
          max-width: 85%; line-height: 1.6;
          font-weight: 400;
        }

        .tags-row { 
          display: flex; flex-wrap: wrap; justify-content: center; 
          gap: 16px; margin-bottom: 32px;
        }
        .tag { 
          font-size: 13px; font-weight: 500; 
          opacity: 0.45; transition: 0.3s;
          cursor: default;
        }
        .tag:hover { opacity: 0.9; }

        .social-row { display: flex; justify-content: center; gap: 24px; }
        .social-link { transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); opacity: 0.6; }
        .social-link:hover { opacity: 1; transform: translateY(-3px); }
        .social-icon { 
          width: 22px; height: 22px; 
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); 
        }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: 600; letter-spacing: 0.3em; font-size: 11px;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          transition: 0.3s;
        }
        .overlay:hover { color: #fff; letter-spacing: 0.4em; }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ Enter ]</div>}

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
        {/* Polished Floating Badges */}
        {(profile.badges?.user || profile.badges?.dev) && (
          <div className="floating-badges">
            {profile.badges?.user && (
              <div className="badge-icon" title="Verified User">
                <User size={16} strokeWidth={2.5} />
              </div>
            )}
            {profile.badges?.dev && (
              <div className="badge-icon" title="Developer" style={{ color: accent }}>
                <Code size={16} strokeWidth={2.5} />
              </div>
            )}
          </div>
        )}

        <img src={profile.avatar_url} className="pfp" alt="profile" />
        
        <h1 className="display-name">{profile.display_name}</h1>
        
        <p className="bio">{profile.bio}</p>

        <div className="tags-row">
          {profile.age && <span className="tag">🎂 {profile.age}</span>}
          {profile.gender && <span className="tag">⚥ {profile.gender}</span>}
          {profile.timezone && <span className="tag">🌍 {profile.timezone}</span>}
        </div>

        <div className="social-row">
          {socials.map((l: any) => (
            <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" className="social-link">
              <img src={getIcon(l.url)} className="social-icon" alt="icon" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
