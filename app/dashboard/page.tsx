"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

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
  const found = Object.keys(iconMap).find(key => lowerUrl.includes(key));
  return found ? iconMap[found] : "https://cdn.simpleicons.org/pwa/ffffff";
}

export default function SoftcardDashboard() {
  const router = useRouter();
  
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [tab, setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile State
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("") 
  const [bio, setBio] = useState("")
  const [links, setLinks] = useState<any[]>([])
  const [badges, setBadges] = useState<any>({ user: true, dev: false })
  const [devPassword, setDevPassword] = useState("")

  // Appearance State
  const [accent, setAccent] = useState("#3b82f6")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")
  const [showGlass, setShowGlass] = useState(true)

  useEffect(() => {
    async function loadData() {
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
        setAvatar(profile.avatar_url || "")
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
  }, [supabase, router]);

  async function saveChanges() {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const addLink = () => setLinks([...links, { id: Date.now(), title: "", url: "" }])
  const removeLink = (id: number) => setLinks(links.filter(l => l.id !== id))
  const updateLink = (i: number, val: string) => {
    const copy = [...links]
    copy[i].url = val
    setLinks(copy)
  }

  if (loading) return <div className="loading-screen" style={{ height: '100vh', background: '#020617' }} />

  return (
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, system-ui` }}>
      <style>{`
        .scdb-links-row { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 18px; margin-top: 25px; }
        .scdb-icon-link img { width: 30px; height: 30px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4)); transition: all 0.2s ease; opacity: 0.9; }
        .scdb-icon-link:hover img { transform: translateY(-2px); opacity: 1; filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)); }
        .name-container { display: flex; align-items: baseline; justify-content: center; gap: 10px; margin-bottom: 5px; }
        .scdb-username { font-size: 14px; opacity: 0.5; font-weight: 400; }
        .scdb-badges { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
        .badge { padding: 3px 10px; border-radius: 6px; background: rgba(255, 255, 255, 0.06); backdrop-filter: blur(4px); font-size: 11px; font-weight: 800; color: rgba(255, 255, 255, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); letter-spacing: 0.5px; text-transform: uppercase; }
        .scdb-profile-card { ${showGlass ? 'background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1);' : 'background: transparent; border: none;'} padding: 40px 30px; border-radius: 24px; width: 100%; max-width: 420px; text-align: center; position: relative; z-index: 5; transition: all 0.3s ease; }
      `}</style>

      <div className="scdb-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="scdb-back" onClick={saveChanges} style={{ cursor: 'pointer', fontWeight: 600 }}>
                {saving ? "Saving..." : "← Save & Publish"}
            </div>
            <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Sign Out</button>
        </div>

        <div className="scdb-tabs">
          {["profile", "appearance", "badges"].map(t => (
            <div key={t} className={`scdb-tab ${tab === t ? "scdb-tab-active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
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
                <label className="scdb-label">Social Links</label>
                <button className="scdb-btn" onClick={addLink} style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}>+ Add</button>
            </div>
            
            {links.map((l, i) => (
              <div key={l.id} style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <input className="scdb-input" value={l.url} onChange={e => updateLink(i, e.target.value)} placeholder="link (e.g. github.com/user)" />
                <button onClick={() => removeLink(l.id)} style={{ background: 'rgba(255,0,0,0.15)', border: 'none', color: '#ff4f4f', borderRadius: '8px', padding: '0 12px', marginTop: '6px', cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>
        )}

        {tab === "appearance" && (
          <div className="scdb-card">
            <label className="scdb-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px' }}>
               <input type="checkbox" checked={showGlass} onChange={e => setShowGlass(e.target.checked)} />
               Enable Glassmorphism Card
            </label>
            <label className="scdb-label">Background Type</label>
            <select className="scdb-input" value={bgType} onChange={e => setBgType(e.target.value)}>
              <option value="gradient">Gradient</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
            {bgType === "gradient" && <input className="scdb-input" value={gradient} onChange={e => setGradient(e.target.value)} />}
            {bgType === "video" && <input className="scdb-input" value={bgVideo} onChange={e => setBgVideo(e.target.value)} placeholder="Direct .mp4 link" />}
            {bgType === "image" && <input className="scdb-input" value={bgImage} onChange={e => setBgImage(e.target.value)} placeholder="Image URL" />}
            <label className="scdb-label" style={{ marginTop: '20px' }}>Audio URL (.mp3)</label>
            <input className="scdb-input" value={bgAudio} onChange={e => setBgAudio(e.target.value)} />
            <label className="scdb-label" style={{ marginTop: '20px' }}>Accent Color</label>
            <input type="color" className="scdb-input" style={{ height: '40px', padding: '2px' }} value={accent} onChange={e => setAccent(e.target.value)} />
          </div>
        )}

        {tab === "badges" && (
          <div className="scdb-card">
            <label style={{ display: "flex", gap: 10, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={badges.user} onChange={() => setBadges({ ...badges, user: !badges.user })} />
              User Badge
            </label>
            <div style={{ marginTop: 25, fontSize: '13px', opacity: 0.8 }}>Unlock Developer Badge</div>
            <input type="password" className="scdb-input" placeholder="Developer Password" value={devPassword} onChange={e => setDevPassword(e.target.value)} />
            <button className="scdb-btn" onClick={() => {
              if (devPassword === "12345") { setBadges({ ...badges, dev: true }); alert("Dev badge unlocked! ♡"); }
              else alert("Invalid password.");
            }}>Unlock</button>
          </div>
        )}
      </div>

      <div className="scdb-preview">
        {bgType === "gradient" && <div className="scdb-bg" style={{ background: gradient }} />}
        {bgType === "video" && bgVideo && <video className="scdb-video" src={bgVideo} autoPlay loop muted playsInline />}
        {bgType === "image" && bgImage && <img className="scdb-image" src={bgImage} alt="" />}
        {bgAudio && <audio src={bgAudio} autoPlay loop />}
        
        <div className="scdb-profile-card">
          <img src={avatar} className="scdb-pfp" style={{ boxShadow: `0 0 40px ${accent}` }} alt="pfp" />
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
            {links.map(l => {
              if (!l.url) return null;
              const icon = getIcon(l.url)
              return (
                <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" className="scdb-icon-link">
                  <img src={icon} alt="social" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
