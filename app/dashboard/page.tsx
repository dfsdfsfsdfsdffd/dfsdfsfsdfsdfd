"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { 
  Pencil, 
  BarChart3, 
  LogOut, 
  ShieldCheck, 
  Code, 
  Star, 
  Trash2, 
  Globe, 
  Tag as TagIcon, 
  Plus, 
  X,
  ExternalLink,
  Copy,
  Check
} from "lucide-react"

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
  linkedin: "https://cdn.simpleicons.org/linkedin/ffffff",
  website: "https://cdn.simpleicons.org/pwa/ffffff"
}

function getIcon(linkObj: any) {
  if (linkObj.type && iconMap[linkObj.type]) {
    return iconMap[linkObj.type]
  }
  return iconMap.website
}

export default function SoftcardDashboard() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  const [view, setView] = useState<"hub" | "editor">("hub")
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile States
  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("User")
  const [username, setUsername] = useState("") 
  const [bio, setBio] = useState("")
  
  // Tag States
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [sexuality, setSexuality] = useState("")
  const [birthday, setBirthday] = useState("")
  const [timezone, setTimezone] = useState("")

  const [links, setLinks] = useState<any[]>([])
  const [badges, setBadges] = useState<any>({ user: true, dev: false, staff: false })
  const [devPassword, setDevPassword] = useState("")

  // Appearance States
  const [accent, setAccent] = useState("#7000ff")
  const [nameColor, setNameColor] = useState("#ffffff")
  const [bioColor, setBioColor] = useState("rgba(255,255,255,0.7)")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg, #1a0b1a 0%, #050106 100%)")
  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")
  const [showGlass, setShowGlass] = useState(true)

  const timezones = useMemo(() => Intl.supportedValuesOf('timeZone'), []);

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
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
        setUsername(profile.username || "") 
        setBio(profile.bio || "")
        setAge(profile.age || "")
        setGender(profile.gender || "")
        setSexuality(profile.sexuality || "")
        setBirthday(profile.birthday || "")
        setTimezone(profile.timezone || "")
        setLinks(profile.links || [])
        setAccent(profile.accent_color || "#7000ff")
        setNameColor(profile.name_color || "#ffffff")
        setBioColor(profile.bio_color || "rgba(255,255,255,0.7)")
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
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No user found");

        const { error } = await supabase.from('profiles').update({
          display_name: name,
          avatar_url: avatar,
          bio: bio,
          age: age,
          gender: gender,
          sexuality: sexuality,
          birthday: birthday,
          timezone: timezone,
          links: links,
          accent_color: accent,
          name_color: nameColor,
          bio_color: bioColor,
          font_family: font,
          background_type: bgType,
          background_value: bgType === "gradient" ? gradient : (bgType === "video" ? bgVideo : bgImage),
          audio_url: bgAudio,
          badges: badges,
          show_glass_card: showGlass,
          setup_completed: true
        }).eq('id', user.id)

        if (error) throw error;
        alert("Published successfully! ♡")
    } catch (err: any) {
        alert("Error: " + err.message)
    } finally {
        setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!username) return;
    navigator.clipboard.writeText(`softcard.cc/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addLink = () => setLinks([...links, { id: Date.now(), type: "website", url: "" }])
  const removeLink = (id: number) => setLinks(links.filter(l => l.id !== id))
  const updateLink = (i: number, key: string, val: string) => {
    const copy = [...links]
    copy[i][key] = val
    setLinks(copy)
  }

  const unlockDev = () => {
    if (devPassword === "12345") {
      setBadges({ ...badges, dev: true })
      alert("Dev badge unlocked!")
      setDevPassword("")
    } else {
      alert("Incorrect password.")
    }
  }

  if (loading) return <div style={{ height: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-pulse text-pink-500 font-bold">LOADING...</div>
  </div>

  if (view === "hub") {
    return (
      <div className="hx-root">
        <style>{`
          .hx-root {
            min-height: 100vh; width: 100%;
            background: radial-gradient(circle at center, #1a0b1a 0%, #050106 100%);
            color: white; display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif;
          }
          .hx-container { text-align: center; width: 100%; max-width: 600px; padding: 20px; }
          .hub-header { margin-bottom: 40px; }
          .hx-status { font-size: 10px; letter-spacing: 2px; opacity: 0.5; margin-bottom: 8px; font-weight: 700; }
          .hx-title { font-size: 32px; font-weight: 600; }
          .hx-username { color: #f472b6; }
          
          .hx-circle-wrap { position: relative; display: inline-block; margin-bottom: 50px; width: 280px; height: 280px; }
          .hx-circle {
            width: 100%; height: 100%;
            background: rgba(190, 24, 93, 0.05);
            border-radius: 50%;
            border: 1px solid rgba(244, 114, 182, 0.15);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px);
          }
          .hx-avatar {
            width: 140px; height: 140px; border-radius: 50%; overflow: hidden;
            border: 3px solid #f472b6; box-shadow: 0 0 40px rgba(244, 114, 182, 0.2);
          }
          .hx-avatar img { width: 100%; height: 100%; object-fit: cover; }
          
          .hx-btn {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: #ec4899; border: none; color: white;
            padding: 12px 24px; border-radius: 50px;
            display: flex; align-items: center; gap: 10px;
            font-weight: 700; font-size: 14px; cursor: pointer;
            transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          }
          .hx-btn:hover { transform: translateY(-50%) scale(1.05); background: #f472b6; }
          .hx-left { left: -80px; }
          .hx-right { right: -80px; }
          
          .hx-url {
            display: inline-flex; align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 8px 8px 8px 20px; border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1); gap: 15px;
          }
          .hx-small-btn {
            background: #ec4899; border: none; color: white;
            padding: 8px 18px; border-radius: 50px;
            font-size: 13px; font-weight: 700; cursor: pointer;
            display: flex; align-items: center; gap: 6px; transition: 0.2s;
          }
          .hx-small-btn:hover { opacity: 0.9; }
          .hx-view { background: rgba(255,255,255,0.1); text-decoration: none; }

          .hx-logout { position: fixed; top: 30px; right: 30px; opacity: 0.4; cursor: pointer; transition: 0.2s; }
          .hx-logout:hover { opacity: 1; color: #f472b6; }
        `}</style>

        <div className="hx-logout" onClick={() => supabase?.auth.signOut()}>
          <LogOut size={20} />
        </div>

        <div className="hx-container">
          <div className="hub-header">
            <p className="hx-status">DASHBOARD</p>
            <h1 className="hx-title">Welcome back, <span className="hx-username">{username || "User"}</span></h1>
          </div>

          <div className="hx-circle-wrap">
            <div className="hx-circle">
              <div className="hx-avatar">
                <img src={avatar} alt="avatar" />
              </div>
            </div>

            <button className="hx-btn hx-left" onClick={() => setView("editor")}>
              <Pencil size={18} />
              <span>Edit Page</span>
            </button>

            <button className="hx-btn hx-right">
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>
          </div>

          <div>
            <div className="hx-url">
              <span style={{ opacity: 0.6, fontSize: '14px' }}>softcard.cc/{username || "..."}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="hx-small-btn" onClick={handleCopy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <a href={`/${username}`} target="_blank" rel="noreferrer" className="hx-small-btn hx-view">
                  <ExternalLink size={14} />
                  View
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="softcardx-dashboard" style={{ fontFamily: `${font}, system-ui` }}>
      <style>{`
        .softcardx-dashboard { display: flex; height: 100vh; background: #050106; color: white; overflow: hidden; }
        .sx-sidebar { width: 400px; background: rgba(10, 0, 15, 0.7); backdrop-filter: blur(30px); border-right: 1px solid rgba(255, 0, 128, 0.15); padding: 25px; overflow-y: auto; }
        .sx-preview-pane { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #020002; }
        
        .sx-profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 90%; max-width: 420px;
          padding: 40px 25px; border-radius: 28px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: ${showGlass ? 'rgba(0, 0, 0, 0.45)' : 'transparent'};
          backdrop-filter: ${showGlass ? 'blur(25px)' : 'none'};
          border: ${showGlass ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          box-shadow: ${showGlass ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : 'none'};
        }
        
        .sx-pfp { 
          width: 110px; height: 110px; border-radius: 50%; object-fit: cover; margin-bottom: 20px;
          border: 2px solid ${accent}; padding: 3px;
        }
        
        .sx-name { font-size: 30px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; }
        
        .sx-badge-pill { 
          display: flex; gap: 8px; background: rgba(255, 255, 255, 0.08); 
          padding: 5px 12px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); 
          align-items: center; margin-bottom: 15px;
        }
        
        .sx-tags-row { 
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px; 
          margin-bottom: 20px; width: 100%;
        }
        .sx-tag-pill {
          background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 8px;
          font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sx-bio { font-size: 15px; margin-bottom: 25px; line-height: 1.5; max-width: 90%; }
        
        .sx-links-row { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .sx-icon-link { transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.7; }
        .sx-icon-link:hover { opacity: 1; transform: translateY(-4px) scale(1.1); }
        .sx-icon-link img { width: 28px; height: 28px; }

        .sx-editor-link { cursor: pointer; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px; opacity: 0.5; font-size: 13px; font-weight: 600; }
        .sx-editor-link:hover { opacity: 1; color: #ec4899; }
        
        .sx-publish-btn {
            width: 100%; padding: 14px; border-radius: 14px; border: none; font-weight: 700;
            background: linear-gradient(90deg, #ff008c, #ff4df0); color: white; cursor: pointer;
            box-shadow: 0 8px 20px rgba(255, 0, 128, 0.25); margin-bottom: 25px; transition: 0.2s;
        }
        .sx-publish-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .sx-publish-btn:active { transform: translateY(0); }

        .sx-tabs-row { display: flex; gap: 4px; margin-bottom: 25px; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 12px; }
        .sx-tab { flex: 1; padding: 10px 5px; border-radius: 9px; cursor: pointer; opacity: 0.5; text-align: center; transition: 0.2s; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .sx-tab-active { background: #ec4899; opacity: 1; color: white; }
        
        .sx-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.4; margin-bottom: 8px; display: block; font-weight: 800; }
        .sx-input {
            width: 100%; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08); color: white; outline: none; transition: 0.2s; font-size: 14px;
        }
        .sx-input:focus { border-color: #ff2a8a; background: rgba(255,255,255,0.06); }
        
        .sx-bg-layer { position: absolute; inset: 0; z-index: 1; object-fit: cover; width: 100%; height: 100%; }

        .sx-link-card {
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px; padding: 15px; margin-bottom: 12px; position: relative;
        }
        .sx-remove-link {
            position: absolute; top: -10px; right: -10px;
            background: #ef4444; color: white; border: none;
            width: 24px; height: 24px; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .tag-input-wrapper { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .sx-tag-clear { 
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 10px; padding: 10px; cursor: pointer; color: #ff4d4d; transition: 0.2s;
        }
        .sx-tag-clear:hover { background: rgba(255, 77, 77, 0.2); border-color: #ff4d4d; }
      `}</style>

      <div className="sx-sidebar">
        <div className="sx-editor-link" onClick={() => setView("hub")}>
          <X size={16} /> Close Editor
        </div>
        
        <button className="sx-publish-btn" onClick={saveChanges}>
          {saving ? "Saving Changes..." : "Save & Publish Page"}
        </button>

        <div className="sx-tabs-row">
          <div className={`sx-tab ${tab === "profile" ? "sx-tab-active" : ""}`} onClick={() => setTab("profile")}>Profile</div>
          <div className={`sx-tab ${tab === "tags" ? "sx-tab-active" : ""}`} onClick={() => setTab("tags")}>Tags</div>
          <div className={`sx-tab ${tab === "appearance" ? "sx-tab-active" : ""}`} onClick={() => setTab("appearance")}>Style</div>
          <div className={`sx-tab ${tab === "badges" ? "sx-tab-active" : ""}`} onClick={() => setTab("badges")}>Badges</div>
        </div>

        {tab === "profile" && (
          <div className="sx-pane animate-in fade-in duration-300">
            <div className="sx-input-group"><label className="sx-label">Avatar Image URL</label><input className="sx-input" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." /></div>
            <div className="sx-input-group"><label className="sx-label">Display Name</label><input className="sx-input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Short Bio</label><textarea className="sx-input" rows={3} style={{resize: 'none'}} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the world about yourself..." /></div>
            
            <div style={{marginTop: '25px'}}>
                <label className="sx-label">Social Links</label>
                {links.map((l, i) => (
                <div key={l.id} className="sx-link-card">
                    <button className="sx-remove-link" onClick={() => removeLink(l.id)}><X size={14}/></button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select className="sx-input" value={l.type} onChange={e => updateLink(i, "type", e.target.value)}>
                        {Object.keys(iconMap).map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
                    </select>
                    <input className="sx-input" value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="https://..." />
                    </div>
                </div>
                ))}
                <button className="sx-publish-btn" onClick={addLink} style={{background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px dashed rgba(255,255,255,0.2)', marginTop: '10px'}}>
                    <Plus size={18} /> Add New Link
                </button>
            </div>
          </div>
        )}

        {tab === "tags" && (
          <div className="sx-pane animate-in fade-in duration-300">
            <div className="sx-input-group">
              <label className="sx-label">Age</label>
              <div className="tag-input-wrapper">
                <input type="number" className="sx-input" placeholder="Age" value={age} onChange={e => setAge(e.target.value.slice(0, 2))} />
                <button className="sx-tag-clear" onClick={() => setAge("")}><X size={16} /></button>
              </div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Gender</label>
              <div className="tag-input-wrapper">
                <select className="sx-input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
                <button className="sx-tag-clear" onClick={() => setGender("")}><X size={16} /></button>
              </div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Sexuality</label>
              <div className="tag-input-wrapper">
                <select className="sx-input" value={sexuality} onChange={e => setSexuality(e.target.value)}>
                  <option value="">Select Sexuality</option>
                  <option value="Straight">Straight</option>
                  <option value="Gay">Gay</option>
                  <option value="Lesbian">Lesbian</option>
                  <option value="Bisexual">Bisexual</option>
                  <option value="Pansexual">Pansexual</option>
                  <option value="Asexual">Asexual</option>
                  <option value="Queer">Queer</option>
                </select>
                <button className="sx-tag-clear" onClick={() => setSexuality("")}><X size={16} /></button>
              </div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Birthday</label>
              <div className="tag-input-wrapper">
                <input type="date" className="sx-input" value={birthday} onChange={e => setBirthday(e.target.value)} />
                <button className="sx-tag-clear" onClick={() => setBirthday("")}><X size={16} /></button>
              </div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Timezone</label>
              <div className="tag-input-wrapper">
                <select className="sx-input" value={timezone} onChange={e => setTimezone(e.target.value)}>
                  <option value="">Select Timezone</option>
                  {timezones.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
                </select>
                <button className="sx-tag-clear" onClick={() => setTimezone("")}><X size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {tab === "appearance" && (
          <div className="sx-pane animate-in fade-in duration-300">
            <div className="sx-input-group" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px'}}>
                <input type="checkbox" id="glass" checked={showGlass} onChange={e => setShowGlass(e.target.checked)} style={{width: '18px', height: '18px'}} />
                <label htmlFor="glass" style={{margin: 0, fontSize: '13px', cursor: 'pointer'}}>Transparent Glass Card</label>
            </div>

            <div className="sx-input-group" style={{marginTop: '20px'}}>
                <label className="sx-label">Background Type</label>
                <select className="sx-input" value={bgType} onChange={e => setBgType(e.target.value)}>
                  <option value="gradient">Gradient</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
            </div>

            {bgType === "gradient" && (
              <div className="sx-input-group">
                <label className="sx-label">CSS Gradient String</label>
                <input className="sx-input" value={gradient} onChange={e => setGradient(e.target.value)} placeholder="linear-gradient(...)" />
              </div>
            )}
            {(bgType === "video" || bgType === "image") && (
              <div className="sx-input-group">
                <label className="sx-label">{bgType === "video" ? "Video (.mp4) URL" : "Image URL"}</label>
                <input className="sx-input" value={bgType === "video" ? bgVideo : bgImage} onChange={e => bgType === "video" ? setBgVideo(e.target.value) : setBgImage(e.target.value)} placeholder="Direct link..." />
              </div>
            )}

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div className="sx-input-group"><label className="sx-label">Name Color</label><input type="color" className="sx-input" style={{height: '45px', padding: '5px'}} value={nameColor} onChange={e => setNameColor(e.target.value)} /></div>
                <div className="sx-input-group"><label className="sx-label">Accent Color</label><input type="color" className="sx-input" style={{height: '45px', padding: '5px'}} value={accent} onChange={e => setAccent(e.target.value)} /></div>
            </div>

            <div className="sx-input-group">
              <label className="sx-label">Audio Background URL (.mp3)</label>
              <input className="sx-input" value={bgAudio} onChange={e => setBgAudio(e.target.value)} placeholder="Link to audio file" />
            </div>
          </div>
        )}

        {tab === "badges" && (
          <div className="sx-pane animate-in fade-in duration-300">
            <div className="sx-input-group" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px'}}>
                <input type="checkbox" id="userBadge" checked={badges.user} onChange={() => setBadges({ ...badges, user: !badges.user })} style={{width: '18px', height: '18px'}} />
                <label htmlFor="userBadge" style={{margin: 0, fontSize: '13px', cursor: 'pointer'}}>Display Verified Badge</label>
            </div>
            
            <div className="sx-input-group" style={{marginTop: 30}}>
                <label className="sx-label">Developer Portal</label>
                <input className="sx-input" type="password" placeholder="Enter Developer Key" value={devPassword} onChange={e => setDevPassword(e.target.value)} />
                <button className="sx-publish-btn" onClick={unlockDev} style={{marginTop: '10px', background: 'rgba(255,255,255,0.1)', boxShadow: 'none'}}>Unlock Badge</button>
            </div>
          </div>
        )}
      </div>

      <div className="sx-preview-pane">
        {bgType === "gradient" && <div className="sx-bg-layer" style={{ background: gradient }} />}
        {bgType === "video" && bgVideo && <video className="sx-bg-layer" src={bgVideo} autoPlay loop muted playsInline />}
        {bgType === "image" && bgImage && <img className="sx-bg-layer" src={bgImage} alt="bg" />}
        
        <div className="sx-profile-card">
          <img src={avatar} className="sx-pfp" alt="profile" />
          
          <div className="sx-name" style={{ color: nameColor }}>{name}</div>

          {(badges.user || badges.dev || badges.staff) && (
            <div className="sx-badge-pill">
                {badges.user && <ShieldCheck size={16} color="#3b82f6" />}
                {badges.dev && <Code size={16} color={accent} />}
                {badges.staff && <Star size={16} color="#f59e0b" />}
            </div>
          )}

          <div className="sx-tags-row">
            {age && <span className="sx-tag-pill">{age} y/o</span>}
            {gender && <span className="sx-tag-pill">{gender}</span>}
            {sexuality && <span className="sx-tag-pill">{sexuality}</span>}
            {birthday && <span className="sx-tag-pill">{new Date(birthday).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>}
            {timezone && <span className="sx-tag-pill">{timezone.split('/').pop()?.replace('_', ' ')}</span>}
          </div>

          <div className="sx-bio" style={{ color: bioColor }}>{bio || "No bio yet."}</div>
          
          <div className="sx-links-row">
            {links.map(l => l.url && (
              <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="sx-icon-link">
                <img src={getIcon(l)} alt={l.type} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
