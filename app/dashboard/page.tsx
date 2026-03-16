"use client"
import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'
import UsernameSetup from "@/components/UsernameSetup"

export default function SoftcardDashboard(){
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const [tab,setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [setupRequired, setSetupRequired] = useState(false)

  // State linked to DB
  const [avatar,setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name,setName] = useState("akuryō")
  const [username,setUsername] = useState("akuryo")
  const [bio,setBio] = useState("")
  const [links,setLinks] = useState<any[]>([])
  const [accent,setAccent] = useState("#3b82f6")
  const [font,setFont] = useState("Inter")
  const [bgType,setBgType] = useState("gradient")
  const [bgValue,setBgValue] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgAudio,setBgAudio] = useState("")

  // 1. Load Data on Mount
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
        setBgValue(profile.background_value || "")
        setBgAudio(profile.audio_url || "")
        setFont(profile.font_family || "Inter")
        
        // Load links from separate table if you kept it, or JSON column
        const { data: userLinks } = await supabase.from('user_links').select('*').eq('user_id', user.id)
        if (userLinks) setLinks(userLinks)
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  // 2. Save Logic
  async function saveChanges() {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({
      display_name: name,
      avatar_url: avatar,
      bio: bio,
      accent_color: accent,
      background_type: bgType,
      background_value: bgValue,
      audio_url: bgAudio,
      font_family: font
    }).eq('id', user?.id)
    alert("Saved! ♡")
  }

  function addLink(){
    setLinks([...links,{ id:Date.now(), title:"Link Title", url:"" }])
    // Logic to insert into DB would go here
  }

  if (loading) return <div style={{color:'white', padding:'20px'}}>Loading...</div>
  if (setupRequired) return <UsernameSetup supabase={supabase} onComplete={() => setSetupRequired(false)} />

  return(
    <div className="scdb-dashboard">
      <style jsx>{`
        /* ... Your exact CSS here ... */
        .scdb-save-btn {
            background: #10b981; 
            color: white; 
            padding: 12px; 
            border-radius: 10px; 
            margin-top: 10px; 
            cursor: pointer; 
            border: none;
            width: 100%;
        }
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
              <input className="scdb-input" value={username} disabled />
              <label className="scdb-label">Bio</label>
              <input className="scdb-input" value={bio} onChange={e=>setBio(e.target.value)}/>
            </div>
            <button className="scdb-save-btn" onClick={saveChanges}>Save Profile</button>
          </>
        )}

        {tab==="appearance" && (
          <>
            <div className="scdb-card">
              <div>Background</div>
              <select className="scdb-input" value={bgType} onChange={e=>setBgType(e.target.value)}>
                <option value="gradient">Gradient</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
              <input className="scdb-input" placeholder="URL or CSS Gradient" value={bgValue} onChange={e=>setBgValue(e.target.value)}/>
            </div>
            <div className="scdb-card">
              <div>Accent Color</div>
              <input type="color" className="scdb-input" value={accent} onChange={e=>setAccent(e.target.value)}/>
            </div>
            <button className="scdb-save-btn" onClick={saveChanges}>Save Appearance</button>
          </>
        )}
      </div>

      <div className="scdb-preview">
        {bgType==="gradient" && <div className="scdb-bg" style={{background:bgValue}}/>}
        {bgType==="video" && bgValue && <video className="scdb-video" src={bgValue} autoPlay loop muted/>}
        {bgType==="image" && bgValue && <img className="scdb-image" src={bgValue}/>}
        
        <div className="scdb-profile">
          <img src={avatar} className="scdb-pfp"/>
          <div className="scdb-name" style={{color:'white'}}>{name}</div>
          <div className="scdb-bio" style={{opacity:0.7}}>{bio}</div>
          <div className="scdb-links">
            {links.map(l=>(
              <div key={l.id} className="scdb-link" style={{borderColor: accent, background: accent}}>
                {l.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
