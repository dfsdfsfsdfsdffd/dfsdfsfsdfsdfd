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

  // State linked to DB
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("akuryō")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [accent, setAccent] = useState("#3b82f6")
  const [bgType, setBgType] = useState("gradient")
  const [bgValue, setBgValue] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  
  // Single Link State
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      
      if (profile) {
        if (!profile.setup_completed) {
          setSetupRequired(true)
        }
        setAvatar(profile.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg")
        setName(profile.display_name || "")
        setUsername(profile.username || "")
        setBio(profile.bio || "")
        setAccent(profile.accent_color || "#3b82f6")
        setBgType(profile.background_type || "gradient")
        setBgValue(profile.background_value || "linear-gradient(135deg,#020617,#1e3a8a)")
        setLinkTitle(profile.link_title || "")
        setLinkUrl(profile.link_url || "")
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
      link_url: linkUrl
    }).eq('id', user?.id)

    if (error) alert("Error saving!")
    else alert("Saved! ♡")
    setSaving(false)
  }

  if (loading) return <div style={{color:'white', padding:'20px'}}>Loading Dashboard...</div>
  if (setupRequired) return <UsernameSetup supabase={supabase} onComplete={() => setSetupRequired(false)} />

  return (
    <div className="scdb-dashboard">
      <style jsx>{`
        .scdb-dashboard { display:grid; grid-template-columns:420px 1fr; height:100vh; background:#020617; color:white; font-family:Inter,system-ui; }
        .scdb-sidebar { padding:30px; background:#071321; border-right:1px solid rgba(255,255,255,.05); overflow:auto; }
        .scdb-back { opacity:.7; margin-bottom:20px; cursor:pointer; font-size: 14px; }
        .scdb-tabs { display:flex; gap:10px; margin-bottom:20px; }
        .scdb-tab { flex:1; padding:12px; border-radius:10px; background:#0c1b2e; text-align:center; cursor:pointer; transition: 0.2s; }
        .scdb-tab:hover { background: #162a45; }
        .scdb-tab-active { border:1px solid white; background: #162a45; }
        .scdb-card { background:#0c1b2e; padding:20px; border-radius:14px; margin-bottom:20px; border: 1px solid rgba(255,255,255,0.05); }
        .scdb-avatar { width:80px; height:80px; border-radius:50%; display:block; margin:0 auto 15px auto; object-fit:cover; border: 2px solid rgba(255,255,255,0.1); }
        .scdb-label { font-size:12px; opacity:.6; margin-top:10px; display:block; text-transform: uppercase; letter-spacing: 0.5px; }
        .scdb-input { width:100%; padding:12px; border-radius:8px; background:#020617; border:1px solid rgba(255,255,255,0.1); color:white; margin-top:6px; outline: none; }
        .scdb-input:focus { border-color: ${accent}; }
        .scdb-save-btn { background: #3b82f6; color: white; padding: 14px; border-radius: 10px; margin-top: 10px; cursor: pointer; border: none; width: 100%; font-weight: 600; }
        .scdb-preview { position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .scdb-bg { position:absolute; width:100%; height:100%; z-index:0; }
        .scdb-profile { position:relative; z-index:2; text-align:center; padding: 20px; }
        .scdb-pfp { width:110px; height:110px; border-radius:50%; object-fit:cover; box-shadow:0 0 40px ${accent}; border: 3px solid ${accent}; }
        .scdb-name { font-size:28px; margin-top:15px; font-weight: 700; }
        .scdb-bio { margin-top:6px; opacity: 0.7; font-size: 15px; max-width: 300px; }
        .scdb-links { margin-top:25px; width: 100%; min-width: 260px; }
        .scdb-link { padding:14px; border-radius:12px; border:1px solid ${accent}; background: rgba(0,0,0,0.3); backdrop-filter: blur(10px); color: white; text-align: center; font-weight: 500; }
      `}</style>

      <div className="scdb-sidebar">
        <div className="scdb-back">← Back to Dashboard</div>
        <div className="scdb-tabs">
          <div className={`scdb-tab ${tab==="profile"?"scdb-tab-active":""}`} onClick={()=>setTab("profile")}>Profile</div>
          <div className={`scdb-tab ${tab==="appearance"?"scdb-tab-active":""}`} onClick={()=>setTab("appearance")}>Appearance</div>
        </div>

        {tab==="profile" && (
          <>
            <div className="scdb-card">
              <img src={avatar} className="scdb-avatar"/>
              <label className="scdb-label">Avatar URL</label>
              <input className="scdb-input" value={avatar} onChange={e=>setAvatar(e.target.value)}/>
              
              <label className="scdb-label">Display Name</label>
              <input className="scdb-input" value={name} onChange={e=>setName(e.target.value)}/>
              
              <label className="scdb-label">Username (Locked)</label>
              <input className="scdb-input" value={username} disabled style={{opacity: 0.5, cursor: 'not-allowed'}} />
              
              <label className="scdb-label">Bio</label>
              <input className="scdb-input" value={bio} onChange={e=>setBio(e.target.value)}/>
            </div>

            <div className="scdb-card">
              <div style={{fontWeight: 600, marginBottom: '10px'}}>Your Single Link</div>
              <label className="scdb-label">Button Text</label>
              <input className="scdb-input" placeholder="e.g. My Portfolio" value={linkTitle} onChange={e=>setLinkTitle(e.target.value)}/>
              <label className="scdb-label">URL</label>
              <input className="scdb-input" placeholder="https://" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}/>
            </div>
            <button className="scdb-save-btn" onClick={saveChanges}>{saving ? "Saving..." : "Save Changes"}</button>
          </>
        )}

        {tab==="appearance" && (
          <>
            <div className="scdb-card">
              <div style={{fontWeight: 600, marginBottom: '10px'}}>Background</div>
              <select className="scdb-input" value={bgType} onChange={e=>setBgType(e.target.value)}>
                <option value="gradient">Gradient</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
              <label className="scdb-label">Background Value (URL or CSS)</label>
              <input className="scdb-input" placeholder="Value" value={bgValue} onChange={e=>setBgValue(e.target.value)}/>
            </div>
            <div className="scdb-card">
              <div style={{fontWeight: 600, marginBottom: '10px'}}>Accent Color</div>
              <input type="color" className="scdb-input" style={{height: '45px', padding: '2px'}} value={accent} onChange={e=>setAccent(e.target.value)}/>
            </div>
            <button className="scdb-save-btn" onClick={saveChanges}>{saving ? "Saving..." : "Save Changes"}</button>
          </>
        )}
      </div>

      <div className="scdb-preview">
        {bgType==="gradient" && <div className="scdb-bg" style={{background:bgValue}}/>}
        {bgType==="video" && bgValue && <video className="scdb-bg" style={{objectFit:'cover'}} src={bgValue} autoPlay loop muted/>}
        {bgType==="image" && bgValue && <img className="scdb-bg" style={{objectFit:'cover'}} src={bgValue}/>}
        
        <div className="scdb-profile">
          <img src={avatar} className="scdb-pfp"/>
          <div className="scdb-name">{name || "Your Name"}</div>
          <div className="scdb-bio">{bio || "Your bio description goes here"}</div>
          <div className="scdb-links">
            {linkUrl && (
              <div className="scdb-link">
                {linkTitle || "Visit Link"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
