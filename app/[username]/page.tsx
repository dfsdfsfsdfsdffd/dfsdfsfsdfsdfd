"use client"
import { useState, useEffect, useRef, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { ShieldCheck, Code, Star, Eye, ExternalLink, Play, Pause } from "lucide-react"

type ProfileEffect = "none" | "snow" | "rain" | "ctv";
type UsernameEffect = "none" | "typewriter" | "rainbow" | "fuzzy" | "glitch" | "static";
type ProfileMeta = {
  cursorUrl: string;
  profileEffect: ProfileEffect;
  usernameEffect: UsernameEffect;
  bgBlur: number;
  bgOpacity: number;
  customFontUrl: string;
  customFontName: string;
  customFontBio: boolean;
  discordUrl: string;
  discordName: string;
  discordStatus: string;
  discordAvatar: string;
};

const iconMap: any = {
  snapchat: "https://cdn.simpleicons.org/snapchat/fffc00",
  tiktok: "https://cdn.simpleicons.org/tiktok/ffffff",
  telegram: "https://cdn.simpleicons.org/telegram/26a5e4",
  soundcloud: "https://cdn.simpleicons.org/soundcloud/ff5500",
  paypal: "https://cdn.simpleicons.org/paypal/003087",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
  x: "https://cdn.simpleicons.org/x/ffffff",
  youtube: "https://cdn.simpleicons.org/youtube/ffffff",
  twitch: "https://cdn.simpleicons.org/twitch/ffffff",
  spotify: "https://cdn.simpleicons.org/spotify/ffffff",
  discord: "https://cdn.simpleicons.org/discord/ffffff",
  github: "https://cdn.simpleicons.org/github/ffffff",
  roblox: "https://cdn.simpleicons.org/roblox/ffffff",
  cashapp: "https://cdn.simpleicons.org/cashapp/00d632",
  venmo: "https://cdn.simpleicons.org/venmo/008cff",
  playstation: "https://cdn.simpleicons.org/playstation/0070cc",
  xbox: "https://cdn.simpleicons.org/xbox/107c10",
  applemusic: "https://cdn.simpleicons.org/applemusic/fa243c",
  gitlab: "https://cdn.simpleicons.org/gitlab/fc6d26",
  reddit: "https://cdn.simpleicons.org/reddit/ff4500",
  vk: "https://cdn.simpleicons.org/vk/0077ff",
  bluesky: "https://cdn.simpleicons.org/bluesky/0285ff",
  namemc: "https://cdn.simpleicons.org/namemc/12161a",
  onlyfans: "https://cdn.simpleicons.org/onlyfans/00aff0",
  linkedin: "https://cdn.simpleicons.org/linkedin/0a66c2",
  steam: "https://cdn.simpleicons.org/steam/ffffff",
  kick: "https://cdn.simpleicons.org/kick/53fc18",
  pinterest: "https://cdn.simpleicons.org/pinterest/e60023",
  osu: "https://cdn.simpleicons.org/osu/ff66aa",
  googlemaps: "https://cdn.simpleicons.org/googlemaps/4285f4",
  buymeacoffee: "https://cdn.simpleicons.org/buymeacoffee/ffdd00",
  facebook: "https://cdn.simpleicons.org/facebook/0866ff",
  threads: "https://cdn.simpleicons.org/threads/ffffff",
  patreon: "https://cdn.simpleicons.org/patreon/ff424d",
  signal: "https://cdn.simpleicons.org/signal/3a76f0",
  bitcoin: "https://cdn.simpleicons.org/bitcoin/f7931a",
  ethereum: "https://cdn.simpleicons.org/ethereum/ffffff",
  litecoin: "https://cdn.simpleicons.org/litecoin/a6a9aa",
  solana: "https://cdn.simpleicons.org/solana/9945ff",
  ripple: "https://cdn.simpleicons.org/xrp/346aa9",
  monero: "https://cdn.simpleicons.org/monero/ff6600",
  email: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='5' width='18' height='14' rx='2'/%3E%3Cpath d='m3 7 9 6 9-6'/%3E%3C/svg%3E",
  website: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M2 12h20'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E"
}

const badgeInfo = {
  user: { label: "Verified User", description: "This profile belongs to a verified Softcard user." },
  dev: { label: "Developer", description: "This user is marked as a Softcard developer." },
  staff: { label: "Staff", description: "This user is marked as Softcard staff." },
}

const SAFE_FONTS = new Set(["Inter", "Playfair Display", "JetBrains Mono", "Outfit"]);
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const defaultMeta: ProfileMeta = {
  cursorUrl: "",
  profileEffect: "none",
  usernameEffect: "none",
  bgBlur: 0,
  bgOpacity: 1,
  customFontUrl: "",
  customFontName: "",
  customFontBio: false,
  discordUrl: "",
  discordName: "",
  discordStatus: "last seen unknown",
  discordAvatar: "",
};

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

function readMeta(items: any[]): ProfileMeta {
  const metaLink = items.find((link) => link.type === "__softcard_meta");
  const meta = { ...defaultMeta, ...(metaLink?.meta || {}) };
  if ((meta.usernameEffect as string) === "shuffle") meta.usernameEffect = "glitch";
  if ((meta.profileEffect as string) === "night") meta.profileEffect = "none";
  if ((meta.usernameEffect as string) === "sparkles") meta.usernameEffect = "none";
  return meta;
}

function mediaName(url: string) {
  try {
    return decodeURIComponent(url.split("/").pop()?.split("?")[0] || "Profile audio")
  } catch {
    return "Profile audio"
  }
}

function splitAudioMeta(value: string) {
  if (!value) return { url: "", title: "", showPlayer: true, backgroundAudio: true }

  try {
    const parsed = new URL(value)
    const params = new URLSearchParams(parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash)
    const oldTitle = parsed.hash.startsWith("#softcardTitle=")
      ? decodeURIComponent(parsed.hash.replace("#softcardTitle=", ""))
      : ""
    const title = params.get("title") || oldTitle
    const showPlayer = params.get("player") !== "0"
    const backgroundAudio = params.get("bg") !== "0"
    parsed.hash = ""
    return { url: parsed.toString(), title, showPlayer, backgroundAudio }
  } catch {
    return { url: value, title: "", showPlayer: true, backgroundAudio: true }
  }
}

export default function PublicProfile({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [hasEntered, setHasEntered] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)

    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
    }
  }, [profile?.audio_url])

  const handleEnter = () => {
    setHasEntered(true)
    if (audioRef.current && audioSettings.backgroundAudio) {
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    if (videoRef.current) videoRef.current.play().catch(() => {});
  }

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio.volume = isMuted ? 0 : volume
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  if (!profile) return null

  const allLinks = Array.isArray(profile.links) ? profile.links : [];
  const profileMeta = readMeta(allLinks);
  const socials = allLinks.filter((l: any) => l.type !== "__softcard_meta" && l.enabled !== false && safeExternalUrl(l.url)) || []
  const accent = safeColor(profile.accent_color, '#7000ff');
  const nameColor = safeColor(profile.name_color, '#ffffff');
  const bioColor = safeColor(profile.bio_color, '#d1d5db');
  const baseFontFamily = safeFont(profile.font_family);
  const nameFontFamily = profileMeta.customFontUrl ? "SoftcardCustomFont" : baseFontFamily;
  const bioFontFamily = profileMeta.customFontUrl && profileMeta.customFontBio ? "SoftcardCustomFont" : baseFontFamily;
  const background = safeGradient(profile.background_value);
  const hasMediaBg = (profile.background_type === "image" || profile.background_type === "video") && profile.background_value;
  const bgUrl = hasMediaBg ? safeMediaUrl(profile.background_value) : "";
  const avatarUrl = safeMediaUrl(profile.avatar_url) || "https://i.imgur.com/1X6g1YH.jpeg";
  const discordName = profileMeta.discordName.trim();
  const discordUrl = safeExternalUrl(profileMeta.discordUrl);
  const discordAvatar = safeMediaUrl(profileMeta.discordAvatar) || avatarUrl;
  const discordStatus = profileMeta.discordStatus.trim() || "last seen unknown";
  const audioSettings = splitAudioMeta(safeMediaUrl(profile.audio_url));
  const audioUrl = audioSettings.url;
  const audioTitle = audioSettings.title || mediaName(audioUrl);
  const clickHref = (link: any) => `/api/click?u=${encodeURIComponent(params.username)}&id=${encodeURIComponent(String(link.id))}`;
  const featureClass = (style: any) =>
    `featured-link featured-${["glass", "filled", "outline", "soft"].includes(style) ? style : "glass"}`;

  return (
    <div className="container">
      <style jsx>{`
        ${profileMeta.customFontUrl ? `@font-face { font-family: "SoftcardCustomFont"; src: url("${profileMeta.customFontUrl}") format("truetype"); font-display: swap; }` : ""}
        .container {
          min-height: 100svh;
          height: 100svh;
          width: 100vw;
          background: ${profile.background_type === 'gradient' ? background : '#030712'};
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: ${baseFontFamily}, sans-serif;
          overflow: hidden; position: relative;
          isolation: isolate;
          cursor: ${profileMeta.cursorUrl ? `url("${profileMeta.cursorUrl}") 8 8, auto` : "auto"};
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
        .bg-wrapper {
          opacity: ${profileMeta.bgOpacity};
          filter: blur(${profileMeta.bgBlur}px);
          transform: ${profileMeta.bgBlur > 0 ? "scale(1.04)" : "none"};
        }

        .profile-card {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
          z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 90%; max-width: 420px;
          max-height: calc(100svh - 40px);
          overflow-y: auto;
          flex: 0 0 auto;
          padding: 28px 20px;
          border-radius: 28px;
          background: ${profile.show_glass_card ? 'rgba(0, 0, 0, 0.45)' : 'transparent'};
          backdrop-filter: ${profile.show_glass_card ? 'blur(25px)' : 'none'};
          border: ${profile.show_glass_card ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          box-shadow: ${profile.show_glass_card ? '0 25px 50px rgba(0,0,0,0.6)' : 'none'};
          overflow-x: hidden;
        }
        .profile-card > :not(.profile-effect) { position: relative; z-index: 1; }

        .view-count {
          position: absolute !important;
          top: 18px !important;
          right: 22px !important;
          left: auto !important;
          z-index: 5;
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
          width: 96px; height: 96px; object-fit: cover; margin-bottom: 10px;
          border-radius: 50%; border: 2px solid ${accent};
          box-shadow: 0 0 30px ${accent}44;
          padding: 3px;
        }

        .display-name { 
          font-size: 28px; font-weight: 800; margin-bottom: 4px;
          color: ${nameColor};
          letter-spacing: -0.03em;
          position: relative;
          font-family: ${nameFontFamily}, sans-serif;
        }
        .profile-card .view-count {
          position: absolute !important;
          top: 18px !important;
          right: 22px !important;
          left: auto !important;
          z-index: 20;
        }
        .name-effect-rainbow {
          background: linear-gradient(100deg, #ff4f8b 0%, #ffd166 18%, #72e0b1 38%, #55d6ff 58%, #a970ff 78%, #ff4f8b 100%);
          background-size: 320% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 14px ${accent}35);
          animation: public-rainbow 5.5s ease-in-out infinite;
        }
        .name-effect-fuzzy {
          text-shadow:
            0 0 4px currentColor,
            0 0 14px ${accent},
            1px 0 8px rgba(85,214,255,0.34),
            -1px 0 8px rgba(255,79,139,0.32);
          animation: public-fuzzy 2.4s ease-in-out infinite;
        }
        .name-effect-typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid currentColor;
          vertical-align: bottom;
          max-width: 100%;
          animation: public-type 4.2s steps(22, end) infinite, public-caret 0.8s step-end infinite;
        }
        .name-effect-glitch {
          text-shadow: 0 0 16px ${accent}44;
          animation: public-glitch-base 3.2s steps(1, end) infinite;
        }
        .name-effect-glitch::before,
        .name-effect-glitch::after {
          content: attr(data-name);
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
        }
        .name-effect-glitch::before {
          color: #ff4f8b;
          transform: translateX(-2px);
          clip-path: inset(0 0 48% 0);
          animation: public-glitch-slice 2.6s steps(1, end) infinite;
        }
        .name-effect-glitch::after {
          color: #55d6ff;
          transform: translateX(2px);
          clip-path: inset(52% 0 0 0);
          animation: public-glitch-slice 2.6s steps(1, end) infinite reverse;
        }
        .name-effect-static {
          color: #fff7ff !important;
          -webkit-text-fill-color: #fff7ff;
          text-shadow:
            1px 0 0 #ff8bef,
            -1px 0 0 #bda3ff,
            0 1px 0 rgba(255,255,255,0.7),
            0 0 7px rgba(255,180,248,0.72),
            0 0 13px rgba(160,120,255,0.46);
          filter: contrast(1.35) brightness(1.1);
          animation: public-static-jitter 0.42s steps(2, end) infinite;
        }
        .name-effect-static::before,
        .name-effect-static::after {
          content: attr(data-name);
          position: absolute;
          inset: 0;
          pointer-events: none;
          color: #fff;
          opacity: 0.72;
          mix-blend-mode: screen;
        }
        .name-effect-static::before {
          text-shadow: 2px 0 #ff7ce7, -1px 0 #ffffff;
          clip-path: inset(0 0 45% 0);
          animation: public-static-slice-a 0.72s steps(1, end) infinite;
        }
        .name-effect-static::after {
          text-shadow: -2px 0 #9d88ff, 1px 0 #ffffff;
          clip-path: inset(48% 0 0 0);
          animation: public-static-slice-b 0.64s steps(1, end) infinite;
        }

        .badges-pill {
          display: flex; gap: 6px; background: rgba(255, 255, 255, 0.08);
          padding: 4px 10px; border-radius: 12px; 
          border: 1px solid rgba(255, 255, 255, 0.1);
          align-items: center; margin-bottom: 10px;
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
          gap: 4px; margin-bottom: 10px; width: 100%;
        }
        .tag-pill {
          background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 8px;
          font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .bio { 
          font-size: 14px; margin-bottom: 14px; line-height: 1.35;
          color: ${bioColor}; 
          font-family: ${bioFontFamily}, sans-serif;
          max-width: 85%; white-space: pre-wrap; word-break: break-word;
        }
        .discord-card {
          width: 100%;
          max-width: 270px;
          min-height: 74px;
          margin-bottom: 14px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background:
            radial-gradient(circle at 80% 20%, ${accent}24, transparent 36%),
            rgba(255,255,255,0.075);
          color: white;
          text-decoration: none;
          overflow: hidden;
        }
        .discord-avatar-wrap {
          position: relative;
          flex: 0 0 auto;
        }
        .discord-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          object-fit: cover;
        }
        .discord-status-dot {
          position: absolute;
          right: 0;
          bottom: 1px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 3px solid rgba(20,20,24,0.92);
          background: #8b8d98;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.2);
        }
        .discord-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }
        .discord-name-row {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }
        .discord-name-row strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 18px;
          font-weight: 900;
          line-height: 1;
        }
        .discord-mini-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #82aaff;
          box-shadow: 0 0 0 3px rgba(130,170,255,0.18);
        }
        .discord-main small {
          color: rgba(255,255,255,0.58);
          font-size: 12px;
          font-style: italic;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .social-row { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-top: 2px; }
        .social-link { transition: 0.3s; opacity: 0.75; }
        .social-link:hover { opacity: 1; transform: scale(1.1) translateY(-2px); }
        .social-icon { width: 24px; height: 24px; }
        .featured-links { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 310px; margin-top: 12px; }
        .featured-link {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 11px 13px; border-radius: 10px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          color: white; text-decoration: none; font-size: 13px; font-weight: 700;
          transition: transform 0.2s, background 0.2s;
        }
        .featured-link:hover { transform: translateY(-1px); background: rgba(255,255,255,0.12); }
        .featured-filled { background: ${accent}; border-color: ${accent}; }
        .featured-outline { background: transparent; border-color: currentColor; }
        .featured-soft { background: ${accent}24; border-color: ${accent}66; }
        .featured-glass { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.12); }
        .featured-link img { width: 18px; height: 18px; opacity: 0.84; }
        .featured-link-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; text-align: left; }
        .featured-link-text small { opacity: 0.6; font-size: 11px; line-height: 1.25; }

        .media-player {
          width: 100%;
          max-width: 310px;
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .media-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }
        .media-title {
          font-size: 12px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .media-sub {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.46);
        }
        .media-btn {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: ${accent};
          color: white;
          cursor: pointer;
          box-shadow: 0 8px 20px ${accent}33;
        }
        .media-volume {
          width: 72px;
          accent-color: ${accent};
        }

        .overlay {
          position: fixed; inset: 0; background: #000; z-index: 100;
          display: ${hasEntered ? 'none' : 'flex'};
          align-items: center; justify-content: center; cursor: pointer;
          font-weight: 700; letter-spacing: 5px; font-size: 11px;
          color: rgba(255,255,255,0.5); transition: 0.3s;
        }
        .overlay:hover { color: white; letter-spacing: 7px; }
        .profile-effect {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: inherit;
          z-index: 0;
        }
        .profile-effect-screen {
          position: absolute;
          inset: 0;
          border-radius: 0;
          z-index: 2;
        }
        .profile-effect-screen::before,
        .profile-effect-screen::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .profile-effect span {
          position: absolute;
          left: var(--left, 50%);
          top: -40px;
          opacity: 0;
        }
        .profile-effect-snow span {
          width: var(--size, 4px);
          height: var(--size, 4px);
          border-radius: 999px;
          background: rgba(255,255,255,var(--alpha,0.82));
          box-shadow: 0 0 10px rgba(255,255,255,0.48);
          filter: blur(var(--flake-blur, 0px));
          animation: public-fall var(--speed, 9s) linear infinite;
          animation-delay: calc(var(--i, 0) * -0.43s);
        }
        .profile-effect-snow::before {
          background:
            radial-gradient(circle at 12% 18%, rgba(255,255,255,0.16), transparent 16%),
            radial-gradient(circle at 84% 10%, rgba(85,214,255,0.12), transparent 18%),
            linear-gradient(180deg, rgba(255,255,255,0.04), transparent 38%);
          opacity: 0.78;
        }
        .profile-effect-rain span {
          width: 1px;
          height: var(--rain-height, 40px);
          border-radius: 999px;
          background: linear-gradient(180deg, transparent, rgba(160,205,255,0.88));
          box-shadow: 0 0 8px rgba(85,214,255,0.25);
          transform: rotate(11deg);
          animation: public-rain var(--rain-speed, 0.86s) linear infinite;
          animation-delay: calc(var(--i, 0) * -0.12s);
        }
        .profile-effect-rain::before {
          background: linear-gradient(180deg, rgba(10,18,32,0.08), rgba(70,120,170,0.18) 72%, rgba(255,255,255,0.08));
        }
        .profile-effect-rain::after {
          background: radial-gradient(ellipse at 50% 100%, rgba(170,205,255,0.2), transparent 56%);
          opacity: 0.55;
        }
        .profile-effect-ctv {
          background:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.075) 0 1px, rgba(0,0,0,0.04) 1px 3px, transparent 3px 6px),
            linear-gradient(90deg, rgba(255,62,140,0.045), transparent 18%, transparent 82%, rgba(65,210,255,0.045));
          opacity: 0.58;
          mix-blend-mode: soft-light;
          animation: public-ctv 0.38s steps(2,end) infinite;
        }
        .profile-effect-ctv::before {
          background:
            radial-gradient(circle, rgba(255,255,255,0.12) 0 0.6px, transparent 1px),
            radial-gradient(circle, rgba(0,0,0,0.18) 0 0.7px, transparent 1.2px);
          background-position: 0 0, 3px 5px;
          background-size: 6px 6px, 8px 8px;
          animation: public-noise 0.36s steps(2,end) infinite;
        }
        .profile-effect-ctv::after {
          background:
            linear-gradient(90deg, rgba(255,0,80,0.08), transparent 8%, transparent 92%, rgba(0,220,255,0.08)),
            radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.22));
        }
        @keyframes public-rainbow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes public-fuzzy {
          0%, 100% { filter: blur(0); transform: translate3d(0,0,0); }
          45% { filter: blur(0.55px); transform: translate3d(0.4px,-0.2px,0); }
          62% { filter: blur(0.2px); transform: translate3d(-0.4px,0.2px,0); }
        }
        @keyframes public-type {
          0%, 12% { max-width: 0; }
          52%, 78% { max-width: 100%; }
          100% { max-width: 0; }
        }
        @keyframes public-caret { 50% { border-color: transparent; } }
        @keyframes public-glitch-base {
          0%, 88%, 100% { transform: none; }
          90% { transform: skewX(-3deg); }
          92% { transform: skewX(2deg) translateX(1px); }
          94% { transform: none; }
        }
        @keyframes public-glitch-slice {
          0%, 86%, 100% { opacity: 0; }
          88% { opacity: 0.8; transform: translate(-2px, -1px); }
          90% { opacity: 0.55; transform: translate(2px, 1px); }
          92% { opacity: 0.72; transform: translate(-1px, 0); }
          94% { opacity: 0; }
        }
        @keyframes public-static-jitter {
          0%, 100% { transform: translate3d(0,0,0); }
          20% { transform: translate3d(-0.8px,0.4px,0); }
          40% { transform: translate3d(0.7px,-0.5px,0); }
          65% { transform: translate3d(-0.4px,-0.2px,0); }
          82% { transform: translate3d(0.5px,0.3px,0); }
        }
        @keyframes public-static-slice-a {
          0%, 100% { opacity: 0.34; transform: translate(0,0); clip-path: inset(0 0 58% 0); }
          18% { opacity: 0.9; transform: translate(-2px,1px); clip-path: inset(8% 0 46% 0); }
          42% { opacity: 0.52; transform: translate(2px,-1px); clip-path: inset(22% 0 39% 0); }
          70% { opacity: 0.78; transform: translate(-1px,0); clip-path: inset(0 0 70% 0); }
        }
        @keyframes public-static-slice-b {
          0%, 100% { opacity: 0.3; transform: translate(0,0); clip-path: inset(46% 0 0 0); }
          24% { opacity: 0.84; transform: translate(2px,-1px); clip-path: inset(51% 0 12% 0); }
          55% { opacity: 0.58; transform: translate(-2px,1px); clip-path: inset(34% 0 21% 0); }
          80% { opacity: 0.74; transform: translate(1px,0); clip-path: inset(62% 0 0 0); }
        }
        @keyframes public-fall {
          0% { opacity: 0; transform: translate3d(0,-30px,0) rotate(0deg); }
          12%, 88% { opacity: 0.82; }
          100% { opacity: 0; transform: translate3d(var(--drift, 24px), 112vh, 0) rotate(var(--spin, 220deg)); }
        }
        @keyframes public-rain {
          0% { opacity: 0; transform: translate3d(44px,-60px,0) rotate(11deg); }
          14%, 82% { opacity: 0.86; }
          100% { opacity: 0; transform: translate3d(-48px,112vh,0) rotate(11deg); }
        }
        @keyframes public-ctv {
          0%, 100% { filter: contrast(1.04) saturate(1.06); transform: translateX(0); }
          50% { filter: contrast(1.1) saturate(1.12); transform: translateX(0.5px); }
        }
        @keyframes public-noise {
          0% { transform: translate3d(0,0,0); opacity: 0.35; }
          100% { transform: translate3d(-2px,1px,0); opacity: 0.55; }
        }
      `}</style>

      {!hasEntered && <div className="overlay" onClick={handleEnter}>[ CLICK TO ENTER ]</div>}

      <div className="bg-wrapper">
        {profile.background_type === "video" && bgUrl ? (
          <video key={bgUrl} ref={videoRef} src={bgUrl} className="bg-content" loop muted playsInline />
        ) : profile.background_type === "image" && bgUrl ? (
          <img key={bgUrl} src={bgUrl} className="bg-content" alt="bg" />
        ) : null}
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}

      {profileMeta.profileEffect !== "none" && (
        <div className={`profile-effect profile-effect-${profileMeta.profileEffect} profile-effect-screen`} aria-hidden="true">
          {Array.from({ length: profileMeta.profileEffect === "snow" ? 62 : profileMeta.profileEffect === "rain" ? 42 : 28 }).map((_, index) => (
            <span
              key={index}
              style={{
                "--i": index,
                "--size": `${1.5 + ((index * 7) % 5) * 0.7}px`,
                "--speed": `${7.5 + ((index * 11) % 9) * 0.55}s`,
                "--rain-speed": `${0.72 + (index % 5) * 0.08}s`,
                "--rain-height": `${32 + (index % 5) * 8}px`,
                "--twinkle-speed": `${2 + (index % 6) * 0.3}s`,
                "--drift": `${-34 + ((index * 13) % 17) * 5}px`,
                "--spin": `${140 + ((index * 19) % 180)}deg`,
                "--alpha": `${0.38 + ((index * 17) % 55) / 100}`,
                "--flake-blur": `${((index * 5) % 3) * 0.2}px`,
                "--left": `${2 + ((index * 7.9) % 96)}%`,
                "--star-top": `${7 + ((index * 3.1) % 78)}%`,
              } as any}
            />
          ))}
        </div>
      )}

      <div className="profile-card">
        <div className="view-count">
          <Eye size={14} strokeWidth={2.5} />
          {/* We show current views + 1 so the user's visit is counted instantly on screen */}
          {((profile.views || 0) + 1).toLocaleString()}
        </div>

        <img src={avatarUrl} className="pfp" alt="profile" />
        
        <div className={`display-name name-effect-${profileMeta.usernameEffect}`} data-name={profile.display_name}>{profile.display_name}</div>

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

        {(discordName || discordUrl) && (
          discordUrl ? (
            <a className="discord-card" href={discordUrl} target="_blank" rel="noopener noreferrer">
              <span className="discord-avatar-wrap"><img className="discord-avatar" src={discordAvatar} alt="" /><span className="discord-status-dot" /></span>
              <span className="discord-main"><span className="discord-name-row"><strong>{discordName || "Discord"}</strong><span className="discord-mini-dot" /></span><small>{discordStatus}</small></span>
            </a>
          ) : (
            <div className="discord-card">
              <span className="discord-avatar-wrap"><img className="discord-avatar" src={discordAvatar} alt="" /><span className="discord-status-dot" /></span>
              <span className="discord-main"><span className="discord-name-row"><strong>{discordName || "Discord"}</strong><span className="discord-mini-dot" /></span><small>{discordStatus}</small></span>
            </div>
          )
        )}

        <div className="social-row">
          {socials.filter((l: any) => !l.featured).map((l: any) => (
            <a key={l.id} href={clickHref(l)} target="_blank" rel="noopener noreferrer" className="social-link">
              <img src={getIcon(l)} className="social-icon" alt="icon" />
            </a>
          ))}
        </div>

        <div className="featured-links">
          {socials.filter((l: any) => l.label && l.featured).slice(0, 4).map((l: any) => (
            <a key={`featured-${l.id}`} href={clickHref(l)} target="_blank" rel="noopener noreferrer" className={featureClass(l.style)} style={{ borderColor: safeColor(l.color, accent) }}>
              <span className="featured-link-text">
                <span>{String(l.label).slice(0, 40)}</span>
                {l.description && <small>{String(l.description).slice(0, 80)}</small>}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <img src={getIcon(l)} alt="" />
                <ExternalLink size={15} />
              </span>
            </a>
          ))}
        </div>

        {audioUrl && audioSettings.showPlayer && (
          <div className="media-player">
            <button className="media-btn" onClick={toggleAudio} aria-label={isPlaying ? "Pause audio" : "Play audio"}>
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            <div className="media-main">
              <span className="media-title">{audioTitle}</span>
              <span className="media-sub">{isPlaying ? "Now playing" : "Profile audio"}</span>
            </div>
            <input
              className="media-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const nextVolume = parseFloat(e.target.value)
                setVolume(nextVolume)
                setIsMuted(nextVolume === 0)
              }}
              aria-label="Audio volume"
            />
          </div>
        )}
      </div>
    </div>
  )
}
