"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"

// Social Icon Mapping
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
  // Fallback to a clean World icon for random sites
  return "https://cdn.simpleicons.org/pwa/ffffff"
}

export default function SoftcardDashboard() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  const [tab, setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("akuryō")
  const [bio, setBio] = useState("")
  const [links, setLinks] = useState<any[]>([])
  const [badges, setBadges] = useState<any>({ user: true, dev: false })
  const [devPassword, setDevPassword] = useState("")

  const [accent, setAccent] = useState("#3b82f6")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")
  const [showGlass, setShowGlass] = useState(true) // New Toggle State

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setAvatar(profile.avatar_url || avatar)
        setName(profile.display_name || name)
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

  const addLink = () => setLinks([...links, { id: Date.now(), title: "New Link", url: "" }])

  const updateLink = (i: number, key: string, val: string) => {
    const copy = [...links]
    copy[i][key] = val
    setLinks(copy)
  }

  const unlockDev = () => {
    if (devPassword === "12345") {
      setBadges({ ...badges, dev: true })
      alert("Dev badge unlocked")
    } else {
      alert("Wrong password")
    }
  }

  if (loading) return <div style={{ height: '100vh', background: '#020617' }} />

  return (
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, system-ui` }}>
      <style>{`
        /* Side-by-side Icons */
        .scdb-links-row { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 18px; margin-top: 25px; }
        .scdb-icon-link img { width: 30px; height: 30px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4)); transition: all 0.2s ease; opacity: 0.9; }
        .scdb-icon-link:hover img { transform: translateY(-2px); opacity: 1; filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)); }

        /* Clean Flush Badges */
        .scdb-badges { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
        .badge { 
          padding: 3px 10px; 
          border-radius: 6px; 
          background: rgba(255, 255, 255, 0.06); 
          backdrop-filter: blur(4px);
          font-size: 11px; 
          font-weight: 500;
          color: rgba(255, 255, 255, 0.85); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .badge.dev { border-color: rgba(255, 255, 255, 0.2); }

        /* Preview Glass Card */
        .scdb-profile-card {
          ${showGlass ? `
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            padding: 40px 30px;
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          ` : ''}
          width: 100%;
          max-width: 420px;
          text-align: center;
          position: relative;
          z-index: 5;
          transition: all 0.3s ease;
        }
      `}</style>

      <div className="scdb-sidebar">
        <div className="scdb-back" onClick={saveChanges} style={{ cursor: 'pointer' }}>
          {saving ? "Saving..." : "← Save & Publish"}
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
            <button className="scdb-btn" onClick={addLink} style={{marginTop: '15px'}}>+ Add Link</button>
            {links.map((l, i) => (
              <div key={l.id} style={{ marginTop: '10px' }}>
                <input className="scdb-input" value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="URL (e.g. google.com)" />
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
            <button className="scdb-btn" onClick={unlockDev}>Unlock</button>
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
          <div className="scdb-name">{name}</div>
          <div className="scdb-bio">{bio}</div>
          
          <div className="scdb-badges">
            {badges.user && <div className="badge">User</div>}
            {badges.dev && <div className="badge dev" style={{ boxShadow: `0 0 10px ${accent}44` }}>Dev</div>}
          </div>

          <div className="scdb-links-row">
            {links.map(l => {
              if (!l.url) return null;
              const icon = getIcon(l.url)
              return (
                <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" className="scdb-icon-link">
                  <img src={icon} alt="" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
