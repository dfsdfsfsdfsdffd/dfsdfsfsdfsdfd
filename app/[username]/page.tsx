"use client"
import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'

// Social Icon Mapping
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
  linkedin: "https://cdn.simpleicons.org/linkedin/ffffff"
}

function getIcon(url: string) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("tiktok")) return iconMap.tiktok
  if (lowerUrl.includes("instagram")) return iconMap.instagram
  if (lowerUrl.includes("twitter") || lowerUrl.includes("x.com")) return iconMap.x
  if (lowerUrl.includes("youtube")) return iconMap.youtube
  if (lowerUrl.includes("twitch")) return iconMap.twitch
  if (lowerUrl.includes("spotify")) return iconMap.spotify
  if (lowerUrl.includes("discord")) return iconMap.discord
  if (lowerUrl.includes("github")) return iconMap.github
  if (lowerUrl.includes("threads")) return iconMap.threads
  if (lowerUrl.includes("linkedin")) return iconMap.linkedin
  return "https://cdn.simpleicons.org/pwa/ffffff" // World icon for random sites
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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single()
      setProfile(data)
    }
    loadProfile()
  }, [params.username])

  const handleEnter = () => {
    setHasEntered(true)
    if (audioRef.current) audioRef.current.play()
    if (videoRef.current) videoRef.current.play()
  }

  if (!profile) return null

  // Split links into Social Icons (no title) and Buttons (has title)
  const socialIcons = profile.links?.filter((l: any) => !l.title || l.title.trim() === "") || []
  const regularButtons = profile.links?.filter((l: any) => l.title && l.title.trim() !== "") || []

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh; width: 100vw; background: #000;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${profile.font_family || 'Inter'}, sans-serif;
          overflow: hidden;
        }
        .overlay {
          position: fixed; inset: 0; background: #020617; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
        }
        .bg-wrapper { position: absolute; inset: 0; z-index: 1; }
        .bg-content { width: 100%; height: 100%; object-fit: cover; }
        
        .profile-card {
          position: relative; z-index: 5; text-align: center;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
          padding: 40px 30px; border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          width: 90%; max-width: 420px;
        }
        .pfp {
          width: 110px; height: 110px; border-radius: 50%;
          object-fit: cover; margin-bottom: 18px;
          box-shadow: 0 0 35px ${profile.accent_color}66;
        }
        .display-name { font-size: 30px; font-weight: 800; margin-bottom: 4px; }
        .username-display { font-size: 14px; opacity: 0.5; margin-bottom: 15px; letter-spacing: 0.5px; }
        .bio { font-size: 15px; opacity: 0.8; margin-bottom: 25px; line-height: 1.5; }

        /* Side-by-Side Icon Row */
        .scdb-links-row { 
          display: flex; flex-direction: row; justify-content: center; 
          align-items: center; gap: 18px; margin-bottom: 20px;
        }
        .scdb-icon-link img { 
          width: 28px; height: 28px; 
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5)); 
          transition: transform 0.2s ease; 
        }
        .scdb-icon-link:hover img { transform: translateY(-2px); }

        /* Badges Flush Look */
        .scdb-badges { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .badge { 
          padding: 4px 12px; border-radius: 6px; 
          background: rgba(255, 255, 255, 0.08); 
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.1);
          letter-spacing: 1px;
        }

        /* Buttons List */
        .button-list { display: flex; flex-direction: column; gap: 12px; }
        .link-btn {
          padding: 14px; border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white; text-decoration: none; font-size: 15px; font-weight: 500;
          transition: all 0.2s ease;
        }
        .link-btn:hover { background: rgba(255, 255, 255, 0.12); transform: scale(1.02); }
      `}</style>

      {/* Enter Screen */}
      {!hasEntered && (
        <div className="overlay" onClick={handleEnter}>
          <p style={{letterSpacing: '5px', fontSize: '13px'}}>[ CLICK TO ENTER ]</p>
        </div>
      )}

      {/* Background Layer */}
      <div className="bg-wrapper">
        {profile.background_type === "video" && (
          <video ref={videoRef} src={profile.background_value} className="bg-content" loop muted playsInline />
        )}
        {profile.background_type === "image" && (
          <img src={profile.background_value} className="bg-content" alt="" />
        )}
        {profile.background_type === "gradient" && (
          <div className="bg-content" style={{background: profile.background_value}} />
        )}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        <img src={profile.avatar_url} className="pfp" alt="" />
        <div className="display-name">{profile.display_name}</div>
        <div className="username-display">@{profile.username}</div>

        {/* Badges Row */}
        {(profile.badges?.user || profile.badges?.dev) && (
          <div className="scdb-badges">
            {profile.badges?.user && <div className="badge">User</div>}
            {profile.badges?.dev && <div className="badge" style={{ borderColor: profile.accent_color }}>Dev</div>}
          </div>
        )}

        <div className="bio">{profile.bio}</div>

        {/* Social Icons Row (Side-by-side) */}
        {socialIcons.length > 0 && (
          <div className="scdb-links-row">
            {socialIcons.map((link: any) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="scdb-icon-link">
                <img src={getIcon(link.url)} alt="" />
              </a>
            ))}
          </div>
        )}

        {/* Regular Buttons List (Stacked) */}
        {regularButtons.length > 0 && (
          <div className="button-list">
            {regularButtons.map((link: any) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="link-btn">
                {link.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
