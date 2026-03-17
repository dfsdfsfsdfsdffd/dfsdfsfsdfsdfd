"use client"
import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { User, Code, ShieldCheck, Star } from "lucide-react"

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
  
  // Logic: Handle Images/Videos with Cache Busting
  const hasMediaBg = (profile.background_type === "image" || profile.background_type === "video") && profile.background_value;
  const bgUrl = hasMediaBg ? `${profile.background_value}` : null;

  // Logic: Support both the raw gradient value from dashboard AND the legacy color columns
  const finalGradient = profile.background_value && profile.background_type === "gradient" 
    ? profile.background_value 
    : `linear-gradient(135deg, ${profile.gradient_color_1 || '#000000'} 0%, ${profile.gradient_color_2 || '#000000'} 100%)`;

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh; width: 100vw; 
          /* Support both "gradient" and "Gradient" casing from DB */
          background: ${profile.background_type?.toLowerCase() === 'gradient' ? finalGradient : '#000'};
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
          position: relative;
        }

        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        .animated-bg {
          width: 100%; height: 100%;
          background: radial-gradient(circle at 50% 50%, ${accent}22 0%, #000 80%);
          position: relative;
        }

        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 90%; max-width: 400px;
          padding: 35px 25px;
          border-radius: 24px;
          transition: all 0.3s ease;
          /* Fixed: Supporting both potential database column names for the toggle */
          background: ${profile.show_glass_card || profile.show_transparent_card ? 'rgba(0, 0, 0, 0.4)' : 'transparent'};
          backdrop-filter: ${profile.show_glass_card || profile.show_transparent_card ? 'blur(20px)' : 'none'};
          border: ${profile.show_glass_card || profile.show_transparent_card ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          box-shadow: ${profile.show_glass_card || profile.show_transparent_card ? '0 20px 50px rgba(0,0,0,0.5)' : 'none'};
        }

        .badges-container {
          position: absolute;
          top: 15px; right: 15px;
          display: flex; gap: 8px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .badge-item {
          position: relative; display: flex; align-items: center;
          cursor: help; color: rgba(255, 255, 255, 0.6); transition: 0.2s;
        }

        .badge-item:hover { color: #fff; transform: scale(1.1); }
        .badge-item:hover::after {
          content: attr(data-tooltip);
          position: absolute; bottom: 130%; left: 50%;
          transform: translateX(-50%);
          background: #fff; color: #000;
          padding: 4px 8px; border-radius: 6px;
          font-size: 10px; font-weight: 700;
          white-space: nowrap; z-index: 20;
        }

        .pfp {
          width: 95px; height: 95px; object-fit: cover; margin-bottom: 18px;
          border-radius: 50%;
          border: 3px solid ${accent};
          box-shadow: 0 0 25px ${accent}44;
        }

        .display-name { 
          font-size: 28px; font-weight: 800; margin-bottom: 6px;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.02em;
        }

        .bio { 
          font-size: 15px; margin-bottom: 20px; 
          color: ${profile.bio_color || 'rgba(255,255,255,0.7)'}; 
          max-width: 90%; line-height: 1.5;
        }

        .tags-row { 
          display: flex; flex-wrap: wrap; justify-content: center; 
          gap: 12px; margin-bottom: 25px; opacity: 0.6;
        }
        .tag { font-size: 13px; font-weight: 500; }

        .social-row { display: flex; justify-content: center; gap: 22px; }
        .social-link { transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.8; }
        .social-link:hover { opacity: 1; transform: translateY(-3px); }
        .social-icon { width: 22px; height: 22px; }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: 700; letter-spacing: 5px; font-size: 11px;
          text-transform: uppercase;
        }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ CLICK TO ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" ? (
          <video 
            key={profile.background_value} 
            ref={videoRef} 
            src={bgUrl} 
            className="bg-content" 
            loop muted playsInline 
          />
        ) : profile.background_type === "image" ? (
          <img 
            key={profile.background_value} 
            src={bgUrl} 
            className="bg-content" 
            alt="bg" 
          />
        ) : profile.background_type?.toLowerCase() === "gradient" ? (
          null
        ) : (
          <div className="animated-bg" />
        )}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        {(profile.badges?.user || profile.badges?.dev || profile.badges?.staff) && (
          <div className="badges-container">
            {profile.badges?.user && (
              <div className="badge-item" data-tooltip="Verified User">
                <ShieldCheck size={16} />
              </div>
            )}
            {profile.badges?.dev && (
              <div className="badge-item" data-tooltip="Developer" style={{ color: accent }}>
                <Code size={16} />
              </div>
            )}
            {profile.badges?.staff && (
              <div className="badge-item" data-tooltip="Staff Member">
                <Star size={16} />
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
