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
          width: 90%; max-width: 400px;
          padding: 30px 25px;
          border-radius: 24px;
          background: ${profile.show_glass_card ? 'rgba(0, 0, 0, 0.4)' : 'transparent'};
          backdrop-filter: ${profile.show_glass_card ? 'blur(20px)' : 'none'};
          border: ${profile.show_glass_card ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
        }

        .pfp {
          width: 90px; height: 90px; object-fit: cover; margin-bottom: 12px;
          border-radius: 50%; border: 3px solid ${accent};
          box-shadow: 0 0 20px ${accent}44;
        }

        .name-wrapper {
          display: flex; align-items: center; justify-content: center;
          width: 100%; gap: 10px; margin-bottom: 8px;
        }
        
        .name-wrapper::before { content: ""; flex: 1; }
        .badge-anchor { flex: 1; display: flex; justify-content: flex-start; align-items: center; }

        .display-name { 
          font-size: 26px; font-weight: 800;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.02em; white-space: nowrap;
        }

        .badges-pill {
          display: flex; gap: 8px; background: rgba(255, 255, 255, 0.08);
          padding: 4px 10px; border-radius: 12px; 
          border: 1px solid rgba(255, 255, 255, 0.05);
          align-items: center;
        }

        .tag-text {
          font-size: 11px; font-weight: 600; opacity: 0.8;
          padding-left: 4px; border-left: 1px solid rgba(255,255,255,0.1);
          display: flex; gap: 6px;
        }

        .bio { 
          font-size: 14px; margin-bottom: 20px; 
          color: ${profile.bio_color || 'rgba(255,255,255,0.7)'}; 
          max-width: 90%; line-height: 1.4;
        }

        .social-row { display: flex; justify-content: center; gap: 20px; }
        .social-link { transition: 0.3s ease; opacity: 0.8; }
        .social-link:hover { opacity: 1; transform: translateY(-3px); }
        .social-icon { width: 22px; height: 22px; }

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
        
        <div className="name-wrapper">
          <div className="display-name">{profile.display_name}</div>
          
          <div className="badge-anchor">
            <div className="badges-pill">
              {/* Icons Area */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {profile.badges?.user && <ShieldCheck size={14} color="rgba(255,255,255,0.6)" />}
                {profile.badges?.dev && <Code size={14} color={accent} />}
                {profile.badges?.staff && <Star size={14} color="rgba(255,255,255,0.6)" />}
              </div>

              {/* Tags Area inside the same pill */}
              {(profile.age || profile.gender || profile.timezone) && (
                <div className="tag-text">
                  {profile.age && <span>{profile.age}</span>}
                  {profile.gender && <span>{profile.gender}</span>}
                </div>
              )}
            </div>
          </div>
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
