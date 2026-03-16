"use client"
import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'

export default function SoftcardDashboard() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null; // Returns null if env vars are missing
    return createBrowserClient(url, key);
  }, []);

  const [tab, setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile States
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("akuryō")
  const [username, setUsername] = useState("akuryo")
  const [bio, setBio] = useState("")
  const [links, setLinks] = useState<any[]>([])

  // Appearance States
  const [accent, setAccent] = useState("#3b82f6")
  const [nameColor, setNameColor] = useState("#ffffff")
  const [bioColor, setBioColor] = useState("#9ca3af")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")

  useEffect(() => {
    async function loadData() {
      // FIX FOR CRASH: Hard exit if supabase is null
      if (!supabase) {
        console.error("Supabase client failed to initialize. Check ENV variables.");
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setAvatar(profile.avatar_url || avatar)
        setName(profile.display_name || name)
        setUsername(profile.username || username)
        setBio(profile.bio || "")
        setLinks(profile.links || [])
        setAccent(profile.accent_color || "#3b82f6")
        setFont(profile.font_family || "Inter")
        setBgType(profile.background_type || "gradient")
        
        const bgVal = profile.background_value || "";
        if (profile.background_type === "gradient") setGradient(bgVal || gradient);
        else if (profile.background_type === "video") setBgVideo(bgVal);
        else if (profile.background_type === "image") setBgImage(bgVal);
        
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
    if (!user) {
      alert("Session expired.");
      setSaving(false);
      return;
    }

    // Includes 'links' column to resolve schema cache error
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
      setup_completed: true 
    }).eq('id', user.id)

    if (error) alert("Error saving: " + error.message)
    else alert("Published! ♡")
    setSaving(false)
  }

  function addLink() {
    setLinks([...links, { id: Date.now(), title: "Link Title", url: "" }])
  }

  function updateLink(i: number, key: string, val: string) {
    const copy = [...links]
    copy[i][key] = val
    setLinks(copy)
  }

  // Prevents the UI from rendering if Supabase isn't ready
  if (!supabase) return <div style={{color: 'white', padding: '20px'}}>Configuration Error: Check ENV keys.</div>
  if (loading) return <div style={{ height: '100vh', background: '#020617' }} />

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
          <>
            <div className="scdb-card">
              <img src={avatar} className="scdb-avatar" />
              <label className="scdb-label">Avatar URL</label>
              <input className="scdb-input" value={avatar} onChange={e => setAvatar(e.target.value)} />
              <label className="scdb-label">Display Name</label>
              <input className="scdb-input" value={name} onChange={e => setName(e.target.value)} />
              <label className="scdb-label">Username (Read Only)</label>
              <div style={{ padding: '12px', opacity: 0.5 }}>softcard.cc/{username}</div>
              <label className="scdb-label">Bio</label>
              <input className="scdb-input" value={bio} onChange={e => setBio(e.target.value)} />
            </div>

            <div className="scdb-card">
              <div style={{ marginBottom: '10px' }}>Links</div>
              <button className="scdb-btn" onClick={addLink}>+ Add New Link</button>
              {links.map((l, i) => (
                <div key={l.id} style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <input className="scdb-input" value={l.title} onChange={e => updateLink(i, "title", e.target.value)} />
                  <input className="scdb-input" value={l.url} placeholder="https://" onChange={e => updateLink(i, "url", e.target.value)} />
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "appearance" && (
          <>
            <div className="scdb-card">
              <div>Background</div>
              <select className="scdb-input" value={bgType} onChange={e => setBgType(e.target.value)}>
                <option value="gradient">Gradient</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
              {bgType === "gradient" && <input className="scdb-input" value={gradient} onChange={e => setGradient(e.target.value)} />}
              {bgType === "video" && <input className="scdb-input" placeholder="video url" value={bgVideo} onChange={e => setBgVideo(e.target.value)} />}
              {bgType === "image" && <input className="scdb-input" placeholder="image url" value={bgImage} onChange={e => setBgImage(e.target.value)} />}
            </div>

            <div className="scdb-card">
              <div>Colors & Font</div>
              <label className="scdb-label">Accent Color</label>
              <input type="color" className="scdb-input" style={{ height: '40px' }} value={accent} onChange={e => setAccent(e.target.value)} />
              <label className="scdb-label">Font Family</label>
              <select className="scdb-input" value={font} onChange={e => setFont(e.target.value)}>
                <option>Inter</option>
                <option>Poppins</option>
                <option>DM Sans</option>
              </select>
            </div>

            <div className="scdb-card">
              <div>Audio (Autoplay)</div>
              <input className="scdb-input" placeholder="Direct audio link (.mp3)" value={bgAudio} onChange={e => setBgAudio(e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="scdb-preview">
        {bgType === "gradient" && <div className="scdb-bg" style={{ background: gradient }} />}
        {bgType === "video" && bgVideo && <video className="scdb-video" src={bgVideo} autoPlay loop muted playsInline /> }
        {bgType === "image" && bgImage && <img className="scdb-image" src={bgImage} />}
        {bgAudio && <audio src={bgAudio} autoPlay loop />}

        <div className="scdb-profile">
          <img src={avatar} className="scdb-pfp" style={{ boxShadow: `0 0 40px ${accent}` }} />
          <div className="scdb-name" style={{ color: nameColor }}>{name}</div>
          <div className="scdb-bio" style={{ color: bioColor }}>{bio}</div>
          <div className="scdb-links">
            {links.map(l => (
              <div key={l.id} className="scdb-link" style={{ background: accent, borderColor: accent }}>
                {l.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
