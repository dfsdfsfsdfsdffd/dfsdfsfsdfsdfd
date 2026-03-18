"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Pencil, BarChart3, LogOut, ShieldCheck, Code, Star, Trash2, Globe, Tag as TagIcon, Plus } from "lucide-react"

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

  const [avatar, setAvatar] = useState("https://i.imgur.com/1X6g1YH.jpeg")
  const [name, setName] = useState("akuryō")
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

  const [accent, setAccent] = useState("#7000ff")
  const [nameColor, setNameColor] = useState("#ffffff")
  const [bioColor, setBioColor] = useState("rgba(255,255,255,0.7)")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  const [gradient, setGradient] = useState("linear-gradient(135deg, #1a0b1a 0%, #050106 100%)")
  const [gradientStart, setGradientStart] = useState("#1a0b1a")
  const [gradientEnd, setGradientEnd] = useState("#050106")

  const [bgVideo, setBgVideo] = useState("")
  const [bgImage, setBgImage] = useState("")
  const [bgAudio, setBgAudio] = useState("")
  const [showGlass, setShowGlass] = useState(true)

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
        setShowGlass(profile.show_glass_card ?? profile.show_transparent_card ?? true)

        const bgVal = profile.background_value || "";
        if (profile.background_type === "gradient") {
          setGradient(bgVal || gradient);
        }
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

    if (error) alert("Error: " + error.message)
    else alert("Published! ♡")
    setSaving(false)
  }

  const handleCopy = () => {
    if (!username) return;
    navigator.clipboard.writeText(`softcard.cc/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addLink = () => setLinks([...links, { id: Date.now(), type: "website", url: "" }])
  
  const removeLink = (id: number) => {
    setLinks(links.filter(l => l.id !== id))
  }

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

  if (view === "hub") {
    return (
      <div className="hx-root">
        <style>{`
          .hx-root {
            min-height: 100vh;
            width: 100%;
            background: radial-gradient(circle at center, #1a0b1a 0%, #050106 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
          }
          .hx-container { text-align: center; width: 100%; max-width: 600px; padding: 20px; }
          .hub-header { margin-bottom: 40px; }
          .hx-status { font-size: 10px; letter-spacing: 2px; opacity: 0.5; margin-bottom: 8px; font-weight: 700; }
          .hx-title { font-size: 32px; font-weight: 600; }
          .hx-username { color: #f472b6; }
          
          .hx-circle-wrap { position: relative; display: inline-block; margin-bottom: 50px; width: 300px; height: 300px; }
          .hx-circle {
            width: 100%; height: 100%;
            background: rgba(190, 24, 93, 0.1);
            border-radius: 50%;
            border: 1px solid rgba(244, 114, 182, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
          }
          .hx-avatar {
            width: 130px; height: 130px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #f472b6;
            box-shadow: 0 0 40px rgba(244, 114, 182, 0.2);
          }
          .hx-avatar img { width: 100%; height: 100%; object-fit: cover; }
          
          .hx-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: #ec4899;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          }
          .hx-btn:hover { transform: translateY(-50%) scale(1.05); background: #f472b6; }
          .hx-left { left: -70px; }
          .hx-right { right: -70px; }
          
          .hx-url {
            display: inline-flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 10px 10px 10px 24px;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            gap: 20px;
          }

          .hx-url-actions {
            display: flex;
            gap: 8px;
          }

          .hx-small-btn {
            background: #ec4899;
            border: none;
            color: white;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            display: flex;
            align-items: center;
            transition: opacity 0.2s;
          }
          .hx-small-btn:hover { opacity: 0.9; }
          .hx-copy { background: #ec4899; }
          .hx-view { background: rgba(255,255,255,0.1); }

          .hx-logout { position: fixed; top: 30px; right: 30px; opacity: 0.3; cursor: pointer; transition: 0.2s; }
          .hx-logout:hover { opacity: 1; color: #f472b6; }
        `}</style>

        <div className="hx-logout" onClick={() => supabase?.auth.signOut()}>
          <LogOut size={20} />
        </div>

        <div className="hx-container">
          <div className="hub-header">
            <p className="hx-status">LOGGED INTO SOFTCARD.CC</p>
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
              <span>Edit</span>
            </button>

            <button className="hx-btn hx-right">
              <BarChart3 size={18} />
              <span>Stats</span>
            </button>
          </div>

          <div>
            <div className="hx-url">
              <span style={{ opacity: 0.6 }}>softcard.cc/{username || "..."}</span>
              <div className="hx-url-actions">
                <button className="hx-small-btn hx-copy" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a 
                  href={`/${username}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hx-small-btn hx-view"
                >
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
        .sx-sidebar { width: 380px; background: rgba(10, 0, 15, 0.7); backdrop-filter: blur(30px); border-right: 1px solid rgba(255, 0, 128, 0.15); padding: 25px; overflow-y: auto; }
        .sx-preview-pane { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #020002; }
        .sx-profile-card {
          position: relative; z-index: 5; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          width: 90%; max-width: 450px;
          padding: 35px 25px;
          border-radius: 24px;
          transition: all 0.3s ease;
          background: ${showGlass ? 'rgba(0, 0, 0, 0.4)' : 'transparent'};
          backdrop-filter: ${showGlass ? 'blur(20px)' : 'none'};
          border: ${showGlass ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          box-shadow: ${showGlass ? '0 20px 50px rgba(0,0,0,0.5)' : 'none'};
        }
        .sx-pfp { 
          width: 95px; height: 95px; border-radius: 50%; object-fit: cover; margin-bottom: 18px;
          border: 3px solid ${accent};
          box-shadow: 0 0 25px ${accent}44; 
        }
        .sx-name-wrapper {
          display: flex; align-items: center; justify-content: center; width: 100%; gap: 10px; margin-bottom: 6px;
        }
        .sx-name { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; white-space: nowrap; }
        
        .sx-badge-pill { 
          display: flex; gap: 8px; background: rgba(255, 255, 255, 0.08); 
          padding: 6px 10px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        
        .sx-bio { font-size: 15px; margin-bottom: 20px; max-width: 90%; line-height: 1.5; }
        
        /* UPDATED TAGS STYLING TO MATCH IMAGE_EA3436 */
        .sx-tags-row { 
          display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; 
          margin-bottom: 25px; width: 100%; max-width: 320px;
        }
        .sx-tag { 
          font-size: 13px; font-weight: 500; 
          background: rgba(255,255,255,0.06); 
          padding: 6px 14px; border-radius: 10px; 
          color: white; border: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 6px;
          white-space: nowrap;
        }

        .sx-links-row { display: flex; justify-content: center; gap: 24px; }
        .sx-icon-link { transition: 0.3s ease; opacity: 0.8; }
        .sx-icon-link:hover { opacity: 1; transform: translateY(-3px); }
        .sx-icon-link img { width: 24px; height: 24px; }

        .sx-editor-link { cursor: pointer; margin-bottom: 20px; display: inline-block; opacity: 0.5; font-size: 13px; }
        .sx-editor-link:hover { opacity: 1; color: #ec4899; }
        .sx-publish-btn {
            width: 100%; padding: 14px; border-radius: 12px; border: none; font-weight: 700;
            background: linear-gradient(90deg, #ff008c, #ff4df0); color: white; cursor: pointer;
            box-shadow: 0 10px 20px rgba(255, 0, 128, 0.3); margin-bottom: 20px;
        }
        .sx-tabs-row { display: flex; gap: 6px; margin-bottom: 20px; }
        .sx-tab { flex: 1; padding: 10px; border-radius: 10px; cursor: pointer; opacity: 0.6; background: rgba(255,255,255,0.03); text-align: center; transition: 0.2s; font-size: 12px; }
        .sx-tab-active { background: rgba(255,0,200,0.2); opacity: 1; border: 1px solid rgba(255,0,200,0.4); }
        
        .sx-input-group { margin-bottom: 15px; }
        .sx-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin-bottom: 5px; display: block; }
        .sx-input {
            width: 100%; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08); color: white; outline: none; transition: 0.2s; font-size: 14px;
        }
        .sx-input:focus { border-color: #ff2a8a; }
        
        .sx-bg-layer { position: absolute; inset: 0; z-index: 1; object-fit: cover; width: 100%; height: 100%; }

        .sx-link-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px; padding: 12px; margin-bottom: 12px; position: relative;
        }
        .sx-remove-link {
            position: absolute; top: -8px; right: -8px;
            background: #ef4444; color: white; border: none;
            width: 22px; height: 22px; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
      `}</style>

      <div className="sx-sidebar">
        <div className="sx-editor-link" onClick={() => setView("hub")}>← Back to Hub</div>
        <button className="sx-publish-btn" onClick={saveChanges}>{saving ? "Saving..." : "Save & Publish"}</button>

        <div className="sx-tabs-row">
          <div className={`sx-tab ${tab === "profile" ? "sx-tab-active" : ""}`} onClick={() => setTab("profile")}>Profile</div>
          <div className={`sx-tab ${tab === "tags" ? "sx-tab-active" : ""}`} onClick={() => setTab("tags")}>Tags</div>
          <div className={`sx-tab ${tab === "appearance" ? "sx-tab-active" : ""}`} onClick={() => setTab("appearance")}>Style</div>
          <div className={`sx-tab ${tab === "badges" ? "sx-tab-active" : ""}`} onClick={() => setTab("badges")}>Badges</div>
        </div>

        {tab === "profile" && (
          <div className="sx-pane">
            <div className="sx-input-group"><label className="sx-label">Avatar URL</label><input className="sx-input" value={avatar} onChange={e => setAvatar(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Display Name</label><input className="sx-input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Bio</label><input className="sx-input" value={bio} onChange={e => setBio(e.target.value)} /></div>
            
            <label className="sx-label">Social Links</label>
            <button className="sx-publish-btn" onClick={addLink} style={{background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px dashed rgba(255,255,255,0.2)'}}>+ Add Social</button>
            {links.map((l, i) => (
              <div key={l.id} className="sx-link-card">
                <button className="sx-remove-link" onClick={() => removeLink(l.id)}>×</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="sx-input" style={{ flex: '0 0 110px' }} value={l.type} onChange={e => updateLink(i, "type", e.target.value)}>
                    {Object.keys(iconMap).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <input className="sx-input" value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="URL" />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "tags" && (
          <div className="sx-pane">
            <div className="sx-input-group"><label className="sx-label">Age</label><input className="sx-input" placeholder="18" value={age} onChange={e => setAge(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Gender</label><input className="sx-input" placeholder="female" value={gender} onChange={e => setGender(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Sexuality</label><input className="sx-input" placeholder="gay" value={sexuality} onChange={e => setSexuality(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Birthday</label><input className="sx-input" placeholder="april 11th" value={birthday} onChange={e => setBirthday(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Timezone</label><input className="sx-input" placeholder="est" value={timezone} onChange={e => setTimezone(e.target.value)} /></div>
          </div>
        )}

        {tab === "appearance" && (
          <div className="sx-pane">
            <label className="sx-label"><input type="checkbox" checked={showGlass} onChange={e => setShowGlass(e.target.checked)} /> Show Transparent Card</label>
            <div className="sx-input-group">
                <label className="sx-label">Background Type</label>
                <select className="sx-input" value={bgType} onChange={e => setBgType(e.target.value)}>
                  <option value="gradient">Gradient</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
            </div>
            <div className="sx-input-group"><label className="sx-label">Name Color</label><input type="color" className="sx-input" value={nameColor} onChange={e => setNameColor(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Bio Color</label><input type="color" className="sx-input" value={bioColor} onChange={e => setBioColor(e.target.value)} /></div>
            <div className="sx-input-group"><label className="sx-label">Accent Color</label><input type="color" className="sx-input" value={accent} onChange={e => setAccent(e.target.value)} /></div>
          </div>
        )}

        {tab === "badges" && (
          <div className="sx-pane">
            <label className="sx-label"><input type="checkbox" checked={badges.user} onChange={() => setBadges({ ...badges, user: !badges.user })} /> User Badge</label>
            <div className="sx-input-group" style={{marginTop: 20}}>
                <label className="sx-label">Unlock Dev Badge</label>
                <input className="sx-input" placeholder="Password" value={devPassword} onChange={e => setDevPassword(e.target.value)} />
            </div>
            <button className="sx-publish-btn" onClick={unlockDev}>Unlock</button>
          </div>
        )}
      </div>

      <div className="sx-preview-pane">
        {bgType === "gradient" && <div className="sx-bg-layer" style={{ background: gradient }} />}
        {bgType === "video" && bgVideo && <video className="sx-bg-layer" src={bgVideo} autoPlay loop muted playsInline />}
        {bgType === "image" && bgImage && <img className="sx-bg-layer" src={bgImage} alt="bg" />}
        
        <div className="sx-profile-card">
          <img src={avatar} className="sx-pfp" alt="profile" />
          
          <div className="sx-name-wrapper">
             <div className="sx-name" style={{ color: nameColor }}>{name}</div>
             {(badges.user || badges.dev || badges.staff) && (
               <div className="sx-badge-pill">
                  {badges.user && <ShieldCheck size={16} color="rgba(255,255,255,0.6)" />}
                  {badges.dev && <Code size={16} color={accent} />}
                  {badges.staff && <Star size={16} color="rgba(255,255,255,0.6)" />}
               </div>
             )}
          </div>

          <div className="sx-bio" style={{ color: bioColor }}>{bio}</div>

          {/* PREVIEW TAGS - MATCHING PILL STYLE IN IMAGE_EA3436 */}
          <div className="sx-tags-row">
            {age && <div className="sx-tag">🎂 {age}</div>}
            {gender && <div className="sx-tag">⚥ {gender}</div>}
            {sexuality && <div className="sx-tag">⚧ {sexuality}</div>}
            {birthday && <div className="sx-tag">🎈 {birthday}</div>}
            {timezone && <div className="sx-tag">🌍 {timezone}</div>}
          </div>
          
          <div className="sx-links-row">
            {links.map(l => l.url && (
              <div key={l.id} className="sx-icon-link">
                <img src={getIcon(l)} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
