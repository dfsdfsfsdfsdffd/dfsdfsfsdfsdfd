"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Pencil, BarChart3, Loader2, LogOut, Copy, Check, Trash2, Plus, ArrowLeft } from "lucide-react"

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
  const found = Object.keys(iconMap).find(key => lowerUrl.includes(key));
  return found ? iconMap[found] : "https://cdn.simpleicons.org/pwa/ffffff";
}

export default function SoftcardDashboard() {
  const router = useRouter();
  
  // 1. STATE
  const [view, setView] = useState<"hub" | "editor">("hub")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState("profile")

  // Database States
  const [avatar, setAvatar] = useState("https://i.imgur.com/2yaf2wb.jpeg")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("") 
  const [bio, setBio] = useState("")
  const [links, setLinks] = useState<any[]>([])
  const [badges, setBadges] = useState<any>({ user: true, dev: false })

  // Appearance States
  const [accent, setAccent] = useState("#ff5cad")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")
  const [showGlass, setShowGlass] = useState(true)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // 2. LOAD DATA
  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setAvatar(profile.avatar_url || avatar)
        setName(profile.display_name || "")
        setUsername(profile.username || "")
        setBio(profile.bio || "")
        setLinks(profile.links || [])
        setAccent(profile.accent_color || "#ff5cad")
        setBgType(profile.background_type || "gradient")
        setBadges(profile.badges || { user: true })
        setBgAudio(profile.audio_url || "")
        setShowGlass(profile.show_glass_card ?? true)
        if (profile.background_type === "gradient") setGradient(profile.background_value || gradient);
        else if (profile.background_type === "video") setBgVideo(profile.background_value || "");
        else if (profile.background_type === "image") setBgImage(profile.background_value || "");
      }
      setLoading(false)
    }
    loadData()
  }, [supabase, router])

  // 3. ACTIONS
  const saveChanges = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return;

    const { error } = await supabase.from('profiles').update({
      display_name: name,
      avatar_url: avatar,
      bio: bio,
      links: links,
      accent_color: accent,
      background_type: bgType,
      background_value: bgType === "gradient" ? gradient : (bgType === "video" ? bgVideo : bgImage),
      audio_url: bgAudio,
      badges: badges,
      show_glass_card: showGlass,
    }).eq('id', user.id)

    setSaving(false)
    if (!error) alert("Saved successfully! ♡")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`softcard.cc/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addLink = () => {
    setLinks([...links, { id: Date.now(), title: "New Link", url: "" }])
  }

  const removeLink = (id: number) => {
    setLinks(links.filter(l => l.id !== id))
  }

  const updateLink = (id: number, key: string, val: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [key]: val } : l))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050106] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#ff5cad]" size={32} />
    </div>
  )

  // 4. VIEW: HUB
  if (view === "hub") {
    return (
      <div className="softcard-root">
        <style>{`
          .softcard-root {
            min-height: 100vh; width: 100%;
            background: radial-gradient(circle at center, #1a0b1a 0%, #050106 100%);
            color: white; display: flex; align-items: center; justify-content: center;
          }
          .softcard-container { text-align: center; width: 100%; max-width: 600px; padding: 20px; }
          .softcard-header { margin-bottom: 40px; }
          .softcard-status { font-size: 10px; letter-spacing: 2px; opacity: 0.5; margin-bottom: 8px; font-weight: 700; }
          .softcard-title { font-size: 32px; font-weight: 600; }
          .softcard-brand { color: #ff5cad; }
          .softcard-hub-wrapper { position: relative; display: inline-block; margin-bottom: 50px; }
          .softcard-hub {
            width: 300px; height: 300px;
            background: rgba(255, 92, 173, 0.03);
            border-radius: 50%;
            border: 1px solid rgba(255, 92, 173, 0.15);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px);
          }
          .softcard-avatar {
            width: 130px; height: 130px;
            border-radius: 50%; overflow: hidden;
            border: 3px solid #ff5cad;
            box-shadow: 0 0 40px rgba(255, 92, 173, 0.3);
          }
          .softcard-avatar img { width: 100%; height: 100%; object-fit: cover; }
          .softcard-btn {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: #ff5cad; border: none; color: white;
            padding: 12px 24px; border-radius: 50px;
            display: flex; align-items: center; gap: 10px;
            font-weight: 700; font-size: 14px; cursor: pointer;
            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 20px rgba(255, 92, 173, 0.2);
          }
          .softcard-btn:hover { transform: translateY(-50%) scale(1.05); background: #ff7bc0; }
          .softcard-btn-left { left: -70px; }
          .softcard-btn-right { right: -70px; }
          .softcard-profile-bar {
            display: inline-flex; align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 10px 10px 10px 24px;
            border-radius: 50px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 20px;
          }
          .softcard-profile-url { opacity: 0.6; font-size: 14px; font-weight: 500; }
          .softcard-copy-btn {
            background: #ff5cad; border: none; color: white;
            padding: 8px 20px; border-radius: 50px;
            font-size: 13px; font-weight: 700; cursor: pointer;
          }
          .hub-logout { position: fixed; top: 30px; right: 30px; opacity: 0.3; cursor: pointer; transition: 0.2s; }
          .hub-logout:hover { opacity: 1; color: #ff5cad; }
        `}</style>

        <div className="hub-logout" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>
          <LogOut size={20} />
        </div>

        <div className="softcard-container">
          <div className="softcard-header">
            <p className="softcard-status">LOGGED INTO SOFTCARD.CC</p>
            <h1 className="softcard-title">
              Welcome back, <span className="softcard-brand">{username || "User"}</span>
            </h1>
          </div>

          <div className="softcard-hub-wrapper">
            <div className="softcard-hub">
              <div className="softcard-avatar">
                <img src={avatar} alt="avatar" />
              </div>
            </div>

            <button className="softcard-btn softcard-btn-left" onClick={() => setView("editor")}>
              <Pencil size={18} />
              <span>Edit</span>
            </button>

            <button className="softcard-btn softcard-btn-right">
              <BarChart3 size={18} />
              <span>Stats</span>
            </button>
          </div>

          <div className="softcard-profile-bar">
            <span className="softcard-profile-url">softcard.cc/{username}</span>
            <button className="softcard-copy-btn" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 5. VIEW: EDITOR
  return (
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, sans-serif` }}>
      <div className="scdb-sidebar">
        <button className="scdb-back-btn" onClick={() => setView("hub")}>
           <ArrowLeft size={16} /> Back to Hub
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20 }}>Edit Profile</h2>
          <button onClick={saveChanges} className="scdb-btn" style={{ margin: 0, background: '#ff5cad' }}>
            {saving ? "..." : "Publish ♡"}
          </button>
        </div>

        <div className="scdb-tabs">
          <div className={`scdb-tab ${tab === "profile" ? "scdb-tab-active" : ""}`} onClick={() => setTab("profile")}>Profile</div>
          <div className={`scdb-tab ${tab === "links" ? "scdb-tab-active" : ""}`} onClick={() => setTab("links")}>Links</div>
          <div className={`scdb-tab ${tab === "appearance" ? "scdb-tab-active" : ""}`} onClick={() => setTab("appearance")}>Style</div>
        </div>

        <div className="scdb-scroll-area">
          {tab === "profile" && (
            <div className="scdb-card">
              <label className="scdb-label">Avatar URL</label>
              <input className="scdb-input" value={avatar} onChange={e => setAvatar(e.target.value)} />
              
              <label className="scdb-label">Display Name</label>
              <input className="scdb-input" value={name} onChange={e => setName(e.target.value)} />
              
              <label className="scdb-label">Bio</label>
              <textarea className="scdb-input" style={{ height: 80 }} value={bio} onChange={e => setBio(e.target.value)} />
            </div>
          )}

          {tab === "links" && (
            <div>
              <button className="scdb-btn" style={{ width: '100%', marginBottom: 15 }} onClick={addLink}>
                <Plus size={16} /> Add New Link
              </button>
              {links.map((link) => (
                <div key={link.id} className="scdb-card" style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <input 
                      className="scdb-input" 
                      style={{ border: 'none', background: 'none', fontWeight: 600, paddingLeft: 0 }}
                      value={link.title} 
                      onChange={e => updateLink(link.id, 'title', e.target.value)}
                    />
                    <Trash2 size={16} className="text-red-400 cursor-pointer" onClick={() => removeLink(link.id)} />
                  </div>
                  <input 
                    className="scdb-input" 
                    placeholder="URL (https://...)" 
                    value={link.url} 
                    onChange={e => updateLink(link.id, 'url', e.target.value)} 
                  />
                </div>
              ))}
            </div>
          )}

          {tab === "appearance" && (
            <div className="scdb-card">
              <label className="scdb-label">Accent Color</label>
              <input type="color" className="scdb-input" style={{ height: 40 }} value={accent} onChange={e => setAccent(e.target.value)} />
              
              <label className="scdb-label" style={{ marginTop: 15 }}>Background Type</label>
              <select className="scdb-input" value={bgType} onChange={e => setBgType(e.target.value)}>
                <option value="gradient">Gradient</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>

              {bgType === "gradient" && (
                <>
                  <label className="scdb-label">Gradient CSS</label>
                  <input className="scdb-input" value={gradient} onChange={e => setGradient(e.target.value)} />
                </>
              )}

              {bgType === "video" && (
                <>
                  <label className="scdb-label">Video URL (.mp4)</label>
                  <input className="scdb-input" value={bgVideo} onChange={e => setBgVideo(e.target.value)} />
                </>
              )}

              {bgType === "image" && (
                <>
                  <label className="scdb-label">Image URL</label>
                  <input className="scdb-input" value={bgImage} onChange={e => setBgImage(e.target.value)} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="scdb-preview">
        {bgType === "gradient" && <div className="scdb-bg" style={{ background: gradient }} />}
        {bgType === "video" && bgVideo && <video className="scdb-video" src={bgVideo} autoPlay loop muted playsInline />}
        {bgType === "image" && bgImage && <img className="scdb-image" src={bgImage} />}
        {bgAudio && <audio src={bgAudio} autoPlay loop />}
        
        <div className={`scdb-profile-card ${showGlass ? 'glass' : ''}`}>
          <img src={avatar} className="scdb-pfp" style={{ boxShadow: `0 0 40px ${accent}` }} />
          
          <div className="name-container">
            <div className="scdb-username">@{username}</div>
            <div className="scdb-name">{name}</div>
          </div>

          <div className="scdb-bio">{bio}</div>
          
          <div className="scdb-links-row">
            {links.map(l => {
              if (!l.url) return null;
              const icon = getIcon(l.url)
              return (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="scdb-link-icon">
                  <img src={icon} alt="icon" style={{ width: 24, height: 24 }} />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
