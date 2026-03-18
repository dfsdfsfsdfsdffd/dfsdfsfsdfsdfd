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
          width: 90%; max-width: 440px;
          padding: 50px 20px;
          border-radius: 32px;
          background: ${profile.show_glass_card ? 'rgba(10, 10, 10, 0.55)' : 'transparent'};
          backdrop-filter: ${profile.show_glass_card ? 'blur(20px)' : 'none'};
          border: ${profile.show_glass_card ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'};
        }

        .pfp {
          width: 105px; height: 105px; object-fit: cover; margin-bottom: 24px;
          border-radius: 50%; border: 2px solid ${accent};
          box-shadow: 0 0 20px ${accent}33;
        }

        .name-row {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; margin-bottom: 8px;
        }

        .display-name { 
          font-size: 34px; font-weight: 900;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .badges-pill {
          display: flex; gap: 8px; background: rgba(255, 255, 255, 0.06);
          padding: 6px 14px; border-radius: 100px; 
          border: 1px solid rgba(255, 255, 255, 0.08);
          align-items: center;
        }

        /* DOT SEPARATED TAGS */
        .tags-row { 
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center; 
          gap: 8px; margin-bottom: 24px; color: rgba(255, 255, 255, 0.6);
          font-size: 14px; font-weight: 700;
        }
        .tag-item:not(:last-child)::after {
          content: "•"; margin-left: 8px; opacity: 0.4;
        }

        .bio { 
          font-size: 16px; margin-bottom: 32px;
          color: ${profile.bio_color || 'rgba(255,255,255,0.4)'}; 
          max-width: 85%; font-weight: 500;
        }

        .social-row { display: flex; justify-content: center; gap: 20px; }
        .social-icon { width: 26px; height: 26px; opacity: 0.8; transition: 0.2s; }
        .social-icon:hover { opacity: 1; transform: scale(1.1); }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: 700; letter-spacing: 5px; font-size: 11px;
        }
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
          
          {(profile.badges?.user || profile.badges?.dev || profile.badges?.staff) && (
            <div className="badges-pill">
                {profile.badges?.user && (
                  <ShieldCheck size={15} color="rgba(255,255,255,0.7)" />
                )}
                {profile.badges?.dev && (
                  <Code size={15} color={accent} />
                )}
                {profile.badges?.staff && (
                  <Star size={15} color="rgba(255,255,255,0.7)" />
                )}
            </div>
          )}
        </div>

        <div className="tags-row">
          {profile.age && <span className="tag-item">{profile.age}</span>}
          {profile.gender && <span className="tag-item">{profile.gender}</span>}
          {profile.sexuality && <span className="tag-item">{profile.sexuality}</span>}
          {profile.birthday && <span className="tag-item">{profile.birthday}</span>}
          {profile.timezone && <span className="tag-item">{profile.timezone}</span>}
        </div>

        <div className="bio">{profile.bio}</div>

        <div className="social-row">
          {socials.map((l: any) => (
            <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer">
              <img src={getIcon(l)} className="social-icon" alt="icon" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
