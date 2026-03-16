"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Pencil, BarChart3, Loader2, LogOut, Copy, Check, ArrowLeft } from "lucide-react"

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

    await supabase.from('profiles').update({
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
    alert("Saved! ♡")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`softcard.cc/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050106] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#ff5cad]" size={32} />
    </div>
  )

  // 4. VIEW: NEW HUB
  if (view === "hub") {
    return (
      <div className="softcard-root">
        <style>{`
          .softcard-root {
            min-height: 100vh; width: 100%;
            background: radial-gradient(circle at center, #1a0b1a 0%, #050106 100%);
            color: white; display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif;
          }
          .softcard-container { text-align: center; width: 100%; max-width: 600px; padding: 20px; }
          .softcard-header { margin-bottom: 40px; }
          .softcard-status { font-size: 10px; letter-spacing: 2px; opacity: 0.5; margin-bottom: 8px; font-weight: 700; }
          .softcard-title { font-size: 32px; font-weight: 600; }
          .softcard-brand { color: #ff5cad; }
          .softcard-hub-wrapper { position: relative; display: inline-block; margin-bottom: 50px; width: 300px; height: 300px; }
          .softcard-hub {
            width: 100%; height: 100%;
            background: rgba(255, 92, 173, 0.03);
            border-radius: 50%; border: 1px solid rgba(255, 92, 173, 0.15);
            display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);
          }
          .softcard-avatar {
            width: 130px; height: 130px; border-radius: 50%; overflow: hidden;
            border: 3px solid #ff5cad; box-shadow: 0 0 40px rgba(255, 92, 173, 0.3);
          }
          .softcard-avatar img { width: 100%; height: 100%; object-fit: cover; }
          .softcard-btn {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: #ff5cad; border: none; color: white; padding: 12px 24px;
            border-radius: 50px; display: flex; align-items: center; gap: 10px;
            font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.3s;
          }
          .softcard-btn:hover { transform: translateY(-50%) scale(1.05); background: #ff7bc0; }
          .softcard-btn-left { left: -70px; }
          .softcard-btn-right { right: -70px; }
          .softcard-profile-bar {
            display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.05);
            padding: 10px 10px 10px 24px; border-radius: 50px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 20px;
          }
          .softcard-profile-url { opacity: 0.6; font-size: 14px; font-weight: 500; }
          .softcard-copy-btn {
            background: #ff5cad; border: none; color: white; padding: 8px 20px;
            border-radius: 50px; font-size: 13px; font-weight: 700; cursor: pointer;
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
              <Pencil size={18} /> <span>Edit</span>
            </button>
            <button className="softcard-btn softcard-btn-right">
              <BarChart3 size={18} /> <span>Stats</span>
            </button>
          </div>
          <div className="softcard-profile-bar">
            <span className="softcard-profile-url">softcard.cc/{username}</span>
            <button className="softcard-copy-btn" onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
          </div>
        </div>
      </div>
    )
  }

  // 5. VIEW: EDITOR (OG Restored)
  return (
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, sans-serif` }}>
      <style>{`
        .scdb-dashboard { display: grid; grid-template-columns: 1fr 400px; min-height: 100vh; background: #050106; color: white; }
        .scdb-sidebar { padding: 40px; border-right: 1px solid #111; overflow-y: auto; }
        .scdb-back-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 8px 16px; border-radius: 50px; cursor: pointer; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px; }
        .scdb-tabs { display: flex; gap: 20px; border-bottom: 1px solid #111; margin-bottom: 30px; }
        .scdb-tab { padding: 10px 0; cursor: pointer; opacity: 0.5; border-bottom: 2px solid transparent; }
        .scdb-tab-active { opacity: 1; border-color: #ff5cad; color: #ff5cad; }
        .scdb-card { background: #0a0a0a; border: 1px solid #111; padding: 25px; border-radius: 15px; margin-bottom: 20px; }
        .scdb-label { display: block; font-size: 11px; text-transform: uppercase; color: #444; margin-bottom: 8px; font-weight: 800; }
        .scdb-input { width: 100%; background: #000; border: 1px solid #222; padding: 12px; border-radius: 8px; color: white; margin-bottom: 15px; outline: none; }
        .scdb-input:focus { border-color: #ff5cad; }
        .scdb-btn { background: #ff5cad; border: none; color: white; padding: 10px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; }
        
        .scdb-preview { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; }
        .scdb-bg { position: absolute; inset: 0; z-index: 1; }
        .scdb-video, .scdb-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
        .scdb-profile-card { position: relative; z-index: 10; width: 320px; padding: 30px; border-radius: 24px; text-align: center; }
        .scdb-profile-card.glass { background: rgba(0,0,0,0.4); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1); }
        .scdb-pfp { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin: 0 auto 20px; }
        .scdb-name { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .scdb-bio { font-size: 14px; opacity: 0.7; }
      `}</style>
      
      <div className="scdb-sidebar">
        <button className="scdb-back-btn" onClick={() => setView("hub")}><ArrowLeft size={14}/> Back to Hub</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Editor</h2>
          <button onClick={saveChanges} className="scdb-btn">{saving ? "..." : "Publish ♡"}</button>
        </div>

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
            <textarea className="scdb-input" style={{ height: 80 }} value={bio} onChange={e => setBio(e.target.value)} />
          </div>
        )}

        {tab === "appearance" && (
          <div className="scdb-card">
             <label className="scdb-label">Accent Color</label>
             <input type="color" className="scdb-input" style={{height: 50}} value={accent} onChange={e => setAccent(e.target.value)} />
             <label className="scdb-label">Background Type</label>
             <select className="scdb-input" value={bgType} onChange={e => setBgType(e.target.value)}>
                <option value="gradient">Gradient</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
             </select>
             <label className="scdb-label">Background Value (CSS or URL)</label>
             <input className="scdb-input" value={bgType === "gradient" ? gradient : (bgType === "video" ? bgVideo : bgImage)} 
               onChange={e => {
                 if(bgType === "gradient") setGradient(e.target.value)
                 else if(bgType === "video") setBgVideo(e.target.value)
                 else setBgImage(e.target.value)
               }} 
             />
          </div>
        )}
      </div>

      <div className="scdb-preview">
        {bgType === "gradient" && <div className="scdb-bg" style={{ background: gradient }} />}
        {bgType === "video" && <video className="scdb-video" src={bgVideo} autoPlay loop muted />}
        {bgType === "image" && <img className="scdb-image" src={bgImage} />}
        
        <div className={`scdb-profile-card ${showGlass ? 'glass' : ''}`}>
          <img src={avatar} className="scdb-pfp" style={{ border: `3px solid ${accent}`, boxShadow: `0 0 20px ${accent}44` }} />
          <h2 className="scdb-name">{name || `@${username}`}</h2>
          <p className="scdb-bio">{bio}</p>
        </div>
      </div>
    </div>
  )
}
