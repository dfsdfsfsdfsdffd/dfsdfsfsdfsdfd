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
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      
      if (profile) {
        // Only show setup if they haven't finished it or don't have a username
        if (!profile.setup_completed || !profile.username) {
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
      link_url: linkUrl
    }).eq('id', user?.id)

    if (error) alert("Error saving!")
    else alert("Changes saved successfully! ♡")
    setSaving(false)
  }

  if (loading) return (
    <div style={{height: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
      <div className="loader">Loading Softcard...</div>
    </div>
  )

  // 1. Setup Gate (REPLACES the dashboard if setup isn't done)
  if (setupRequired) {
    return <UsernameSetup supabase={supabase} onComplete={() => window.location.reload()} />
  }

  // 2. Main Dashboard (Only shows if setup is finished)
  return (
    <div className="scdb-dashboard">
      <style jsx>{`
        .scdb-dashboard { display:grid; grid-template-columns:420px 1fr; height:100vh; background:#020617; color:white; font-family:'Inter', sans-serif; }
        .scdb-sidebar { padding:30px; background:#071321; border-right:1px solid rgba(255,255,255,.05); overflow:auto; display: flex; flex-direction: column; }
        .scdb-back { opacity:.5; margin-bottom:25px; cursor:pointer; font-size: 13px; font-weight: 500; transition: 0.2s; }
        .scdb-back:hover { opacity: 1; }
        .scdb-tabs { display:flex; gap:10px; margin-bottom:25px; }
        .scdb-tab { flex:1; padding:12px; border-radius:12px; background:#0c1b2e; text-align:center; cursor:pointer; transition: 0.2s; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.6); }
        .scdb-tab-active { border:1px solid rgba(255,255,255,0.2); background: #162a45; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .scdb-card { background:#0c1b2e; padding:24px; border-radius:18px; margin-bottom:20px; border: 1px solid rgba(255,255,255,0.03); }
        .scdb-avatar { width:90px; height:90px; border-radius:50%; display:block; margin:0 auto 15px auto; object-fit:cover; border: 3px solid rgba(255,255,255,0.05); }
        .scdb-label { font-size:11px; opacity:.4; margin-top:15px; display:block; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        .scdb-input { width:100%; padding:14px; border-radius:10px; background:#020617; border:1px solid rgba(255,255,255,0.05); color:white; margin-top:8px; outline: none; transition: 0.2s; font-size: 14px; }
        .scdb-input:focus { border-color: ${accent}; background: #040c1d; }
        .scdb-save-btn { background: ${accent}; color: white; padding: 16px; border-radius: 12px; margin-top: auto; cursor: pointer; border: none; width: 100%; font-weight: 700; font-size: 15px; transition: 0.3s; box-shadow: 0 10px 20px -5px ${accent}44; }
        .scdb-save-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .scdb-preview { position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .scdb-bg { position:absolute; width:100%; height:100%; z-index:0; transition: 0.5s ease; }
        .scdb-profile { position:relative; z-index:2; text-align:center; padding: 40px; background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); width: 320px; }
        .scdb-pfp { width:120px; height:120px; border-radius:50%; object-fit:cover; box-shadow:0 0 50px ${accent}66; border: 4px solid ${accent}; }
        .scdb-name { font-size:32px; margin-top:20px; font-weight: 800; letter-spacing: -0.5px; }
        .scdb-bio { margin-top:8px; opacity: 0.6; font-size: 15px; line-height: 1.5; }
        .scdb-links { margin-top:30px; display: flex; flex-direction: column; gap: 12px; }
        .scdb-link { padding:16px; border-radius:15px; border:1px solid ${accent}; background: ${accent}11; color: white; text-align: center; font-weight: 600; font-size: 14px; }
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
              <img src={avatar} className="scdb-avatar" alt="avatar"/>
              <label className="scdb-label">Avatar URL</label>
              <input className="scdb-input" value={avatar} onChange={e=>setAvatar(e.target.value)}/>
              
              <label className="scdb-label">Display Name</label>
              <input className="scdb-input" value={name} onChange={e=>setName(e.target.value)}/>
              
              <label className="scdb-label">Username (Locked)</label>
              <input className="scdb-input" value={username} disabled style={{opacity: 0.3, cursor: 'not-allowed'}} />
              
              <label className="scdb-label">Bio</label>
              <input className="scdb-input" value={bio} placeholder="Tell your story..." onChange={e=>setBio(e.target.value)}/>
            </div>

            <div className="scdb-card">
              <div style={{fontWeight: 700, fontSize: '14px', marginBottom: '4px'}}>Primary Link</div>
              <p style={{fontSize: '12px', opacity: 0.5, marginBottom: '15px'}}>The main button on your profile.</p>
              <label className="scdb-label">Button Text</label>
              <input className="scdb-input" placeholder="e.g. My Twitter" value={linkTitle} onChange={e=>setLinkTitle(e.target.value)}/>
              <label className="scdb-label">URL</label>
              <input className="scdb-input" placeholder="https://" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}/>
            </div>
          </>
        )}

        {tab==="appearance" && (
          <div className="scdb-card">
            <div style={{fontWeight: 700, fontSize: '14px', marginBottom: '15px'}}>Custom Theme</div>
            <label className="scdb-label">Background Mode</label>
            <select className="scdb-input" value={bgType} onChange={e=>setBgType(e.target.value)}>
              <option value="gradient">Gradient</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
            <label className="scdb-label">Background Source (URL/CSS)</label>
            <input className="scdb-input" placeholder="Value" value={bgValue} onChange={e=>setBgValue(e.target.value)}/>
            <label className="scdb-label">Accent Highlight</label>
            <input type="color" className="scdb-input" style={{height: '50px', padding: '4px', cursor: 'pointer'}} value={accent} onChange={e=>setAccent(e.target.value)}/>
          </div>
        )}
        
        <button className="scdb-save-btn" onClick={saveChanges}>
          {saving ? "Syncing..." : "Publish Changes"}
        </button>
      </div>

      <div className="scdb-preview">
        {bgType==="gradient" && <div className="scdb-bg" style={{background:bgValue}}/>}
        {bgType==="video" && bgValue && <video className="scdb-bg" style={{objectFit:'cover'}} src={bgValue} autoPlay loop muted/>}
        {bgType==="image" && bgValue && <img className="scdb-bg" style={{objectFit:'cover'}} src={bgValue}/>}
        
        <div className="scdb-profile">
          <img src={avatar} className="scdb-pfp" alt="preview-pfp"/>
          <div className="scdb-name">{name || "Your Name"}</div>
          <div className="scdb-bio">{bio || "Add a bio to show it here"}</div>
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
