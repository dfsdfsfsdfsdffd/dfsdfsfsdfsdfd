"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Pencil, BarChart3, Loader2, LogOut } from "lucide-react"

// Social Icon Mapping for the Editor
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
  const router = useRouter();
  
  // 1. STATE MANAGEMENT
  const [view, setView] = useState<"hub" | "editor">("hub")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState("profile")

  // Profile Data States
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("") 
  const [bio, setBio] = useState("")
  const [links, setLinks] = useState<any[]>([])
  const [badges, setBadges] = useState<any>({ user: true, dev: false })
  const [devPassword, setDevPassword] = useState("")

  // Appearance States
  const [accent, setAccent] = useState("#3b82f6")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")
  const [showGlass, setShowGlass] = useState(true)

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  // 2. DATA LOADING
  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login');
        return;
      }

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
  }, [supabase, router])

  // 3. ACTIONS
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

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/login');
  }

  const addLink = () => setLinks([...links, { id: Date.now(), title: "New Link", url: "" }])
  const removeLink = (id: number) => setLinks(links.filter(l => l.id !== id))
  const updateLink = (i: number, key: string, val: string) => {
    const copy = [...links]; copy[i][key] = val; setLinks(copy);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <Loader2 className="animate-spin text-pink-500" size={40} />
    </div>
  )

  // 4. VIEW: UPDATED HUB
  if (view === "hub") {
    return (
      <div className="softcard-root">
        <style>{`
          .softcard-root {
            min-height: 100vh;
            width: 100%;
            background: radial-gradient(circle at center, #1a0b1a 0%, #050106 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
          }
          .softcard-container { text-align: center; width: 100%; max-width: 600px; padding: 20px; }
          .softcard-status { font-size: 10px; letter-spacing: 2px; opacity: 0.5; margin-bottom: 8px; }
          .softcard-title { font-size: 32px; font-weight: 600; margin-bottom: 50px; }
          .softcard-brand { color: #ff5cad; }
          
          .softcard-hub-wrapper { position: relative; display: inline-block; margin-bottom: 50px; }
          .softcard-hub {
            width: 320px; height: 320px;
            background: rgba(255, 92, 173, 0.05);
            border-radius: 50%;
            border: 1px solid rgba(255, 92, 173, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
          }
          .softcard-avatar {
            width: 120px; height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #ff5cad;
            box-shadow: 0 0 30px rgba(255, 92, 173, 0.3);
          }
          .softcard-avatar img { width: 100%; height: 100%; object-fit: cover; }
          
          .softcard-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: #ff5cad;
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(255, 92, 173, 0.3);
          }
          .softcard-btn:hover { transform: translateY(-50%) scale(1.05); background: #ff7bc0; }
          .softcard-btn-left { left: -60px; }
          .softcard-btn-right { right: -60px; }
          
          .softcard-profile-bar {
            display: inline-flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 8px 8px 8px 20px;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            gap: 15px;
          }
          .softcard-profile-url { opacity: 0.7; font-size: 14px; }
          .softcard-copy-btn {
            background: #ff5cad;
            border: none;
            color: white;
            padding: 6px 15px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }
          .hub-signout {
             position: absolute; top: 30px; right: 30px; opacity: 0.4; cursor: pointer; transition: 0.2s;
          }
          .hub-signout:hover { opacity: 1; color: #ff5cad; }
        `}</style>
        
        <div className="hub-signout" onClick={handleSignOut}>
            <LogOut size={18} />
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
              <Pencil size={16} />
              <span>Edit</span>
            </button>

            <button className="softcard-btn softcard-btn-right">
              <BarChart3 size={16} />
              <span>Stats</span>
            </button>
          </div>

          <div className="softcard-profile-bar">
            <span className="softcard-profile-url">softcard.cc/{username}</span>
            <button className="softcard-copy-btn" onClick={() => {
                navigator.clipboard.writeText(`softcard.cc/${username}`);
                alert("Link copied!");
            }}>Copy</button>
          </div>
        </div>
      </div>
    )
  }

  // 5. VIEW: THE EDITOR
  return (
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, system-ui` }}>
      <style>{`
        .scdb-links-row { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 18px; margin-top: 25px; }
        .scdb-icon-link img { width: 30px; height: 30px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4)); transition: all 0.2s ease; opacity: 0.9; }
        .scdb-icon-link:hover img { transform: translateY(-2px); opacity: 1; filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)); }
        .name-container { display: flex; align-items: baseline; justify-content: center; gap: 10px; margin-bottom: 5px; }
        .scdb-username { font-size: 14px; opacity: 0.5; font-weight: 400; }
        .scdb-badges { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
        .badge { 
          padding: 3px 10px; border-radius: 6px; background: rgba(255, 255, 255, 0.06); 
          backdrop-filter: blur(4px); font-size: 11px; font-weight: 800;
          color: rgba(255, 255, 255, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); 
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .scdb-profile-card {
          ${showGlass ? `
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            padding: 40px 30px;
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          ` : 'background: transparent; border: none; padding: 40px 30px;'}
          width: 100%; max-width: 420px; text-align: center; position: relative; z-index: 5; transition: all 0.3s ease;
        }
      `}</style>

      <div className="scdb-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="scdb-back" onClick={() => setView("hub")} style={{ cursor: 'pointer', color: '#ff5cad' }}>
               ← Back to Hub
            </div>
            <button onClick={saveChanges} className="scdb-btn" style={{margin: 0, padding: '5px 15px'}}>
                {saving ? "Saving..." : "Publish ♡"}
            </button>
        </div>

        <div className="scdb-tabs">
          <div className={`scdb-tab ${tab === "profile" ? "scdb-tab-active" : ""}`} onClick={() => setTab("profile")}>Profile</div>
          <div className={`scdb-tab ${tab === "appearance" ? "scdb-tab-active" : ""}`} onClick={() => setTab("appearance")}>Appearance</div>
          <div className={`scdb-tab ${tab === "badges" ? "scdb-tab-active" : ""}`} onClick={() => setTab("badges")}>Badges</div>
        </div>

        {tab === "profile" && (
          <div className="scdb-card">
            <label className="scdb-label">Avatar URL</label>
            <input className="scdb-input" value={avatar} onChange={e => setAvatar(e.target.value)} />
            <label className="scdb-label">Display Name</label>
            <input className="scdb-input" value={name} onChange={e => setName(e.target.value)} />
            <label className="scdb-label">Bio</label>
            <input className="scdb-input" value={bio} onChange={e => setBio(e.target.value)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <label className="scdb-label">Links</label>
                <button className="scdb-btn" onClick={addLink} style={{ margin: 0, padding: '4px 10px', fontSize: '12px' }}>+ Add</button>
            </div>
            
            {links.map((l, i) => (
              <div key={l.id} style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <input className="scdb-input" value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="URL (e.g. instagram.com/user)" />
                <button onClick={() => removeLink(l.id)} style={{ background: 'rgba(255,0,0,0.2)', border: 'none', color: 'white', borderRadius: '8px', padding: '0 10px', marginTop: '6px' }}>×</button>
              </div>
            ))}
          </div>
        )}

        {tab === "appearance" && (
          <div className="scdb-card">
            <label className="scdb-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px' }}>
               <input type="checkbox" checked={showGlass} onChange={e => setShowGlass(e.target.checked)} />
               Show Transparent Card
            </label>
            <label className="scdb-label">Background Type</label>
            <select className="scdb-input" value={bgType} onChange={e => setBgType(e.target.value)}>
              <option value="gradient">Gradient</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
            {bgType === "gradient" && <input className="scdb-input" value={gradient} onChange={e => setGradient(e.target.value)} />}
            {bgType === "video" && <input className="scdb-input" value={bgVideo} onChange={e => setBgVideo(e.target.value)} placeholder="Video URL" />}
            {bgType === "image" && <input className="scdb-input" value={bgImage} onChange={e => setBgImage(e.target.value)} placeholder="Image URL" />}
            <label className="scdb-label" style={{ marginTop: '20px' }}>Audio URL (.mp3)</label>
            <input className="scdb-input" value={bgAudio} onChange={e => setBgAudio(e.target.value)} />
            <label className="scdb-label" style={{ marginTop: '20px' }}>Accent Color</label>
            <input type="color" className="scdb-input" value={accent} onChange={e => setAccent(e.target.value)} />
          </div>
        )}

        {tab === "badges" && (
           <div className="scdb-card">
             <label style={{ display: "flex", gap: 10, alignItems: 'center' }}>
               <input type="checkbox" checked={badges.user} onChange={() => setBadges({ ...badges, user: !badges.user })} />
               User Badge
             </label>
             <div style={{ marginTop: 20 }}>Unlock Dev Badge</div>
             <input className="scdb-input" placeholder="Password" value={devPassword} onChange={e => setDevPassword(e.target.value)} />
             <button className="scdb-btn" onClick={() => {
                if(devPassword === "12345") { setBadges({...badges, dev: true}); alert("Unlocked!"); }
                else alert("Wrong pass");
             }}>Unlock</button>
           </div>
        )}
      </div>

      <div className="scdb-preview">
        {bgType === "gradient" && <div className="scdb-bg" style={{ background: gradient }} />}
        {bgType === "video" && bgVideo && <video className="scdb-video" src={bgVideo} autoPlay loop muted playsInline />}
        {bgType === "image" && bgImage && <img className="scdb-image" src={bgImage} />}
        {bgAudio && <audio src={bgAudio} autoPlay loop />}
        
        <div className="scdb-profile-card">
          <img src={avatar} className="scdb-pfp" style={{ boxShadow: `0 0 40px ${accent}` }} />
          <div className="name-container">
            <div className="scdb-username">@{username}</div>
            <div className="scdb-name">{name}</div>
          </div>
          <div className="scdb-bio">{bio}</div>
          <div className="scdb-badges">
            {badges.user && <div className="badge">User</div>}
            {badges.dev && <div className="badge dev" style={{ borderColor: accent, color: accent }}>Dev</div>}
          </div>
          <div className="scdb-links-row">
            {links.map(l => (
              l.url && (
                <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" className="scdb-icon-link">
                  <img src={getIcon(l.url)} alt="" />
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
