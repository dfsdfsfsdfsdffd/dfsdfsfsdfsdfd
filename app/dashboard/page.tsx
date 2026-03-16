"use client"
import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'

export default function SoftcardDashboard() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const [tab, setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile States
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("") 
  const [bio, setBio] = useState("")
  const [accent, setAccent] = useState("#3b82f6")
  const [bgType, setBgType] = useState("gradient")
  const [bgValue, setBgValue] = useState("linear-gradient(135deg,#020617,#1e3a8a)")

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setAvatar(profile.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg")
        setName(profile.display_name || "")
        setUsername(profile.username || "user")
        setBio(profile.bio || "")
        setAccent(profile.accent_color || "#3b82f6")
        setBgType(profile.background_type || "gradient")
        setBgValue(profile.background_value || "linear-gradient(135deg,#020617,#1e3a8a)")
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
      background_value: bgValue
    }).eq('id', user?.id)

    if (error) alert("Error: " + error.message)
    else alert("Saved! ♡")
    setSaving(false)
  }

  if (loading) return <div style={{height: '100vh', background: '#020617'}} />

  return (
    <div className="scdb-dashboard">
      <style jsx>{`
        .scdb-dashboard { display:grid; grid-template-columns:420px 1fr; height:100vh; background:#020617; color:white; font-family:sans-serif; }
        .scdb-sidebar { padding:30px; background:#071321; border-right:1px solid rgba(255,255,255,.05); overflow:auto; display: flex; flex-direction: column; }
        .scdb-card { background:#0c1b2e; padding:24px; border-radius:18px; margin-bottom:20px; border: 1px solid rgba(255,255,255,0.03); }
        .scdb-label { font-size:10px; opacity:.4; margin-top:15px; display:block; text-transform: uppercase; font-weight: 800; }
        .scdb-input { width:100%; padding:14px; border-radius:10px; background:#020617; border:1px solid rgba(255,255,255,0.05); color:white; margin-top:8px; outline: none; }
        .scdb-save-btn { background: ${accent}; color: white; padding: 16px; border-radius: 12px; margin-top: auto; cursor: pointer; border: none; font-weight: 700; }
        .scdb-preview { position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .scdb-bg { position:absolute; width:100%; height:100%; z-index:0; }
        .scdb-profile { position:relative; z-index:2; text-align:center; padding: 40px; background: rgba(0,0,0,0.4); backdrop-filter: blur(15px); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); width: 340px; }
      `}</style>

      <div className="scdb-sidebar">
        <div className="scdb-card">
          <label className="scdb-label">Username (Locked)</label>
          <div style={{color: accent, fontWeight: 'bold', marginTop: '5px'}}>softcard.cc/{username}</div>

          <label className="scdb-label">Display Name</label>
          <input className="scdb-input" value={name} onChange={e=>setName(e.target.value)}/>
          
          <label className="scdb-label">Bio</label>
          <input className="scdb-input" value={bio} onChange={e=>setBio(e.target.value)}/>
        </div>
        
        <button className="scdb-save-btn" onClick={saveChanges}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="scdb-preview">
        <div className="scdb-bg" style={{background:bgValue}}/>
        <div className="scdb-profile">
          <img src={avatar} style={{width:'80px', borderRadius:'50%', border: `2px solid ${accent}`}} />
          <h1 style={{marginTop: '15px'}}>{name || "Your Name"}</h1>
          <p style={{opacity: 0.7}}>{bio || "Your bio here"}</p>
        </div>
      </div>
    </div>
  )
}
