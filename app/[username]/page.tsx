"use client"
import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'
// Added Eye icon here
import { ShieldCheck, Code, Star, Volume2, VolumeX, Eye } from "lucide-react"

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
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  
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
      
      // OPTIONAL: Increment view count in Supabase here if you have a 'views' column
      // await supabase.rpc('increment_views', { profile_id: data.id })
    }
    loadProfile()
  }, [params.username])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handleEnter = () => {
    setHasEntered(true)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.play().catch(() => {});
    }
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

        .audio-controls {
          position: fixed; right: 30px; bottom: 30px;
          display: flex; flex-direction: column; align-items: center;
          gap: 15px; z-index: 100;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(10px);
          padding: 15px 10px; border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: opacity 0.3s;
          opacity: ${hasEntered ? 1 : 0};
        }
        
        .volume-slider {
          writing-mode: bt-lr;
          -webkit-appearance: slider-vertical;
          width: 4px; height: 80px;
          cursor: pointer; accent-color: ${accent};
        }

        .mute-btn {
          background: none; border: none; color: white; cursor: pointer;
          opacity: 0.7; transition: 0.2s;
        }
        .mute-btn:hover { opacity: 1; transform: scale(1.1); }

        .bg-wrapper { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
        .bg-content { width: 100%; height: 100%; object-fit: cover; }

        .profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 90%; max-width: 420px;
          padding: 35px 20px;
          border-radius: 28px;
          background: ${profile.show_glass_card ? 'rgba(0, 0, 0, 0.45)' : 'transparent'};
          backdrop-filter: ${profile.show_glass_card ? 'blur(25px)' : 'none'};
          border: ${profile.show_glass_card ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          box-shadow: ${profile.show_glass_card ? '0 25px 50px rgba(0,0,0,0.6)' : 'none'};
        }

        /* NEW VIEW COUNTER STYLES */
        .view-count {
          position: absolute;
          top: 15px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.05em;
        }

        .pfp {
          width: 100px; height: 100px; object-fit: cover; margin-bottom: 15px;
          border-radius: 50%; border: 2px solid ${accent};
          box-shadow: 0 0 30px ${accent}44;
          padding: 3px;
        }

        .display-name { 
          font-size: 28px; font-weight: 800; margin-bottom: 5px;
          color: ${profile.name_color || '#ffffff'};
          letter-spacing: -0.03em;
        }

        .badges-pill {
          display: flex; gap: 6px; background: rgba(255, 255, 255, 0.08);
          padding: 4px 10px; border-radius: 12px; 
          border: 1px solid rgba(255, 255, 255, 0.1);
          align-items: center; margin-bottom: 12px;
        }

        .tags-row { 
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center; 
          gap: 4px; margin-bottom: 15px; width: 100%;
        }
        .tag-pill {
          background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 8px;
          font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .bio { 
          font-size: 14px; margin-bottom: 22px; line-height: 1.4;
          color: ${profile.bio_color || 'rgba(255,255,255,0.7)'}; 
          max-width: 85%; white-space: pre-wrap; word-break: break-word;
        }

        .social-row { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; }
        .social-link { transition: 0.3s; opacity: 0.75; }
        .social-link:hover { opacity: 1; transform: scale(1.1) translateY(-2px); }
        .social-icon { width: 24px; height: 24px; }

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

      {profile.audio_url && (
        <div className="audio-controls">
          <input 
            type="range" 
            className="volume-slider" 
            min="0" max="1" step="0.01" 
            value={volume} 
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }} 
          />
          <button className="mute-btn" onClick={() => setIsMuted(!isMuted)}>
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      )}

      <div className="bg-wrapper">
        {profile.background_type === "video" ? (
          <video key={profile.background_value} ref={videoRef} src={bgUrl} className="bg-content" loop muted playsInline />
        ) : profile.background_type === "image" ? (
          <img key={profile.background_value} src={bgUrl} className="bg-content" alt="bg" />
        ) : null}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="profile-card">
        {/* VIEW COUNTER ADDED HERE */}
        <div className="view-count">
          <Eye size={12} />
          {profile.views?.toLocaleString() || 0}
        </div>

        <img src={profile.avatar_url} className="pfp" alt="profile" />
        
        <div className="display-name">{profile.display_name}</div>

        {(profile.badges?.user || profile.badges?.dev || profile.badges?.staff) && (
          <div className="badges-pill">
              {profile.badges?.user && <ShieldCheck size={14} color="#3b82f6" />}
              {profile.badges?.dev && <Code size={14} color={accent} />}
              {profile.badges?.staff && <Star size={14} color="#f59e0b" />}
          </div>
        )}

        <div className="tags-row">
          {profile.age && <span className="tag-pill">{profile.age} y/o</span>}
          {profile.gender && <span className="tag-pill">{profile.gender}</span>}
          {profile.sexuality && <span className="tag-pill">{profile.sexuality}</span>}
          {profile.birthday && (
            <span className="tag-pill">
              {new Date(profile.birthday).toLocaleDateString(undefined, {month: 'short', day: 'numeric', timeZone: 'UTC'})}
            </span>
          )}
          {profile.timezone && (
            <span className="tag-pill">
              {profile.timezone.split('/').pop()?.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <div className="bio">{profile.bio || "No bio yet."}</div>

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
