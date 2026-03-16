"use client"
import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'

export default function SoftcardDashboard() {
  // 1. Safety Guard: Initialize client only if keys exist
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  const [tab, setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile States
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("akuryō")
  const [username, setUsername] = useState("") 
  const [bio, setBio] = useState("")
  const [links, setLinks] = useState<any[]>([])

  // Appearance States
  const [accent, setAccent] = useState("#3b82f6")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [bgValue, setBgValue] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgAudio, setBgAudio] = useState("")

  useEffect(() => {
    async function loadData() {
      // 2. CRITICAL: Stop if client isn't ready to prevent "reading auth" error
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch the specific record for the logged-in user
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setUsername(profile.username || ""); // This pulls /sex or /ddd
        setAvatar(profile.avatar_url || avatar)
        setName(profile.display_name || name)
        setBio(profile.bio || "")
        setLinks(profile.links || [])
        setAccent(profile.accent_color || "#3b82f6")
        setFont(profile.font_family || "Inter")
        setBgType(profile.background_type || "gradient")
        setBgValue(profile.background_value || bgValue)
        setBgAudio(profile.audio_url || "")
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
      font_family: font,
      background_type: bgType,
      background_value: bgValue,
      audio_url: bgAudio,
      setup_completed: true // Prevents looping back to claim screen
    }).eq('id', user.id)

    if (error) alert("Error saving: " + error.message)
    else alert("Published! ♡")
    setSaving(false)
  }

  // Render logic to handle the "Claim your URL" screen vs Dashboard
  if (!supabase) return <div style={{color: 'white'}}>Env keys missing. Check Vercel settings.</div>
  if (loading) return <div style={{ height: '100vh', background: '#020617' }} />

  // If no username is set in the DB, show the claim screen
  if (!username) {
    return (
      <div className="claim-screen" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020617', color: 'white'}}>
        <h1>Claim your URL</h1>
        <p>This cannot be changed later.</p>
        <div style={{marginTop: '20px'}}>
            <span>softcard.cc/</span>
            <input 
              style={{background: '#0c1b2e', border: '1px solid #2563eb', color: 'white', padding: '10px'}} 
              placeholder="username" 
              onChange={(e) => {/* add your username validation here */}}
            />
        </div>
        <button className="scdb-btn" style={{marginTop: '20px', padding: '10px 40px'}}>Claim Username →</button>
      </div>
    )
  }

  return (
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, system-ui` }}>
      <div className="scdb-sidebar">
        <div className="scdb-back" onClick={saveChanges}>
          {saving ? "Saving..." : "← Save & Publish"}
        </div>
        <div className="scdb-tabs">
          <div className={`scdb-tab ${tab === "profile" ? "scdb-tab-active" : ""}`} onClick={() => setTab("profile")}>Profile</div>
          <div className={`scdb-tab ${tab === "appearance" ? "scdb-tab-active" : ""}`} onClick={() => setTab("appearance")}>Appearance</div>
        </div>

        {tab === "profile" && (
          <div className="scdb-card">
            <label className="scdb-label">Display Name</label>
            <input className="scdb-input" value={name} onChange={e => setName(e.target.value)} />
            <label className="scdb-label">Username (Read Only)</label>
            <div style={{ padding: '12px', opacity: 0.5 }}>softcard.cc/{username}</div>
          </div>
        )}
        {/* ... Rest of your appearance inputs ... */}
      </div>

      <div className="scdb-preview">
        {bgType === "gradient" && <div className="scdb-bg" style={{ background: bgValue }} />}
        {bgType === "video" && <video className="scdb-video" src={bgValue} autoPlay loop muted playsInline /> }
        
        <div className="scdb-profile">
          <img src={avatar} className="scdb-pfp" style={{ boxShadow: `0 0 40px ${accent}` }} />
          <div className="scdb-name">{name}</div>
          <div className="scdb-bio">{bio}</div>
        </div>
      </div>
    </div>
  )
}
