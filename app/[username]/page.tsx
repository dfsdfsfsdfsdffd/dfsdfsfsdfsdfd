"use client"
import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { ShieldCheck, Code, Star } from "lucide-react"

const iconMap: any = {
  tiktok: "https://cdn.simpleicons.org/tiktok/ffffff",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
  x: "https://cdn.simpleicons.org/x/ffffff",
  youtube: "https://cdn.simpleicons.org/youtube/ffffff",
  twitch: "https://cdn.simpleicons.org/twitch/ffffff",
  spotify: "https://cdn.simpleicons.org/spotify/ffffff",
  discord: "https://cdn.simpleicons.org/discord/ffffff",
  github: "https://cdn.simpleicons.org/github/ffffff",
  threads: "https://cdn.simpleicons.org/threads/ffffff",
  linkedin: "https://cdn.simpleicons.org/linkedin/ffffff",
  website: "https://cdn.simpleicons.org/pwa/ffffff"
}

function getIcon(linkObj: any) {
  if (linkObj.type && iconMap[linkObj.type]) return iconMap[linkObj.type]
  return iconMap.website
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

  const socials = profile.links?.filter((l: any) => l.url) || []
  const accent = profile.accent_color || '#7000ff';
  const hasMediaBg = (profile.background_type === "image" || profile.background_type === "video") && profile.background_value;
  const bgUrl = hasMediaBg ? `${profile.background_value}` : null;

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh; width: 100vw; 
          background: ${profile.background_type === 'gradient' ? profile.background_value : '#000'};
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden; position: relative;
        }

        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        .bg-content { width: 100%; height: 100%; object-fit: cover; }

        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 90%; max-width: 420px;
          padding: 45px 25px;
          border-radius: 28px;
          background: ${profile.show_glass_card ? 'rgba(0, 0, 0, 0.45)' : 'transparent'};
          backdrop-filter: ${profile.show_glass_card ? 'blur(25px)' : 'none'};
          border: ${profile.show_glass_card ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          box-shadow: ${profile.show_glass_card ? '0 25px 50px rgba(0,0,0,0.6)' : 'none'};
        }

        .pfp {
          width: 110px; height: 110px; object-fit: cover; margin-bottom: 20px;
          border-radius: 50%; border: 2px solid ${accent};
          box-shadow: 0 0 30px ${accent}44;
          padding: 3px;
        }

        .name-row {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; margin-bottom: 8px;
        }

        .display-name { 
          font-size: 32px; font-weight: 800;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.03em;
        }

        .badges-pill {
          display: flex; gap: 8px; background: rgba(255, 255, 255, 0.08);
          padding: 5px 12px; border-radius: 12px; 
          border: 1px solid rgba(255, 255, 255, 0.1);
          align-items: center; margin-bottom: 15px;
        }

        .badge-item { position: relative; display: flex; align-items: center; cursor: help; }

        .badge-item::before {
          content: attr(data-tooltip);
          position: absolute; bottom: 130%; left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: rgba(0, 0, 0, 0.9); color: white;
          padding: 5px 10px; border-radius: 8px;
          font-size: 11px; font-weight: 600; white-space: nowrap;
          opacity: 0; visibility: hidden;
          transition: 0.2s ease; border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .badge-item:hover::before { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }

        /* UPDATED TAG STYLES */
        .tags-row { 
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center; 
          gap: 6px; margin-bottom: 20px; width: 100%;
        }
        .tag-pill {
          background: rgba(255, 255, 255, 0.06); padding: 5px 12px; border-radius: 10px;
          font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .bio { 
          font-size: 15px; margin-bottom: 28px; line-height: 1.6;
          color: ${profile.bio_color || 'rgba(255,255,255,0.7)'}; 
          max-width: 90%;
        }

        .social-row { display: flex; justify-content: center; gap: 22px; flex-wrap: wrap; }
        .social-link { transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0.8; }
        .social-link:hover { opacity: 1; transform: scale(1.15) translateY(-3px); }
        .social-icon { width: 28px; height: 28px; }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: 700; letter-spacing: 5px; font-size: 11px;
          color: rgba(255,255,255,0.5); transition: 0.3s;
        }
        .overlay:hover { color: white; letter-spacing: 7px; }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ CLICK TO ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" ? (
          <video key={profile.background_value} ref={videoRef} src={bgUrl} className="bg-content" loop muted playsInline />
        ) : profile.background_type === "image" ? (
          <img key={profile.background_value} src={bgUrl} className="bg-content" alt="bg" />
        ) : null}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        <img src={profile.avatar_url} className="pfp" alt="profile" />
        
        <div className="name-row">
          <div className="display-name">{profile.display_name}</div>
        </div>

        {(profile.badges?.user || profile.badges?.dev || profile.badges?.staff) && (
          <div className="badges-pill">
              {profile.badges?.user && (
                <div className="badge-item" data-tooltip="Verified User">
                  <ShieldCheck size={16} color="#3b82f6" />
                </div>
              )}
              {profile.badges?.dev && (
                <div className="badge-item" data-tooltip="Developer">
                  <Code size={16} color={accent} />
                </div>
              )}
              {profile.badges?.staff && (
                <div className="badge-item" data-tooltip="Staff">
                  <Star size={16} color="#f59e0b" />
                </div>
              )}
          </div>
        )}

        {/* REFINED TAGS BAR */}
        <div className="tags-row">
          {profile.age && <span className="tag-pill">{profile.age} y/o</span>}
          {profile.gender && <span className="tag-pill">{profile.gender}</span>}
          {profile.sexuality && <span className="tag-pill">{profile.sexuality}</span>}
          {profile.birthday && (
            <span className="tag-pill">
              {new Date(profile.birthday).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
            </span>
          )}
          {profile.timezone && (
            <span className="tag-pill">
              {profile.timezone.split('/').pop()?.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <div className="bio">{profile.bio}</div>

        <div className="social-row">
          {socials.map((l: any) => (
            <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" className="social-link">
              <img src={getIcon(l)} className="social-icon" alt="icon" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
