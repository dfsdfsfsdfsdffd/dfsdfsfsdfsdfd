"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Pencil, BarChart3, LogOut } from "lucide-react"

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
  return "https://cdn.simpleicons.org/pwa/ffffff"
}

export default function SoftcardDashboard() {
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

  // Profile Data
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("akuryō")
  const [username, setUsername] = useState("") 
  const [bio, setBio] = useState("")
  const [links, setLinks] = useState<any[]>([])
  const [badges, setBadges] = useState<any>({ user: true, dev: false })

  // Appearance
  const [accent, setAccent] = useState("#3b82f6")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")
  const [showGlass, setShowGlass] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setAvatar(profile.avatar_url || avatar)
        setName(profile.display_name || name)
        setUsername(profile.username || "") 
        setBio(profile.bio || "")
        setLinks(profile.links || [])
        setAccent(profile.accent_color || "#3b82f6")
        setFont(profile.font_family || "Inter")
        setBgType(profile.background_type || "gradient")
        setBadges(profile.badges || { user: true })
        setBgAudio(profile.audio_url || "")
        setShowGlass(profile.show_glass_card ?? true)

        const bgVal = profile.background_value || "";
        if (profile.background_type === "gradient") setGradient(bgVal || gradient);
        else if (profile.background_type === "video") setBgVideo(bgVal);
        else if (profile.background_type === "image") setBgImage(bgVal);
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  async function saveChanges() {
    if (!supabase) return;
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return;

    const { error } = await supabase.from('profiles').update({
      display_name: name,
      avatar_url: avatar,
      bio: bio,
      links: links,
      accent_color: accent,
      font_family: font,
      background_type: bgType,
      background_value: bgType === "gradient" ? gradient : (bgType === "video" ? bgVideo : bgImage),
      audio_url: bgAudio,
      badges: badges,
      show_glass_card: showGlass,
      setup_completed: true
    }).eq('id', user.id)

    if (error) alert("Error: " + error.message)
    else alert("Published! ♡")
    setSaving(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`softcard.cc/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div style={{ height: '100vh', background: '#050106' }} />

  if (view === "hub") {
    return (
      <div className="softcard-root">
        <div className="hub-logout" onClick={() => supabase?.auth.signOut()}><LogOut size={20} /></div>
        <div className="softcard-container">
          <div className="softcard-header">
            <p className="softcard-status">LOGGED INTO SOFTCARD.CC</p>
            <h1 className="softcard-title">Welcome back, <span className="softcard-brand">{username}</span></h1>
          </div>
          <div className="softcard-hub-wrapper">
            <div className="softcard-hub">
              <div className="softcard-avatar">
                <img src={avatar} alt="" />
              </div>
            </div>
            <button className="softcard-btn softcard-btn-left" onClick={() => setView("editor")}><Pencil size={16}/> Edit</button>
            <button className="softcard-btn softcard-btn-right"><BarChart3 size={16}/> Stats</button>
          </div>
          <div className="softcard-profile-bar">
            <span className="softcard-profile-url">softcard.cc/{username}</span>
            <button className="softcard-copy-btn" onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, sans-serif` }}>
      <style>{`
        .name-row { display: flex; align-items: baseline; justify-content: center; gap: 8px; margin-top: 15px; }
        .name-at { font-size: 14px; opacity: 0.4; font-weight: 400; }
        .name-main { font-size: 32px; font-weight: 600; color: white; }
      `}</style>

      <div className="scdb-sidebar">
        <div className="scdb-back" onClick={() => setView("hub")}>← Back to Hub</div>
        <button className="scdb-btn" onClick={saveChanges} style={{ width: '100%', marginBottom: '20px', background: accent }}>
          {saving ? "Saving..." : "Save & Publish"}
        </button>
        {/* Tabs and inputs remain same as your original editor structure */}
      </div>

      <div className="scdb-preview">
        {bgType === "gradient" && <div className="scdb-bg" style={{ background: gradient }} />}
        {bgType === "video" && bgVideo && <video className="scdb-video" src={bgVideo} autoPlay loop muted playsInline />}
        {bgType === "image" && bgImage && <img className="scdb-image" src={bgImage} />}
        
        <div className="scdb-profile-card">
          <img src={avatar} className="scdb-pfp" style={{ boxShadow: `0 0 40px ${accent}` }} />
          
          <div className="name-row">
            <span className="name-at">@{username}</span>
            <span className="name-main">{name}</span>
          </div>

          <p className="scdb-bio">{bio}</p>

          <div className="scdb-badges">
            {badges.user && <div className="badge">User</div>}
            {badges.dev && <div className="badge dev" style={{ borderColor: accent, color: accent }}>Dev</div>}
          </div>

          <div className="scdb-links-row">
            {links.map(l => (
              <a key={l.id} href={l.url} className="scdb-iconButton">
                <img src={getIcon(l.url)} alt="" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
