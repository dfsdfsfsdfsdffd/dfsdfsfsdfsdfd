"use client"
import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation' // Use this to kick them to setup

export default function SoftcardDashboard() {
  const router = useRouter()
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
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      
      if (profile) {
        // IF SETUP IS NOT COMPLETE, REDIRECT TO THE ACTUAL SETUP PAGE
        // DO NOT RENDER THE SETUP COMPONENT HERE
        if (!profile.setup_completed) {
          router.push('/setup') 
          return
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
  }, [supabase, router])

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

    if (error) alert("Error: " + error.message)
    else alert("Changes saved! ♡")
    setSaving(false)
  }

  if (loading) return <div style={{height: '100vh', background: '#020617'}} />

  return (
    <div className="scdb-dashboard">
      <style jsx>{`
        .scdb-dashboard { display:grid; grid-template-columns:420px 1fr; height:100vh; background:#020617; color:white; font-family:Inter, sans-serif; }
        .scdb-sidebar { padding:30px; background:#071321; border-right:1px solid rgba(255,255,255,.05); overflow:auto; display: flex; flex-direction: column; }
        .scdb-tabs { display:flex; gap:10px; margin-bottom:25px; }
        .scdb-tab { flex:1; padding:12px; border-radius:12px; background:#0c1b2e; text-align:center; cursor:pointer; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.4); }
        .scdb-tab-active { border:1px solid rgba(255,255,255,0.2); background: #162a45; color: white; }
        .scdb-card { background:#0c1b2e; padding:24px; border-radius:18px; margin-bottom:20px; border: 1px solid rgba(255,255,255,0.03); }
        .scdb-label { font-size:10px; opacity:.4; margin-top:15px; display:block; text-transform: uppercase; font-weight: 800; }
        .scdb-input { width:100%; padding:14px; border-radius:10px; background:#020617; border:1px solid rgba(255,255,255,0.05); color:white; margin-top:8px; outline: none; }
        .scdb-username-static { color: ${accent}; font-weight: 700; font-size: 14px; display: block; margin-top: 5px; }
        .scdb-save-btn { background: ${accent}; color: white; padding: 16px; border-radius: 12px; margin-top: auto; cursor: pointer; border: none; font-weight: 700; }
        .scdb-preview { position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .scdb-bg { position:absolute; width:100%; height:100%; z-index:0; }
        .scdb-profile { position:relative; z-index:2; text-align:center; padding: 40px; background: rgba(0,0,0,0.4); backdrop-filter: blur(15px); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); width: 340px; }
      `}</style>

      <div className="scdb-sidebar">
        <div className="scdb-tabs">
          <div className={`scdb-tab ${tab==="profile"?"scdb-tab-active":""}`} onClick={()=>setTab("profile")}>Profile</div>
          <div className={`scdb-tab ${tab==="themes"?"scdb-tab-active":""}`} onClick={()=>setTab("themes")}>Themes</div>
        </div>

        {tab==="profile" && (
          <div className="scdb-card">
            <label className="scdb-label">Your Live Link</label>
            <span className="scdb-username-static">softcard.cc/{username}</span>

            <label className="scdb-label">Display Name</label>
            <input className="scdb-input" value={name} onChange={e=>setName(e.target.value)}/>
            
            <label className="scdb-label">Bio</label>
            <input className="scdb-input" value={bio} placeholder="Bio..." onChange={e=>setBio(e.target.value)}/>
          </div>
        )}

        {tab==="themes" && (
          <div className="scdb-card">
            <label className="scdb-label">Background Source</label>
            <input className="scdb-input" value={bgValue} onChange={e=>setBgValue(e.target.value)}/>
            <label className="scdb-label">Accent</label>
            <input type="color" className="scdb-input" style={{height:'45px'}} value={accent} onChange={e=>setAccent(e.target.value)}/>
          </div>
        )}
        
        <button className="scdb-save-btn" onClick={saveChanges}>
          {saving ? "Updating..." : "Save Changes"}
        </button>
      </div>

      <div className="scdb-preview">
        <div className="scdb-bg" style={{background:bgValue}}/>
        <div className="scdb-profile">
          <img src={avatar} style={{width:'100px', borderRadius:'50%', border:`3px solid ${accent}`}} />
          <h1>{name || "Name"}</h1>
          <p>{bio || "Bio text here..."}</p>
        </div>
      </div>
    </div>
  )
}
