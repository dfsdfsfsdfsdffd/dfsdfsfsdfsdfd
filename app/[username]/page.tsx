"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Pencil, BarChart3, LogOut, Copy, Check, MousePointer2 } from "lucide-react"

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
  const [devPassword, setDevPassword] = useState("")

  // Appearance & Styles
  const [accent, setAccent] = useState("#3b82f6")
  const [nameColor, setNameColor] = useState("#ffffff")
  const [bioColor, setBioColor] = useState("rgba(255,255,255,0.7)")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")
  const [showGlass, setShowGlass] = useState(true)
  const [avatarShape, setAvatarShape] = useState("circle")
  const [accentGlow, setAccentGlow] = useState(true)

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
        setNameColor(profile.name_color || "#ffffff")
        setBioColor(profile.bio_color || "rgba(255,255,255,0.7)")
        setFont(profile.font_family || "Inter")
        setBgType(profile.background_type || "gradient")
        setBadges(profile.badges || { user: true })
        setBgAudio(profile.audio_url || "")
        setShowGlass(profile.show_glass_card ?? true)
        setAvatarShape(profile.avatar_shape || "circle")
        setAccentGlow(profile.accent_glow ?? true)

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
      name_color: nameColor,
      bio_color: bioColor,
      font_family: font,
      background_type: bgType,
      background_value: bgType === "gradient" ? gradient : (bgType === "video" ? bgVideo : bgImage),
      audio_url: bgAudio,
      badges: badges,
      show_glass_card: showGlass,
      avatar_shape: avatarShape,
      accent_glow: accentGlow,
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

  const addLink = () => setLinks([...links, { id: Date.now(), title: "New Link", url: "" }])

  const updateLink = (i: number, key: string, val: string) => {
    const copy = [...links]
    copy[i][key] = val
    setLinks(copy)
  }

  if (loading) return <div style={{ height: '100vh', background: '#050106' }} />

  // --- HUB VIEW ---
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

  // --- EDITOR VIEW ---
  return (
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, sans-serif` }}>
      <div className="scdb-sidebar">
        <div className="scdb-back" onClick={() => setView("hub")}>← Back to Hub</div>
        <button className="scdb-btn" onClick={saveChanges} style={{ width: '100%', marginBottom: '20px', background: accent }}>
          {saving ? "Saving..." : "Save & Publish"}
        </button>

        <div className="scdb-tabs">
          <div className={`scdb-tab ${tab === "profile" ? "scdb-tab-active" : ""}`} onClick={() => setTab("profile")}>Profile</div>
          <div className={`scdb-tab ${tab === "appearance" ? "scdb-tab-active" : ""}`} onClick={() => setTab("appearance")}>Style</div>
        </div>

        {tab === "profile" && (
          <div className="scdb-card">
            <label className="scdb-label">Avatar URL</label>
            <input className="scdb-input" value={avatar} onChange={e => setAvatar(e.target.value)} />
            <label className="scdb-label">Display Name</label>
            <input className="scdb-input" value={name} onChange={e => setName(e.target.value)} />
            <label className="scdb-label">Bio</label>
            <textarea className="scdb-input" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
            
            <button className="scdb-btn" onClick={addLink} style={{marginTop: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}>+ Add Social Link</button>
            {links.map((l, i) => (
              <div key={l.id} style={{ marginTop: '10px' }}>
                <input className="scdb-input" value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="URL (e.g. instagram.com/user)" />
              </div>
            ))}
          </div>
        )}

        {tab === "appearance" && (
          <div className="scdb-card">
            <label className="scdb-label">Name Color</label>
            <input type="color" className="scdb-input" value={nameColor} onChange={e => setNameColor(e.target.value)} />
            
            <label className="scdb-label">Bio Color</label>
            <input type="color" className="scdb-input" value={bioColor} onChange={e => setBioColor(e.target.value)} />

            <label className="scdb-label">Accent Color</label>
            <input type="color" className="scdb-input" value={accent} onChange={e => setAccent(e.target.value)} />

            <label className="scdb-label">Avatar Shape</label>
            <select className="scdb-input" value={avatarShape} onChange={e => setAvatarShape(e.target.value)}>
              <option value="circle">Circle</option>
              <option value="squircle">Squircle</option>
              <option value="rounded">Rounded Square</option>
            </select>

            <label className="scdb-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '15px' }}>
              <input type="checkbox" checked={accentGlow} onChange={e => setAccentGlow(e.target.checked)} />
              Enable Accent Glow
            </label>

            <label className="scdb-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
              <input type="checkbox" checked={showGlass} onChange={e => setShowGlass(e.target.checked)} />
              Glass Card
            </label>
          </div>
        )}
      </div>

      <div className="scdb-preview">
        {bgType === "gradient" && <div className="scdb-bg" style={{ background: gradient }} />}
        {bgType === "video" && bgVideo && <video className="scdb-video" src={bgVideo} autoPlay loop muted playsInline />}
        {bgType === "image" && bgImage && <img className="scdb-image" src={bgImage} alt="" />}
        {bgAudio && <audio src={bgAudio} autoPlay loop />}
        
        <div className="scdb-profile-card" style={{
           background: showGlass ? 'rgba(0,0,0,0.3)' : 'transparent',
           backdropFilter: showGlass ? 'blur(15px)' : 'none',
           border: showGlass ? '1px solid rgba(255,255,255,0.1)' : 'none'
        }}>
          <img 
            src={avatar} 
            className="scdb-pfp" 
            style={{ 
              borderRadius: avatarShape === 'circle' ? '50%' : avatarShape === 'squircle' ? '25%' : '12px',
              boxShadow: accentGlow ? `0 0 40px ${accent}` : 'none' 
            }} 
          />
          
          <h2 className="scdb-name" style={{ color: nameColor }}>{name}</h2>
          <p className="scdb-bio" style={{ color: bioColor }}>{bio}</p>

          <div className="scdb-badges">
            {badges.user && <div className="badge">User</div>}
            {badges.dev && <div className="badge dev" style={{ borderColor: accent, color: accent }}>Dev</div>}
          </div>

          <div className="scdb-links-row">
            {links.map(l => {
              if (!l.url) return null;
              const icon = getIcon(l.url)
              return (
                <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" className="scdb-iconButton">
                  <img src={icon} alt="" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
