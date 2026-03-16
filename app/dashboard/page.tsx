"use client"
import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'
import UsernameSetup from "@/components/UsernameSetup"

export default function SoftcardDashboard() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const [tab, setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [setupRequired, setSetupRequired] = useState(false)
  const [saving, setSaving] = useState(false)

  // DB Linked States
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("") // Read-only
  const [bio, setBio] = useState("")
  const [accent, setAccent] = useState("#3b82f6")
  const [bgType, setBgType] = useState("gradient")
  const [bgValue, setBgValue] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [discord, setDiscord] = useState("")
  const [spotify, setSpotify] = useState("")

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      
      if (profile) {
        // Hard check: If setup isn't done, kill the dashboard and show Setup
        if (!profile.setup_completed) {
          setSetupRequired(true)
        } else {
          setSetupRequired(false)
          setAvatar(profile.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg")
          setName(profile.display_name || "")
          setUsername(profile.username || "")
          setBio(profile.bio || "")
          setAccent(profile.accent_color || "#3b82f6")
          setBgType(profile.background_type || "gradient")
          setBgValue(profile.background_value || "linear-gradient(135deg,#020617,#1e3a8a)")
          setLinkTitle(profile.link_title || "")
          setLinkUrl(profile.link_url || "")
          setDiscord(profile.discord_user || "")
          setSpotify(profile.spotify_url || "")
        }
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  async function saveChanges() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      display_name: name,
      avatar_url: avatar,
      bio: bio,
      accent_color: accent,
      background_type: bgType,
      background_value: bgValue,
      link_title: linkTitle,
      link_url: linkUrl,
      discord_user: discord,
      spotify_url: spotify
    }).eq('id', user?.id)

    if (error) alert("Error saving!")
    else alert("Changes saved! ♡")
    setSaving(false)
  }

  if (loading) return <div style={{height: '100vh', background: '#020617'}} />

  // If they need setup, show ONLY the setup component. 
  // No dashboard code below this will execute.
  if (setupRequired) {
    return <UsernameSetup supabase={supabase} onComplete={() => window.location.reload()} />
  }

  return (
    <div className="scdb-dashboard">
      <style jsx>{`
        .scdb-dashboard { display:grid; grid-template-columns:420px 1fr; height:100vh; background:#020617; color:white; font-family:Inter, sans-serif; }
        .scdb-sidebar { padding:30px; background:#071321; border-right:1px solid rgba(255,255,255,.05); overflow:auto; display: flex; flex-direction: column; }
        .scdb-tabs { display:flex; gap:10px; margin-bottom:25px; }
        .scdb-tab { flex:1; padding:12px; border-radius:12px; background:#0c1b2e; text-align:center; cursor:pointer; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.4); }
        .scdb-tab-active { border:1px solid rgba(255,255,255,0.2); background: #162a45; color: white; }
        .scdb-card { background:#0c1b2e; padding:24px; border-radius:18px; margin-bottom:20px; border: 1px solid rgba(255,255,255,0.03); }
        .scdb-avatar { width:80px; height:80px; border-radius:50%; display:block; margin:0 auto 15px auto; object-fit:cover; }
        .scdb-label { font-size:10px; opacity:.4; margin-top:15px; display:block; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
        .scdb-input { width:100%; padding:14px; border-radius:10px; background:#020617; border:1px solid rgba(255,255,255,0.05); color:white; margin-top:8px; outline: none; font-size: 14px; }
        .scdb-url-box { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; margin-top: 8px; border: 1px dashed rgba(255,255,255,0.1); }
        .scdb-username-text { color: ${accent}; font-weight: 700; font-size: 14px; }
        .scdb-save-btn { background: ${accent}; color: white; padding: 16px; border-radius: 12px; margin-top: auto; cursor: pointer; border: none; font-weight: 700; }
        .scdb-preview { position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .scdb-bg { position:absolute; width:100%; height:100%; z-index:0; }
        .scdb-profile { position:relative; z-index:2; text-align:center; padding: 40px; background: rgba(0,0,0,0.4); backdrop-filter: blur(15px); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); width: 340px; }
        .scdb-pfp { width:110px; height:110px; border-radius:50%; object-fit:cover; box-shadow:0 0 40px ${accent}44; border: 3px solid ${accent}; }
        .scdb-link-btn { margin-top:25px; padding:14px; border-radius:12px; border:1px solid ${accent}; background: ${accent}11; color: white; font-weight: 600; }
      `}</style>

      <div className="scdb-sidebar">
        <div className="scdb-tabs">
          <div className={`scdb-tab ${tab==="profile"?"scdb-tab-active":""}`} onClick={()=>setTab("profile")}>Profile</div>
          <div className={`scdb-tab ${tab==="socials"?"scdb-tab-active":""}`} onClick={()=>setTab("socials")}>Socials</div>
          <div className={`scdb-tab ${tab==="appearance"?"scdb-tab-active":""}`} onClick={()=>setTab("appearance")}>Themes</div>
        </div>

        {tab==="profile" && (
          <div className="scdb-card">
            <img src={avatar} className="scdb-avatar" alt="avatar"/>
            
            <label className="scdb-label">Your Unique URL</label>
            <div className="scdb-url-box">
              <span className="scdb-username-text">softcard.cc/{username}</span>
            </div>

            <label className="scdb-label">Avatar URL</label>
            <input className="scdb-input" value={avatar} onChange={e=>setAvatar(e.target.value)}/>
            <label className="scdb-label">Display Name</label>
            <input className="scdb-input" value={name} onChange={e=>setName(e.target.value)}/>
            <label className="scdb-label">Bio</label>
            <input className="scdb-input" value={bio} placeholder="Write something..." onChange={e=>setBio(e.target.value)}/>
          </div>
        )}

        {tab==="socials" && (
          <div className="scdb-card">
            <label className="scdb-label">Discord</label>
            <input className="scdb-input" placeholder="user#0000" value={discord} onChange={e=>setDiscord(e.target.value)}/>
            <label className="scdb-label">Spotify URL</label>
            <input className="scdb-input" placeholder="Paste Spotify link..." value={spotify} onChange={e=>setSpotify(e.target.value)}/>
            <label className="scdb-label">Main Button Text</label>
            <input className="scdb-input" value={linkTitle} onChange={e=>setLinkTitle(e.target.value)}/>
            <label className="scdb-label">Main Button URL</label>
            <input className="scdb-input" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}/>
          </div>
        )}

        {tab==="appearance" && (
          <div className="scdb-card">
            <label className="scdb-label">Background Mode</label>
            <select className="scdb-input" value={bgType} onChange={e=>setBgType(e.target.value)}>
              <option value="gradient">Gradient</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
            <label className="scdb-label">Background Source</label>
            <input className="scdb-input" value={bgValue} onChange={e=>setBgValue(e.target.value)}/>
            <label className="scdb-label">Accent Color</label>
            <input type="color" className="scdb-input" style={{height: '45px', padding: '2px'}} value={accent} onChange={e=>setAccent(e.target.value)}/>
          </div>
        )}
        
        <button className="scdb-save-btn" onClick={saveChanges}>
          {saving ? "Publishing..." : "Save Changes"}
        </button>
      </div>

      <div className="scdb-preview">
        {bgType==="gradient" && <div className="scdb-bg" style={{background:bgValue}}/>}
        {bgType==="video" && bgValue && <video className="scdb-bg" style={{objectFit:'cover'}} src={bgValue} autoPlay loop muted/>}
        {bgType==="image" && bgValue && <img className="scdb-bg" style={{objectFit:'cover'}} src={bgValue}/>}
        
        <div className="scdb-profile">
          <img src={avatar} className="scdb-pfp" alt="preview"/>
          <div style={{fontSize: '28px', marginTop: '15px', fontWeight: '800'}}>{name || "Your Name"}</div>
          <div style={{opacity: 0.6, fontSize: '14px', marginTop: '5px'}}>{bio || "Your bio here"}</div>
          
          {linkUrl && (
            <div className="scdb-link-btn">
              {linkTitle || "Visit Link"}
            </div>
          )}

          {discord && (
            <div style={{marginTop: '15px', fontSize: '12px', opacity: 0.7}}>
              Discord: {discord}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
