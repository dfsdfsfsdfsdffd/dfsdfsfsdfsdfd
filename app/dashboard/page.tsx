"use client"

import { useState, useEffect, useMemo, type ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { 
  Pencil, 
  BarChart3, 
  LogOut, 
  ShieldCheck, 
  Code, 
  Star, 
  Plus, 
  X,
  ExternalLink,
  Copy,
  Check,
  Palette,
  User as UserIcon,
  Tag,
  MoveUp,
  MoveDown,
  CopyPlus,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  Play
} from "lucide-react"

// Types
interface SocialLink {
  id: number;
  type: string;
  url: string;
  label?: string;
  description?: string;
  color?: string;
  featured?: boolean;
  enabled?: boolean;
}

interface Badges {
  user: boolean;
  dev: boolean;
  staff: boolean;
}

type ProfileData = {
  avatar: string;
  name: string;
  username: string;
  bio: string;
  age: string;
  gender: string;
  sexuality: string;
  birthday: string;
  timezone: string;
  accent: string;
  nameColor: string;
  bioColor: string;
  font: string;
  bgType: string;
  gradient: string;
  bgVideo: string;
  bgImage: string;
  bgAudio: string;
  bgAudioName: string;
  showAudioPlayer: boolean;
  backgroundAudio: boolean;
  showGlass: boolean;
  views: number;
}

// Social Icon Mapping
const iconMap: Record<string, string> = {
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
  website: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M2 12h20'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E"
}

const badgeInfo = {
  user: { label: "Verified User", description: "This profile belongs to a verified Softcard user." },
  dev: { label: "Developer", description: "This user is marked as a Softcard developer." },
  staff: { label: "Staff", description: "This user is marked as Softcard staff." },
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

function normalizeLinks(items: SocialLink[]) {
  return items
    .map((link) => ({
      ...link,
      label: (link.label || "").trim().slice(0, 40),
      description: (link.description || "").trim().slice(0, 80),
      color: /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(link.color || "") ? link.color : "",
      url: safeExternalUrl(link.url),
      enabled: link.enabled !== false,
      featured: Boolean(link.featured),
    }))
    .filter((link) => link.url);
}

function splitAudioMeta(value: string) {
  if (!value) return { url: "", title: "", showPlayer: true, backgroundAudio: true };

  try {
    const parsed = new URL(value);
    const params = new URLSearchParams(parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash);
    const oldTitle = parsed.hash.startsWith("#softcardTitle=")
      ? decodeURIComponent(parsed.hash.replace("#softcardTitle=", ""))
      : "";
    const title = params.get("title") || oldTitle;
    const showPlayer = params.get("player") !== "0";
    const backgroundAudio = params.get("bg") !== "0";
    parsed.hash = "";
    return { url: parsed.toString(), title, showPlayer, backgroundAudio };
  } catch {
    return { url: value, title: "", showPlayer: true, backgroundAudio: true };
  }
}

function audioUrlWithMeta(url: string, title: string, showPlayer: boolean, backgroundAudio: boolean) {
  if (!url.trim()) return "";

  try {
    const parsed = new URL(url.trim());
    const params = new URLSearchParams();
    const cleanedTitle = title.trim().slice(0, 60);
    if (cleanedTitle) params.set("title", cleanedTitle);
    if (!showPlayer) params.set("player", "0");
    if (!backgroundAudio) params.set("bg", "0");
    parsed.hash = params.toString();
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

function fileTitle(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 60);
}

function uploadLimit(kind: "image" | "video" | "audio") {
  return 50 * 1024 * 1024;
}

function formatMb(bytes: number) {
  return `${Math.floor(bytes / 1024 / 1024)}MB`;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 90) || "softcard-media";
}

export default function SoftcardDashboard() {
  const router = useRouter()

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  const [view, setView] = useState<"hub" | "editor">("hub")
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Consolidated State
  const [profileData, setProfileData] = useState<ProfileData>({
    avatar: "https://i.imgur.com/1X6g1YH.jpeg",
    name: "User",
    username: "",
    bio: "",
    age: "",
    gender: "",
    sexuality: "",
    birthday: "",
    timezone: "",
    accent: "#7000ff",
    nameColor: "#ffffff",
    bioColor: "#ffffffb3",
    font: "Inter",
    bgType: "gradient",
    gradient: "linear-gradient(135deg, #1a0b1a 0%, #050106 100%)",
    bgVideo: "",
    bgImage: "",
    bgAudio: "",
    bgAudioName: "",
    showAudioPlayer: true,
    backgroundAudio: true,
    showGlass: true,
    views: 0
  })

  const themePresets = [
    { name: "Violet", accent: "#a970ff", nameColor: "#ffffff", bioColor: "#d8caff", gradient: "linear-gradient(135deg, #170f2f 0%, #050106 100%)" },
    { name: "Rose", accent: "#ff6bbd", nameColor: "#fff5fb", bioColor: "#ffd6eb", gradient: "linear-gradient(135deg, #2b0719 0%, #050106 100%)" },
    { name: "Cyan", accent: "#55d6ff", nameColor: "#f4fdff", bioColor: "#c7f2ff", gradient: "linear-gradient(135deg, #042336 0%, #02060a 100%)" },
    { name: "Mono", accent: "#ffffff", nameColor: "#ffffff", bioColor: "#b8bcc8", gradient: "linear-gradient(135deg, #17191f 0%, #030406 100%)" },
  ]

  // Helper to extract colors from a CSS linear-gradient string
  const gradientColors = useMemo(() => {
    const match = profileData.gradient.match(/#(?:[0-9a-fA-F]{3}){1,2}/g);
    return {
      c1: match?.[0] || "#1a0b1a",
      c2: match?.[1] || "#050106"
    };
  }, [profileData.gradient]);

  const updateGradient = (c1: string, c2: string) => {
    updateProfile("gradient", `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
  };

  const [links, setLinks] = useState<SocialLink[]>([])
  const [badges, setBadges] = useState<Badges>({ user: true, dev: false, staff: false })

  const timezones = useMemo(() => Intl.supportedValuesOf('timeZone'), []);

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        const audioMeta = splitAudioMeta(profile.audio_url || "");

        setProfileData(prev => ({
          ...prev,
          avatar: profile.avatar_url || prev.avatar,
          name: profile.display_name || prev.name,
          username: profile.username || "",
          bio: profile.bio || "",
          age: profile.age || "",
          gender: profile.gender || "",
          sexuality: profile.sexuality || "",
          birthday: profile.birthday || "",
          timezone: profile.timezone || "",
          accent: profile.accent_color || "#7000ff",
          nameColor: profile.name_color || "#ffffff",
          bioColor: profile.bio_color || "#ffffffb3",
          font: profile.font_family || "Inter",
          bgType: profile.background_type || "gradient",
          bgAudio: audioMeta.url,
          bgAudioName: audioMeta.title,
          showAudioPlayer: audioMeta.showPlayer,
          backgroundAudio: audioMeta.backgroundAudio,
          views: profile.views || 0,
          showGlass: profile.show_glass_card ?? true,
          gradient: profile.background_type === "gradient" ? profile.background_value : prev.gradient,
          bgVideo: profile.background_type === "video" ? profile.background_value : "",
          bgImage: profile.background_type === "image" ? profile.background_value : ""
        }))
        setLinks(profile.links || [])
        setBadges(profile.badges || { user: true, dev: false, staff: false })
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const saveChanges = async () => {
    if (!supabase) return;
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from('profiles').update({
        display_name: profileData.name,
        avatar_url: profileData.avatar,
        bio: profileData.bio,
        age: profileData.age,
        gender: profileData.gender,
        sexuality: profileData.sexuality,
        birthday: profileData.birthday,
        timezone: profileData.timezone,
        links: normalizeLinks(links),
        accent_color: profileData.accent,
        name_color: profileData.nameColor,
        bio_color: profileData.bioColor,
        font_family: profileData.font,
        background_type: profileData.bgType,
        background_value: profileData.bgType === "gradient" ? profileData.gradient : (profileData.bgType === "video" ? profileData.bgVideo : profileData.bgImage),
        audio_url: audioUrlWithMeta(profileData.bgAudio, profileData.bgAudioName, profileData.showAudioPlayer, profileData.backgroundAudio),
        show_glass_card: profileData.showGlass,
        setup_completed: true
      }).eq('id', user.id)

      if (error) throw error;
      alert("Published successfully!")
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!profileData.username) return;
    navigator.clipboard.writeText(`softcard.cc/${profileData.username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addLink = () => setLinks([...links, { id: Date.now(), type: "website", url: "", label: "", description: "", color: "", featured: false, enabled: true }])
  const removeLink = (id: number) => setLinks(links.filter(l => l.id !== id))
  const updateLink = (index: number, key: keyof SocialLink, val: string | boolean) => {
    const updated = [...links]
    updated[index] = { ...updated[index], [key]: val }
    setLinks(updated)
  }

  const updateProfile = (key: string, value: any) => {
    setProfileData(prev => ({ ...prev, [key]: value }))
  }

  const uploadMedia = async (kind: "image" | "video" | "audio", file: File) => {
    if (!supabase) throw new Error("Uploads are not configured.")

    const limit = uploadLimit(kind)
    if (file.size > limit) {
      throw new Error(`${kind === "image" ? "Image" : kind === "video" ? "Video" : "Audio"} is too large. Use a file under ${formatMb(limit)}.`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("You need to be signed in to upload media.")

    const path = `${user.id}/${kind}/${Date.now()}-${safeFileName(file.name)}`
    const { error } = await supabase.storage
      .from("media")
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      throw new Error(
        error.message.includes("Bucket not found")
          ? "Create a public Supabase Storage bucket named media first."
          : error.message.includes("row-level security")
          ? "Supabase Storage blocked this upload. Add the media bucket RLS policies first."
          : error.message
      )
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path)
    const publicUrl = data.publicUrl

    if (kind === "image") {
      setProfileData(prev => ({ ...prev, bgType: "image", bgImage: publicUrl }))
    }

    if (kind === "video") {
      setProfileData(prev => ({ ...prev, bgType: "video", bgVideo: publicUrl }))
    }

    if (kind === "audio") {
      setProfileData(prev => ({
        ...prev,
        bgAudio: publicUrl,
        bgAudioName: prev.bgAudioName || fileTitle(file.name),
        showAudioPlayer: true,
        backgroundAudio: true,
      }))
    }

    return publicUrl
  }

  const applyPreset = (preset: typeof themePresets[number]) => {
    setProfileData(prev => ({
      ...prev,
      accent: preset.accent,
      nameColor: preset.nameColor,
      bioColor: preset.bioColor,
      bgType: "gradient",
      gradient: preset.gradient,
    }))
  }

  const moveLink = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= links.length) return
    const updated = [...links]
    const current = updated[index]
    updated[index] = updated[target]
    updated[target] = current
    setLinks(updated)
  }

  const duplicateLink = (index: number) => {
    const link = links[index]
    if (!link) return
    const updated = [...links]
    updated.splice(index + 1, 0, { ...link, id: Date.now(), label: link.label ? `${link.label} copy` : "" })
    setLinks(updated)
  }

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  if (loading) return (
    <div style={{ height: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-pulse text-pink-500 font-bold tracking-widest">LOADING SOFTCARD...</div>
    </div>
  )

  if (view === "hub") {
    return (
      <div className="hx-root">
        <style>{`
          .hx-root {
            min-height: 100vh; width: 100%;
            background: radial-gradient(circle at center, #1a0b1a 0%, #050106 100%);
            color: white; display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif;
          }
          .hx-container { text-align: center; width: 100%; max-width: 640px; padding: 22px; }
          .hub-header { margin-bottom: 40px; }
          .hx-status { font-size: 10px; letter-spacing: 2px; opacity: 0.5; margin-bottom: 8px; font-weight: 700; }
          .hx-title { font-size: 32px; font-weight: 600; }
          .hx-username { color: #f472b6; }
          
          .hx-circle-wrap { position: relative; display: inline-block; margin-bottom: 50px; width: 280px; height: 280px; }
          .hx-circle {
            width: 100%; height: 100%;
            background: rgba(190, 24, 93, 0.05);
            border-radius: 50%;
            border: 1px solid rgba(244, 114, 182, 0.15);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px);
          }
          .hx-avatar {
            width: 140px; height: 140px; border-radius: 50%; overflow: hidden;
            border: 3px solid #f472b6; box-shadow: 0 0 40px rgba(244, 114, 182, 0.2);
          }
          .hx-avatar img { width: 100%; height: 100%; object-fit: cover; }
          
          .hx-btn {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: #ec4899; border: none; color: white;
            padding: 12px 24px; border-radius: 50px;
            display: flex; align-items: center; gap: 10px;
            font-weight: 700; font-size: 14px; cursor: pointer;
            transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          }
          .hx-btn:hover { transform: translateY(-50%) scale(1.05); background: #f472b6; }
          .hx-left { left: -80px; }
          .hx-right { right: -80px; }
          
          .hx-url {
            display: inline-flex; align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 8px 8px 8px 20px; border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1); gap: 15px;
          }
          .hx-small-btn {
            background: #ec4899; border: none; color: white;
            padding: 8px 18px; border-radius: 50px;
            font-size: 13px; font-weight: 700; cursor: pointer;
            display: flex; align-items: center; gap: 6px; transition: 0.2s;
          }
          .hx-small-btn:hover { opacity: 0.9; }
          .hx-view { background: rgba(255,255,255,0.1); text-decoration: none; }

          .hx-logout { position: fixed; top: 30px; right: 30px; opacity: 0.4; cursor: pointer; transition: 0.2s; background: transparent; border: 0; color: white; padding: 0; }
          .hx-logout:hover { opacity: 1; color: #f472b6; }
        `}</style>

        <button className="hx-logout" onClick={handleLogout} aria-label="Log out">
          <LogOut size={20} />
        </button>

        <div className="hx-container">
          <div className="hub-header">
            <p className="hx-status">DASHBOARD</p>
            <h1 className="hx-title">Welcome back, <span className="hx-username">{profileData.username || "User"}</span></h1>
          </div>

          <div className="hx-circle-wrap">
            <div className="hx-circle">
              <div className="hx-avatar">
                <img src={profileData.avatar} alt="avatar" />
              </div>
            </div>

            <button className="hx-btn hx-left" onClick={() => setView("editor")}>
              <Pencil size={18} />
              <span>Edit Page</span>
            </button>

            <button className="hx-btn hx-right">
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>
          </div>

          <div>
            <div className="hx-url">
              <span style={{ opacity: 0.6, fontSize: '14px' }}>softcard.cc/{profileData.username || "..."}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="hx-small-btn" onClick={handleCopy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <a href={`/${profileData.username}`} target="_blank" rel="noreferrer" className="hx-small-btn hx-view">
                  <ExternalLink size={14} />
                  View
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="softcardx-dashboard" style={{ fontFamily: `${profileData.font}, system-ui, sans-serif` }}>
      <style>{`
        .softcardx-dashboard {
          display: flex; height: 100vh; color: white; overflow: hidden;
          background:
            radial-gradient(circle at 18% 12%, rgba(236,72,153,0.16), transparent 32%),
            radial-gradient(circle at 72% 88%, rgba(112,0,255,0.13), transparent 34%),
            #040109;
        }
        .sx-sidebar {
          width: 430px; background: linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.028)), rgba(8, 3, 15, 0.92);
          backdrop-filter: blur(30px); border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 18px; overflow-y: auto; box-shadow: 24px 0 80px rgba(0,0,0,0.38);
        }
        .sx-preview-pane {
          flex: 1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;
          background: radial-gradient(circle at center, rgba(236,72,153,0.08), transparent 35%), #020002;
        }
        
        .sx-profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 90%; max-width: 420px;
          padding: 22px 20px; border-radius: 28px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: ${profileData.showGlass ? 'rgba(0, 0, 0, 0.45)' : 'transparent'};
          backdrop-filter: ${profileData.showGlass ? 'blur(25px)' : 'none'};
          border: ${profileData.showGlass ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          box-shadow: ${profileData.showGlass ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : 'none'};
        }
        
        .sx-pfp { 
          width: 92px; height: 92px; border-radius: 50%; object-fit: cover; margin-bottom: 9px;
          border: 2px solid ${profileData.accent}; padding: 3px;
        }
        
        .sx-name { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 4px; }
        
        .sx-badge-pill { 
          display: flex; gap: 6px; background: rgba(255, 255, 255, 0.08); 
          padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); 
          align-items: center; margin-bottom: 9px;
        }
        .sx-badge-tip { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .sx-badge-tip::after {
          content: attr(data-tip);
          position: absolute; left: 50%; bottom: calc(100% + 9px);
          transform: translateX(-50%) translateY(4px);
          width: max-content; max-width: 190px; padding: 8px 10px;
          border-radius: 8px; background: rgba(0, 0, 0, 0.86);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: white; font-size: 11px; line-height: 1.35;
          opacity: 0; pointer-events: none; transition: 0.18s ease; z-index: 20;
        }
        .sx-badge-tip:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }
        
        .sx-tags-row { 
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px; 
          margin-bottom: 9px; width: 100%;
        }
        .sx-tag-pill {
          background: rgba(255, 255, 255, 0.05); padding: 3px 8px; border-radius: 6px;
          font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sx-bio { font-size: 14px; margin-bottom: 12px; line-height: 1.35; max-width: 85%; white-space: pre-wrap; word-break: break-word; }
        
        .sx-links-row { display: flex; justify-content: center; gap: 13px; flex-wrap: wrap; }
        .sx-icon-link { transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.7; }
        .sx-icon-link:hover { opacity: 1; transform: translateY(-2px) scale(1.05); }
        .sx-icon-link img { width: 24px; height: 24px; }
        .sx-feature-links { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 300px; margin-top: 11px; }
        .sx-feature-link {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          color: white; text-decoration: none; font-size: 13px; font-weight: 700;
        }
        .sx-feature-link-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; text-align: left; }
        .sx-feature-link-text small { opacity: 0.58; font-size: 11px; font-weight: 600; line-height: 1.25; }
        .sx-feature-link img { width: 18px; height: 18px; opacity: 0.82; }
        .sx-preview-player {
          width: 100%; max-width: 300px; margin-top: 11px;
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 14px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
        }
        .sx-preview-player-btn {
          width: 34px; height: 34px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14);
          display: inline-flex; align-items: center; justify-content: center;
          background: ${profileData.accent}; color: white; flex: 0 0 auto;
        }
        .sx-preview-player-text {
          min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; text-align: left;
        }
        .sx-preview-player-text strong {
          font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .sx-preview-player-text span {
          font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.48;
        }
        .sx-check-row {
          display: flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.68); font-size: 12px; font-weight: 700;
          background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07);
          padding: 9px 10px; border-radius: 10px;
        }
        .sx-check-row input { width: 16px; height: 16px; accent-color: ${profileData.accent}; }
        .sx-preset-grid {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px; margin-bottom: 18px;
        }
        .sx-preset {
          border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
          min-height: 64px; padding: 10px; color: white; text-align: left;
          cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;
        }
        .sx-preset span { font-size: 12px; font-weight: 900; }
        .sx-preset small { opacity: 0.62; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }

        .sx-editor-head {
          position: sticky; top: -18px; z-index: 30;
          padding: 18px 0 14px; margin-bottom: 12px;
          background: linear-gradient(180deg, rgba(8,3,15,0.98), rgba(8,3,15,0.88) 74%, transparent);
          backdrop-filter: blur(18px);
        }
        .sx-editor-brand {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;
        }
        .sx-editor-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .sx-editor-logo {
          width: 38px; height: 38px; border-radius: 13px; display: grid; place-items: center;
          background: linear-gradient(135deg, ${profileData.accent}, #ff4df0);
          box-shadow: 0 14px 32px ${profileData.accent}33;
        }
        .sx-editor-title strong { display: block; font-size: 15px; letter-spacing: -0.01em; }
        .sx-editor-title span { display: block; margin-top: 2px; color: rgba(255,255,255,0.46); font-size: 11px; font-weight: 700; }
        .sx-editor-link {
          cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
          min-height: 34px; padding: 0 10px; border-radius: 10px;
          color: rgba(255,255,255,0.56); background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.08);
          font-size: 12px; font-weight: 800;
        }
        .sx-editor-link:hover { opacity: 1; color: #ec4899; }

        .sx-publish-btn {
            width: 100%; padding: 14px; border-radius: 14px; border: none; font-weight: 900; letter-spacing: 0.02em;
            background: linear-gradient(90deg, #ff008c, #ff4df0); color: white; cursor: pointer;
            box-shadow: 0 12px 30px rgba(255, 0, 128, 0.25); margin-bottom: 0; transition: 0.2s;
        }
        .sx-publish-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .sx-publish-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sx-tabs-row {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; margin-bottom: 16px;
          background: rgba(255,255,255,0.035); padding: 6px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.07);
        }
        .sx-tab {
          min-height: 46px; border-radius: 12px; cursor: pointer; opacity: 0.68; text-align: center; transition: 0.2s;
          font-size: 10px; font-weight: 900; text-transform: uppercase; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 5px; color: rgba(255,255,255,0.72);
          border: 0; background: transparent;
        }
        .sx-tab:hover { opacity: 1; background: rgba(255,255,255,0.055); }
        .sx-tab-active { background: linear-gradient(135deg, ${profileData.accent}, #ec4899); opacity: 1; color: white; box-shadow: 0 10px 24px ${profileData.accent}28; }
        
        .sx-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.4; margin-bottom: 8px; display: block; font-weight: 800; }
        .sx-input-group { margin-bottom: 14px; }
        
        .sx-input {
            width: 100%; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08); color: white; outline: none; transition: 0.2s; font-size: 14px;
            appearance: none;
        }

        select.sx-input {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 16px;
            padding-right: 40px;
        }

        .sx-input option {
            background-color: #1a0b1a; 
            color: white;
            padding: 10px;
        }
        
        .sx-bg-layer { position: absolute; inset: 0; z-index: 1; object-fit: cover; width: 100%; height: 100%; }

        .sx-pane { padding-bottom: 32px; }
        .sx-link-card {
            background: linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.026));
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 16px; padding: 14px; margin-bottom: 12px; position: relative;
        }
        .sx-remove-link {
            position: absolute; top: -10px; right: -10px;
            background: #ef4444; color: white; border: none;
            width: 24px; height: 24px; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .sx-link-actions {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        }
        .sx-select-wrap { position: relative; }
        .sx-select-wrap .sx-input { padding-right: 42px; }
        .sx-select-icon {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          pointer-events: none; opacity: 0.7; color: white;
        }
        .sx-link-tool {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          min-height: 34px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.045); color: white; font-size: 12px; font-weight: 800;
          cursor: pointer;
        }
        .sx-link-tool:disabled { opacity: 0.38; cursor: not-allowed; }
        
        .tag-input-wrapper { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .sx-tag-clear { 
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 10px; padding: 10px; cursor: pointer; color: #ff4d4d; transition: 0.2s;
        }
        .sx-tag-clear:hover { background: rgba(255, 77, 77, 0.2); border-color: #ff4d4d; }
        .sx-upload-grid {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 10px;
        }
        .sx-upload-box {
          position: relative; min-height: 96px; border-radius: 14px; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
          border: 1px dashed rgba(255,255,255,0.18); background: rgba(255,255,255,0.035);
          color: rgba(255,255,255,0.74); text-align: center; padding: 14px; transition: 0.18s;
        }
        .sx-upload-box:hover { border-color: ${profileData.accent}; background: rgba(255,255,255,0.06); color: white; }
        .sx-upload-box input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .sx-upload-box strong { font-size: 12px; }
        .sx-upload-box span { font-size: 10px; opacity: 0.58; line-height: 1.35; }
        .sx-media-current {
          margin-top: 8px; padding: 9px 10px; border-radius: 10px;
          background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.62); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .sx-editor-section {
          margin-bottom: 18px; padding: 14px; border-radius: 16px;
          background: rgba(255,255,255,0.026); border: 1px solid rgba(255,255,255,0.07);
        }
        .sx-section-title {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          margin-bottom: 12px; color: rgba(255,255,255,0.86);
          font-size: 12px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
        }
        .sx-section-title span {
          display: inline-flex; align-items: center; gap: 8px;
        }
        .sx-section-title small {
          color: rgba(255,255,255,0.42); font-size: 10px; font-weight: 800; letter-spacing: 0.08em;
        }
        .sx-danger-mini {
          border: 1px solid rgba(255,77,77,0.22); background: rgba(255,77,77,0.09);
          color: #ff8f8f; border-radius: 10px; min-width: 38px; min-height: 38px;
          display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .sx-danger-mini:hover { border-color: rgba(255,77,77,0.5); background: rgba(255,77,77,0.16); }
      `}</style>

      <div className="sx-sidebar">
        <div className="sx-editor-head">
          <div className="sx-editor-brand">
            <div className="sx-editor-title">
              <div className="sx-editor-logo">
                <Palette size={18} />
              </div>
              <div>
                <strong>Page editor</strong>
                <span>softcard.cc/{profileData.username || "username"}</span>
              </div>
            </div>
            <button className="sx-editor-link" onClick={() => setView("hub")}>
              <X size={15} /> Close
            </button>
          </div>

          <button className="sx-publish-btn" onClick={saveChanges} disabled={saving}>
            {saving ? "Saving Changes..." : "Save & Publish Page"}
          </button>
        </div>

        <div className="sx-tabs-row">
          <button className={`sx-tab ${tab === "profile" ? "sx-tab-active" : ""}`} onClick={() => setTab("profile")}>
            <UserIcon size={12} /> Profile
          </button>
          <button className={`sx-tab ${tab === "tags" ? "sx-tab-active" : ""}`} onClick={() => setTab("tags")}>
            <Tag size={12} /> Tags
          </button>
          <button className={`sx-tab ${tab === "appearance" ? "sx-tab-active" : ""}`} onClick={() => setTab("appearance")}>
            <Palette size={12} /> Style
          </button>
          <button className={`sx-tab ${tab === "badges" ? "sx-tab-active" : ""}`} onClick={() => setTab("badges")}>
            <ShieldCheck size={12} /> Badges
          </button>
        </div>

        {tab === "profile" && (
          <div className="sx-pane">
            <section className="sx-editor-section">
              <div className="sx-section-title">
                <span><UserIcon size={14} /> Identity</span>
                <small>profile basics</small>
              </div>
              <div className="sx-input-group">
                <label className="sx-label">Avatar Image URL</label>
                <input className="sx-input" value={profileData.avatar} onChange={e => updateProfile("avatar", e.target.value)} placeholder="https://..." />
              </div>
              <div className="sx-input-group">
                <label className="sx-label">Display Name</label>
                <input className="sx-input" value={profileData.name} onChange={e => updateProfile("name", e.target.value)} />
              </div>
              <div className="sx-input-group" style={{marginBottom: 0}}>
                <label className="sx-label">Short Bio</label>
                <textarea 
                  className="sx-input" 
                  rows={3} 
                  style={{resize: 'none'}} 
                  value={profileData.bio} 
                  onChange={e => updateProfile("bio", e.target.value)} 
                  placeholder="Tell the world about yourself..." 
                  maxLength={150}
                />
                <span className="text-[10px] opacity-30 mt-1 block text-right">{profileData.bio.length}/150</span>
              </div>
            </section>
            
            <section className="sx-editor-section">
                <div className="sx-section-title">
                  <span><ExternalLink size={14} /> Social Links</span>
                  <small>{links.length} total</small>
                </div>
                {links.map((l, i) => (
                <div key={l.id} className="sx-link-card">
                    <button className="sx-remove-link" onClick={() => removeLink(l.id)}><X size={14}/></button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="sx-select-wrap">
                      <select className="sx-input" value={l.type} onChange={e => updateLink(i, "type", e.target.value)}>
                          {Object.keys(iconMap).map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
                      </select>
                      <ChevronDown className="sx-select-icon" size={18} />
                    </div>
                    <input className="sx-input" value={l.label || ""} onChange={e => updateLink(i, "label", e.target.value)} placeholder="Display label (optional)" maxLength={40} />
                    <input className="sx-input" value={l.description || ""} onChange={e => updateLink(i, "description", e.target.value)} placeholder="Small description for featured button" maxLength={80} />
                    <input className="sx-input" value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="https://..." />
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 48px', gap: '10px', alignItems: 'center'}}>
                      <input className="sx-input" value={l.color || ""} onChange={e => updateLink(i, "color", e.target.value)} placeholder="Custom color, ex: #a970ff" maxLength={7} />
                      <input type="color" className="sx-input" style={{height: '42px', padding: '5px'}} value={l.color || profileData.accent} onChange={e => updateLink(i, "color", e.target.value)} />
                    </div>
                    <div className="sx-link-actions">
                      <button className="sx-link-tool" type="button" disabled={i === 0} onClick={() => moveLink(i, -1)}>
                        <MoveUp size={14} /> Up
                      </button>
                      <button className="sx-link-tool" type="button" disabled={i === links.length - 1} onClick={() => moveLink(i, 1)}>
                        <MoveDown size={14} /> Down
                      </button>
                      <button className="sx-link-tool" type="button" onClick={() => duplicateLink(i)}>
                        <CopyPlus size={14} /> Copy
                      </button>
                    </div>
                    <label className="sx-check-row">
                      <input type="checkbox" checked={l.enabled !== false} onChange={e => updateLink(i, "enabled", e.target.checked)} />
                      <span>Show on profile</span>
                    </label>
                    <label className="sx-check-row">
                      <input type="checkbox" checked={Boolean(l.featured)} onChange={e => updateLink(i, "featured", e.target.checked)} />
                      <span>Feature as large button</span>
                    </label>
                    </div>
                </div>
                ))}
                <button className="sx-publish-btn" onClick={addLink} style={{background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px dashed rgba(255,255,255,0.2)', marginTop: '10px'}}>
                    <Plus size={18} /> Add New Link
                </button>
            </section>
          </div>
        )}

        {tab === "tags" && (
          <div className="sx-pane">
            <div className="sx-input-group">
              <label className="sx-label">Age</label>
              <div className="tag-input-wrapper">
                <input type="number" className="sx-input" placeholder="Age" value={profileData.age} onChange={e => updateProfile("age", e.target.value.slice(0, 2))} />
                <button className="sx-tag-clear" onClick={() => updateProfile("age", "")}><X size={16} /></button>
              </div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Gender</label>
              <div className="tag-input-wrapper">
                <select className="sx-input" value={profileData.gender} onChange={e => updateProfile("gender", e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
                <button className="sx-tag-clear" onClick={() => updateProfile("gender", "")}><X size={16} /></button>
              </div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Sexuality</label>
              <div className="tag-input-wrapper">
                <select className="sx-input" value={profileData.sexuality} onChange={e => updateProfile("sexuality", e.target.value)}>
                  <option value="">Select Sexuality</option>
                  <option value="Straight">Straight</option>
                  <option value="Gay">Gay</option>
                  <option value="Lesbian">Lesbian</option>
                  <option value="Bisexual">Bisexual</option>
                  <option value="Pansexual">Pansexual</option>
                  <option value="Asexual">Asexual</option>
                  <option value="Queer">Queer</option>
                </select>
                <button className="sx-tag-clear" onClick={() => updateProfile("sexuality", "")}><X size={16} /></button>
              </div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Birthday</label>
              <div className="tag-input-wrapper">
                <input type="date" className="sx-input" value={profileData.birthday} onChange={e => updateProfile("birthday", e.target.value)} />
                <button className="sx-tag-clear" onClick={() => updateProfile("birthday", "")}><X size={16} /></button>
              </div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Timezone</label>
              <div className="tag-input-wrapper">
                <select className="sx-input" value={profileData.timezone} onChange={e => updateProfile("timezone", e.target.value)}>
                  <option value="">Select Timezone</option>
                  {timezones.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
                </select>
                <button className="sx-tag-clear" onClick={() => updateProfile("timezone", "")}><X size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {tab === "appearance" && (
          <div className="sx-pane">
            <section className="sx-editor-section">
              <div className="sx-section-title">
                <span><Palette size={14} /> Theme</span>
                <small>fast presets</small>
              </div>
              <div className="sx-preset-grid">
                {themePresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    className="sx-preset"
                    style={{ background: preset.gradient }}
                    onClick={() => applyPreset(preset)}
                  >
                    <span>{preset.name}</span>
                    <small>Apply theme</small>
                  </button>
                ))}
              </div>

              <div className="sx-input-group" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', marginBottom: 0}}>
                  <input type="checkbox" id="glass" checked={profileData.showGlass} onChange={e => updateProfile("showGlass", e.target.checked)} style={{width: '18px', height: '18px'}} />
                  <label htmlFor="glass" style={{margin: 0, fontSize: '13px', cursor: 'pointer'}}>Transparent Glass Card</label>
              </div>
            </section>

            <section className="sx-editor-section">
              <div className="sx-section-title">
                <span><UserIcon size={14} /> Text & Colors</span>
                <small>profile card</small>
              </div>
              <div className="sx-input-group">
                <label className="sx-label">Font Style</label>
                <select className="sx-input" value={profileData.font} onChange={e => updateProfile("font", e.target.value)}>
                  <option value="Inter">Inter (Sans)</option>
                  <option value="Playfair Display">Playfair (Serif)</option>
                  <option value="JetBrains Mono">JetBrains (Mono)</option>
                  <option value="Outfit">Outfit (Modern)</option>
                </select>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                  <div className="sx-input-group"><label className="sx-label">Name Color</label><input type="color" className="sx-input" style={{height: '45px', padding: '5px'}} value={profileData.nameColor} onChange={e => updateProfile("nameColor", e.target.value)} /></div>
                  <div className="sx-input-group"><label className="sx-label">Accent Color</label><input type="color" className="sx-input" style={{height: '45px', padding: '5px'}} value={profileData.accent} onChange={e => updateProfile("accent", e.target.value)} /></div>
              </div>
              
              <div className="sx-input-group" style={{marginBottom: 0}}>
                  <label className="sx-label">Bio Color</label>
                  <input type="color" className="sx-input" style={{height: '45px', padding: '5px'}} value={profileData.bioColor.length > 7 ? profileData.bioColor.substring(0,7) : profileData.bioColor} onChange={e => updateProfile("bioColor", e.target.value)} />
              </div>
            </section>

            <section className="sx-editor-section">
              <div className="sx-section-title">
                <span><ImageIcon size={14} /> Background</span>
                <small>image/video/gradient</small>
              </div>
              <div className="sx-input-group">
                <label className="sx-label">Background Type</label>
                <select className="sx-input" value={profileData.bgType} onChange={e => updateProfile("bgType", e.target.value)}>
                  <option value="gradient">Gradient</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <label className="sx-label">Upload Background</label>
              <div className="sx-upload-grid">
                <MediaDrop
                  kind="image"
                icon={<ImageIcon size={20} />}
                title="Drop image"
                hint="PNG, JPG, WEBP, GIF up to 50MB"
                  onUpload={uploadMedia}
                />
                <MediaDrop
                  kind="video"
                icon={<Video size={20} />}
                title="Drop video"
                hint="MP4, WEBM, MOV up to 50MB"
                  onUpload={uploadMedia}
                />
              </div>

              {profileData.bgType === "gradient" && (
                <div className="sx-input-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label className="sx-label">Background Colors</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                     <div>
                       <span style={{ fontSize: '10px', opacity: 0.5 }}>START</span>
                       <input type="color" className="sx-input" style={{height: '40px', padding: '4px'}} value={gradientColors.c1} onChange={e => updateGradient(e.target.value, gradientColors.c2)} />
                     </div>
                     <div>
                       <span style={{ fontSize: '10px', opacity: 0.5 }}>END</span>
                       <input type="color" className="sx-input" style={{height: '40px', padding: '4px'}} value={gradientColors.c2} onChange={e => updateGradient(gradientColors.c1, e.target.value)} />
                     </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {[
                      ['#1a0b1a', '#050106'],
                      ['#7000ff', '#ff008c'],
                      ['#00d2ff', '#3a7bd5'],
                      ['#11e1de', '#111111'],
                      ['#833ab4', '#fd1d1d'],
                    ].map(([c1, c2], i) => (
                      <div 
                        key={i} 
                        onClick={() => updateGradient(c1, c2)}
                        style={{ 
                          flexShrink: 0, width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer',
                          background: `linear-gradient(135deg, ${c1}, ${c2})`, border: '1px solid rgba(255,255,255,0.2)'
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {(profileData.bgType === "video" || profileData.bgType === "image") && (
                <div className="sx-input-group" style={{marginBottom: 0}}>
                  <label className="sx-label">{profileData.bgType === "video" ? "Video (.mp4) URL" : "Image URL"}</label>
                  <div className="tag-input-wrapper">
                    <input className="sx-input" value={profileData.bgType === "video" ? profileData.bgVideo : profileData.bgImage} onChange={e => profileData.bgType === "video" ? updateProfile("bgVideo", e.target.value) : updateProfile("bgImage", e.target.value)} placeholder="Direct link..." />
                    <button className="sx-tag-clear" onClick={() => profileData.bgType === "video" ? updateProfile("bgVideo", "") : updateProfile("bgImage", "")}><X size={16} /></button>
                  </div>
                  {(profileData.bgType === "video" ? profileData.bgVideo : profileData.bgImage) && (
                    <div className="sx-media-current">{profileData.bgType === "video" ? profileData.bgVideo : profileData.bgImage}</div>
                  )}
                </div>
              )}
            </section>

            <section className="sx-editor-section">
              <div className="sx-section-title">
                <span><Music size={14} /> Audio Player</span>
                {profileData.bgAudio && (
                  <button className="sx-danger-mini" onClick={() => setProfileData(prev => ({ ...prev, bgAudio: "", bgAudioName: "", showAudioPlayer: true, backgroundAudio: true }))} aria-label="Remove audio">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="sx-input-group">
                <label className="sx-label">Audio Player Name</label>
                <input className="sx-input" value={profileData.bgAudioName} onChange={e => updateProfile("bgAudioName", e.target.value.slice(0, 60))} placeholder="Song name shown on profile" />
              </div>

              <div className="sx-input-group">
                <label className="sx-label">Upload Audio</label>
                <MediaDrop
                  kind="audio"
                  icon={<Music size={20} />}
                  title="Drop audio"
                  hint="MP3, WAV, OGG, WEBM up to 50MB"
                onUpload={uploadMedia}
              />
            </div>

              <label className="sx-check-row">
                <input type="checkbox" checked={profileData.showAudioPlayer} onChange={e => updateProfile("showAudioPlayer", e.target.checked)} />
                <span>Show audio player on profile</span>
              </label>

              <label className="sx-check-row">
                <input type="checkbox" checked={profileData.backgroundAudio} onChange={e => updateProfile("backgroundAudio", e.target.checked)} />
                <span>Use as background audio after click-to-enter</span>
              </label>

              <div className="sx-input-group" style={{marginBottom: 0}}>
                <label className="sx-label">Audio URL</label>
                <div className="tag-input-wrapper">
                  <input className="sx-input" value={profileData.bgAudio} onChange={e => updateProfile("bgAudio", e.target.value)} placeholder="Link to audio file" />
                  {profileData.bgAudio && (
                    <button className="sx-tag-clear" onClick={() => setProfileData(prev => ({ ...prev, bgAudio: "", bgAudioName: "", showAudioPlayer: true, backgroundAudio: true }))}><X size={16} /></button>
                  )}
                </div>
                {profileData.bgAudio && <div className="sx-media-current">{profileData.bgAudio}</div>}
              </div>
            </section>
          </div>
        )}

        {tab === "badges" && (
          <div className="sx-pane">
            <div className="sx-input-group" style={{background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)'}}>
                <label className="sx-label">Badges</label>
                <p style={{fontSize: '13px', lineHeight: 1.5, opacity: 0.62}}>Badges are managed by Softcard and cannot be changed from the dashboard.</p>
            </div>
          </div>
        )}
      </div>

      <div className="sx-preview-pane">
        {profileData.bgType === "gradient" && <div className="sx-bg-layer" style={{ background: profileData.gradient }} />}
        {profileData.bgType === "video" && profileData.bgVideo && <video className="sx-bg-layer" src={profileData.bgVideo} autoPlay loop muted playsInline />}
        {profileData.bgType === "image" && profileData.bgImage && <img className="sx-bg-layer" src={profileData.bgImage} alt="bg" />}
        
        <div className="sx-profile-card">
          <img src={profileData.avatar} className="sx-pfp" alt="profile" />
          
          <div className="sx-name" style={{ color: profileData.nameColor }}>{profileData.name}</div>

          {(badges.user || badges.dev || badges.staff) && (
            <div className="sx-badge-pill">
                {badges.user && <span className="sx-badge-tip" data-tip={badgeInfo.user.description} aria-label={badgeInfo.user.label}><ShieldCheck size={14} color="#3b82f6" /></span>}
                {badges.dev && <span className="sx-badge-tip" data-tip={badgeInfo.dev.description} aria-label={badgeInfo.dev.label}><Code size={14} color={profileData.accent} /></span>}
                {badges.staff && <span className="sx-badge-tip" data-tip={badgeInfo.staff.description} aria-label={badgeInfo.staff.label}><Star size={14} color="#f59e0b" /></span>}
            </div>
          )}

          <div className="sx-tags-row">
            {profileData.age && <span className="sx-tag-pill">{profileData.age} y/o</span>}
            {profileData.gender && <span className="sx-tag-pill">{profileData.gender}</span>}
            {profileData.sexuality && <span className="sx-tag-pill">{profileData.sexuality}</span>}
            {profileData.birthday && <span className="sx-tag-pill">{new Date(profileData.birthday).toLocaleDateString(undefined, {month: 'short', day: 'numeric', timeZone: 'UTC'})}</span>}
            {profileData.timezone && <span className="sx-tag-pill">{profileData.timezone.split('/').pop()?.replace('_', ' ')}</span>}
          </div>

          <div className="sx-bio" style={{ color: profileData.bioColor }}>{profileData.bio || "No bio yet."}</div>
          
          <div className="sx-links-row">
            {links.map(l => l.url && l.enabled !== false && !l.featured && safeExternalUrl(l.url) && (
              <a key={l.id} href={safeExternalUrl(l.url)} target="_blank" rel="noreferrer" className="sx-icon-link">
                <img src={iconMap[l.type] || iconMap.website} alt={l.type} />
              </a>
            ))}
          </div>
          <div className="sx-feature-links">
            {links.filter(l => l.url && l.label && l.enabled !== false && l.featured && safeExternalUrl(l.url)).slice(0, 4).map(l => (
              <a key={`feature-${l.id}`} href={safeExternalUrl(l.url)} target="_blank" rel="noreferrer" className="sx-feature-link" style={{ borderColor: l.color || profileData.accent }}>
                <span className="sx-feature-link-text">
                  <span>{l.label}</span>
                  {l.description && <small>{l.description}</small>}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <img src={iconMap[l.type] || iconMap.website} alt="" />
                  <ExternalLink size={15} />
                </span>
              </a>
            ))}
          </div>
          {profileData.bgAudio && profileData.showAudioPlayer && (
            <div className="sx-preview-player">
              <span className="sx-preview-player-btn">
                <Play size={15} fill="currentColor" />
              </span>
              <span className="sx-preview-player-text">
                <strong>{profileData.bgAudioName || fileTitle(profileData.bgAudio.split("/").pop()?.split("?")[0] || "Profile audio") || "Profile audio"}</strong>
                <span>Profile audio</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MediaDrop({
  kind,
  icon,
  title,
  hint,
  onUpload,
}: {
  kind: "image" | "video" | "audio";
  icon: ReactNode;
  title: string;
  hint: string;
  onUpload: (kind: "image" | "video" | "audio", file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(file?: File) {
    if (!file || uploading) return
    setUploading(true)
    try {
      await onUpload(kind, file)
    } catch (error: any) {
      alert(error.message || "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <label
      className="sx-upload-box"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        handleFile(event.dataTransfer.files?.[0])
      }}
    >
      {uploading ? <Upload size={20} /> : icon}
      <strong>{uploading ? "Uploading..." : title}</strong>
      <span>{hint}</span>
      <input
        type="file"
        accept={kind === "image" ? "image/*" : kind === "video" ? "video/*" : "audio/*"}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </label>
  )
}
