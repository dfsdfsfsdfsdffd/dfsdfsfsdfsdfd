"use client"
import { useState, useEffect, useRef, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'
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

const badgeInfo = {
  user: { label: "Verified User", description: "This profile belongs to a verified Softcard user." },
  dev: { label: "Developer", description: "This user is marked as a Softcard developer." },
  staff: { label: "Staff", description: "This user is marked as Softcard staff." },
}

const SAFE_FONTS = new Set(["Inter", "Playfair Display", "JetBrains Mono", "Outfit"]);
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

function safeColor(value: unknown, fallback: string) {
  return typeof value === "string" && HEX_COLOR.test(value) ? value : fallback;
}

function safeFont(value: unknown) {
  return typeof value === "string" && SAFE_FONTS.has(value) ? value : "Inter";
}

function safeGradient(value: unknown) {
  if (typeof value !== "string") return "linear-gradient(135deg, #111827 0%, #020617 100%)";
  const colors = value.match(/#(?:[0-9a-fA-F]{3}){1,2}/g);
  if (!colors?.[0] || !colors?.[1]) return "linear-gradient(135deg, #111827 0%, #020617 100%)";
  return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
}

function safeMediaUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function safeExternalUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
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

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, [])

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) return;

      // 1. Fetch profile data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single()
      
      if (data) {
        setProfile(data)
        
        // 2. Increment view count in DB
        // Calls the SQL function you created in Supabase
        await supabase.rpc('increment_profile_views', { target_id: data.id })
      }
    }
    loadProfile()
  }, [params.username, supabase])

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

  const socials = profile.links?.filter((l: any) => l.enabled !== false && safeExternalUrl(l.url)) || []
  const accent = safeColor(profile.accent_color, '#7000ff');
  const nameColor = safeColor(profile.name_color, '#ffffff');
  const bioColor = safeColor(profile.bio_color, '#d1d5db');
  const fontFamily = safeFont(profile.font_family);
  const background = safeGradient(profile.background_value);
  const hasMediaBg = (profile.background_type === "image" || profile.background_type === "video") && profile.background_value;
  const bgUrl = hasMediaBg ? safeMediaUrl(profile.background_value) : "";
  const avatarUrl = safeMediaUrl(profile.avatar_url) || "https://i.imgur.com/1X6g1YH.jpeg";
  const audioUrl = safeMediaUrl(profile.audio_url);

  return (
    <div className="container">
      <style jsx>{`
        .container {
          height: 100vh; width: 100vw; 
          background: ${profile.background_type === 'gradient' ? background : '#030712'};
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${fontFamily}, sans-serif;
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

        .view-count {
          position: absolute;
          top: 18px;
          right: 22px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          /* Increased visibility */
          color: rgba(255, 255, 255, 0.85);
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          letter-spacing: 0.02em;
        }

        .pfp {
          width: 100px; height: 100px; object-fit: cover; margin-bottom: 15px;
          border-radius: 50%; border: 2px solid ${accent};
          box-shadow: 0 0 30px ${accent}44;
          padding: 3px;
        }

        .display-name { 
          font-size: 28px; font-weight: 800; margin-bottom: 5px;
          color: ${nameColor};
          letter-spacing: -0.03em;
        }

        .badges-pill {
          display: flex; gap: 6px; background: rgba(255, 255, 255, 0.08);
          padding: 4px 10px; border-radius: 12px; 
          border: 1px solid rgba(255, 255, 255, 0.1);
          align-items: center; margin-bottom: 12px;
        }
        .badge-tip { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .badge-tip::after {
          content: attr(data-tip);
          position: absolute; left: 50%; bottom: calc(100% + 9px);
          transform: translateX(-50%) translateY(4px);
          width: max-content; max-width: 210px; padding: 8px 10px;
          border-radius: 8px; background: rgba(0,0,0,0.88);
          border: 1px solid rgba(255,255,255,0.14);
          color: white; font-size: 11px; line-height: 1.35;
          opacity: 0; pointer-events: none; transition: 0.18s ease; z-index: 30;
        }
        .badge-tip:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }

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
          color: ${bioColor}; 
          max-width: 85%; white-space: pre-wrap; word-break: break-word;
        }

        .social-row { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; }
        .social-link { transition: 0.3s; opacity: 0.75; }
        .social-link:hover { opacity: 1; transform: scale(1.1) translateY(-2px); }
        .social-icon { width: 24px; height: 24px; }
        .featured-links { display: flex; flex-direction: column; gap: 9px; width: 100%; max-width: 310px; margin-top: 18px; }
        .featured-link {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 11px 13px; border-radius: 10px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          color: white; text-decoration: none; font-size: 13px; font-weight: 700;
          transition: transform 0.2s, background 0.2s;
        }
        .featured-link:hover { transform: translateY(-1px); background: rgba(255,255,255,0.12); }
        .featured-link img { width: 18px; height: 18px; opacity: 0.84; }
        .featured-link-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; text-align: left; }
        .featured-link-text small { opacity: 0.6; font-size: 11px; line-height: 1.25; }

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

      {audioUrl && (
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
        {profile.background_type === "video" && bgUrl ? (
          <video key={bgUrl} ref={videoRef} src={bgUrl} className="bg-content" loop muted playsInline />
        ) : profile.background_type === "image" && bgUrl ? (
          <img key={bgUrl} src={bgUrl} className="bg-content" alt="bg" />
        ) : null}
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}

      <div className="profile-card">
        <div className="view-count">
          <Eye size={14} strokeWidth={2.5} />
          {/* We show current views + 1 so the user's visit is counted instantly on screen */}
          {((profile.views || 0) + 1).toLocaleString()}
        </div>

        <img src={avatarUrl} className="pfp" alt="profile" />
        
        <div className="display-name">{profile.display_name}</div>

        {(profile.badges?.user || profile.badges?.dev || profile.badges?.staff) && (
          <div className="badges-pill">
              {profile.badges?.user && <span className="badge-tip" data-tip={badgeInfo.user.description} aria-label={badgeInfo.user.label}><ShieldCheck size={14} color="#3b82f6" /></span>}
              {profile.badges?.dev && <span className="badge-tip" data-tip={badgeInfo.dev.description} aria-label={badgeInfo.dev.label}><Code size={14} color={accent} /></span>}
              {profile.badges?.staff && <span className="badge-tip" data-tip={badgeInfo.staff.description} aria-label={badgeInfo.staff.label}><Star size={14} color="#f59e0b" /></span>}
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
            <a key={l.id} href={safeExternalUrl(l.url)} target="_blank" rel="noopener noreferrer" className="social-link">
              <img src={getIcon(l)} className="social-icon" alt="icon" />
            </a>
          ))}
        </div>

        <div className="featured-links">
          {socials.filter((l: any) => l.label && l.featured).slice(0, 4).map((l: any) => (
            <a key={`featured-${l.id}`} href={safeExternalUrl(l.url)} target="_blank" rel="noopener noreferrer" className="featured-link" style={{ borderColor: safeColor(l.color, accent) }}>
              <span className="featured-link-text">
                <span>{String(l.label).slice(0, 40)}</span>
                {l.description && <small>{String(l.description).slice(0, 80)}</small>}
              </span>
              <img src={getIcon(l)} alt="" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
