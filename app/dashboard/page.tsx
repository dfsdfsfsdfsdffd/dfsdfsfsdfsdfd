"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Pencil, BarChart3, LogOut, Copy, Check, ExternalLink } from "lucide-react"

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
  return "https://cdn.simpleicons.org/pwa/ffffff"
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
  
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [sexuality, setSexuality] = useState("")
  const [birthday, setBirthday] = useState("")
  const [timezone, setTimezone] = useState("")

  const [links, setLinks] = useState<any[]>([])
  const [badges, setBadges] = useState<any>({ user: true, dev: false })
  const [devPassword, setDevPassword] = useState("")

  const [accent, setAccent] = useState("#3b82f6")
  const [nameColor, setNameColor] = useState("#ffffff")
  const [bioColor, setBioColor] = useState("rgba(255,255,255,0.7)")
  const [font, setFont] = useState("Inter")
  const [bgType, setBgType] = useState("gradient")
  
  // UPDATED: Default Gradient & New Picker States
  const [gradient, setGradient] = useState("radial-gradient(circle at center, #1a0b1a 0%, #050106 100%)")
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
        setAccent(profile.accent_color || "#3b82f6")
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
    navigator.clipboard.writeText(`softcard.cc/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  if (view === "hub") {
    return (
      <div className="hub-view-root">
        <style>{`
          .hub-view-root {
            min-height: 100vh;
            width: 100%;
            background: radial-gradient(circle at center, #1a0b1a 0%, #050106 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
          }
          .hub-container { text-align: center; width: 100%; max-width: 600px; padding: 20px; }
          .hub-header { margin-bottom: 40px; }
          .hub-status { font-size: 10px; letter-spacing: 2px; opacity: 0.5; margin-bottom: 8px; font-weight: 700; }
          .hub-title { font-size: 32px; font-weight: 600; }
          .hub-brand { color: #f472b6; }
          
          .hub-circle-wrapper { position: relative; display: inline-block; margin-bottom: 50px; width: 300px; height: 300px; }
          .hub-circle {
            width: 100%; height: 100%;
            background: rgba(190, 24, 93, 0.1);
            border-radius: 50%;
            border: 1px solid rgba(244, 114, 182, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
          }
          .hub-avatar-img {
            width: 130px; height: 130px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #f472b6;
            box-shadow: 0 0 40px rgba(244, 114, 182, 0.2);
          }
          .hub-avatar-img img { width: 100%; height: 100%; object-fit: cover; }
          
          .hub-action-btn {
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
          .hub-action-btn:hover { transform: translateY(-50%) scale(1.05); background: #f472b6; }
          .btn-left { left: -70px; }
          .btn-right { right: -70px; }
          
          .hub-url-bar {
            display: inline-flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 10px 10px 10px 24px;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            gap: 20px;
          }

          .hub-btns-group {
            display: flex;
            gap: 8px;
          }

          .hub-copy-btn {
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
          .hub-copy-btn:hover { opacity: 0.9; }

          .hub-logout-icon { position: fixed; top: 30px; right: 30px; opacity: 0.3; cursor: pointer; }
          .hub-logout-icon:hover { opacity: 1; color: #f472b6; }
        `}</style>

        <div className="hub-logout-icon" onClick={() => supabase?.auth.signOut()}>
          <LogOut size={20} />
        </div>

        <div className="hub-container">
          <div className="hub-header">
            <p className="hub-status">LOGGED INTO SOFTCARD.CC</p>
            <h1 className="hub-title">Welcome back, <span className="hub-brand">{username || "User"}</span></h1>
          </div>

          <div className="hub-circle-wrapper">
            <div className="hub-circle">
              <div className="hub-avatar-img">
                <img src={avatar} alt="avatar" />
              </div>
            </div>

            <button className="hub-action-btn btn-left" onClick={() => setView("editor")}>
              <Pencil size={18} />
              <span>Edit</span>
            </button>

            <button className="hub-action-btn btn-right">
              <BarChart3 size={18} />
              <span>Stats</span>
            </button>
          </div>

          <div>
            <div className="hub-url-bar">
              <span style={{ opacity: 0.6 }}>softcard.cc/{username}</span>
              <div className="hub-btns-group">
                <button className="hub-copy-btn" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a 
                  href={`/${username}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hub-copy-btn"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
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

        .sx-links-row { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 18px; margin-top: 25px; }
        .sx-icon-link img { width: 30px; height: 30px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4)); transition: all 0.2s ease; opacity: 0.9; }
        .sx-icon-link:hover img { transform: translateY(-2px); opacity: 1; filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)); }

        .sx-name-container { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
          margin-bottom: 5px;
        }

        .sx-badges-row { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
        .sx-badge { 
          padding: 3px 10px; 
          border-radius: 6px; 
          background: rgba(255, 255, 255, 0.06); 
          backdrop-filter: blur(4px);
          font-size: 11px; 
          font-weight: 800;
          color: rgba(255, 255, 255, 0.85); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .sx-tags-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-top: 15px;
        }
        .sx-tag {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sx-profile-card {
          ${showGlass ? `
            background: rgba(15, 0, 25, 0.6);
            backdrop-filter: blur(25px);
            padding: 40px 30px;
            border-radius: 28px;
            border: 1px solid rgba(255, 0, 128, 0.2);
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
          ` : 'background: transparent; border: none; padding: 40px 30px;'}
          width: 100%;
          max-width: 420px;
          text-align: center;
          position: relative;
          z-index: 5;
          transition: all 0.3s ease;
        }

        .sx-pfp { width: 105px; height: 105px; border-radius: 50%; object-fit: cover; margin: 0 auto 20px; display: block; }

        .sx-editor-link { cursor: pointer; margin-bottom: 20px; display: inline-block; opacity: 0.5; font-size: 13px; }
        .sx-editor-link:hover { opacity: 1; color: #ec4899; }

        .sx-publish-btn {
            width: 100%; padding: 14px; border-radius: 12px; border: none; font-weight: 700;
            background: linear-gradient(90deg, #ff008c, #ff4df0); color: white; cursor: pointer;
            box-shadow: 0 10px 20px rgba(255, 0, 128, 0.3); margin-bottom: 20px;
        }

        .sx-tabs-row { display: flex; gap: 8px; margin-bottom: 20px; }
        .sx-tab { flex: 1; padding: 10px; border-radius: 10px; cursor: pointer; opacity: 0.6; background: rgba(255,255,255,0.03); text-align: center; transition: 0.2s; font-size: 13px; }
        .sx-tab-active { background: rgba(255,0,200,0.2); opacity: 1; border: 1px solid rgba(255,0,200,0.4); }

        .sx-input-group { margin-bottom: 15px; }
        .sx-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin-bottom: 5px; display: block; }
        .sx-input {
            width: 100%; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08); color: white; outline: none; transition: 0.2s; font-size: 14px;
        }
        .sx-input:focus { border-color: #ff2a8a; }

        /* SEXY COLOR PICKER OVERRIDE */
        input[type="color"] {
          width: 100%;
          height: 40px;
          border: none;
          border-radius: 10px;
          background: none;
          margin-top: 6px;
          cursor: pointer;
        }

        .sx-bg-layer { position: absolute; inset: 0; z-index: 1; object-fit: cover; width: 100%; height: 100%; }
      `}</style>

      <div className="sx-sidebar">
        <div className="sx-editor-link" onClick={() => setView("hub")}>← Back to Hub</div>
        
        <button className="sx-publish-btn" onClick={saveChanges}>
          {saving ? "Saving..." : "Save & Publish"}
        </button>

        <div className="sx-tabs-row">
          <div className={`sx-tab ${tab === "profile" ? "sx-tab-active" : ""}`} onClick={() => setTab("profile")}>Profile</div>
          <div className={`sx-tab ${tab === "appearance" ? "sx-tab-active" : ""}`} onClick={() => setTab("appearance")}>Style</div>
          <div className={`sx-tab ${tab === "badges" ? "sx-tab-active" : ""}`} onClick={() => setTab("badges")}>Badges</div>
        </div>

        {tab === "profile" && (
          <div className="sx-pane">
            <div className="sx-input-group">
                <label className="sx-label">Avatar URL</label>
                <input className="sx-input" value={avatar} onChange={e => setAvatar(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Display Name</label>
                <input className="sx-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Bio</label>
                <input className="sx-input" value={bio} onChange={e => setBio(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Age</label>
                <input className="sx-input" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Gender</label>
                <input className="sx-input" value={gender} onChange={e => setGender(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Sexuality</label>
                <input className="sx-input" value={sexuality} onChange={e => setSexuality(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Birthday</label>
                <input className="sx-input" value={birthday} onChange={e => setBirthday(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Timezone</label>
                <input className="sx-input" value={timezone} onChange={e => setTimezone(e.target.value)} />
            </div>

            <button className="sx-publish-btn" onClick={addLink} style={{background: 'rgba(255,255,255,0.05)', boxShadow: 'none'}}>+ Add Link</button>
            {links.map((l, i) => (
              <div key={l.id} className="sx-input-group">
                <input className="sx-input" value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="URL (e.g. google.com)" />
              </div>
            ))}
          </div>
        )}

        {tab === "appearance" && (
          <div className="sx-pane">
            <label className="sx-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px', textTransform: 'none', opacity: 1 }}>
                <input type="checkbox" checked={showGlass} onChange={e => setShowGlass(e.target.checked)} />
                Show Transparent Card
            </label>
            <div className="sx-input-group">
                <label className="sx-label">Background Type</label>
                <select className="sx-input" value={bgType} onChange={e => setBgType(e.target.value)}>
                  <option value="gradient">Gradient</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
            </div>

            {/* UPDATED: SEXY GRADIENT PICKER SYSTEM */}
            {bgType === "gradient" && (
              <div className="sx-input-group">
                <label className="sx-label">Gradient Colors</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={e => {
                      const newStart = e.target.value
                      setGradientStart(newStart)
                      setGradient(`linear-gradient(135deg, ${newStart}, ${gradientEnd})`)
                    }}
                  />
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={e => {
                      const newEnd = e.target.value
                      setGradientEnd(newEnd)
                      setGradient(`linear-gradient(135deg, ${gradientStart}, ${newEnd})`)
                    }}
                  />
                </div>
              </div>
            )}

            {bgType === "video" && <div className="sx-input-group"><input className="sx-input" value={bgVideo} onChange={e => setBgVideo(e.target.value)} placeholder="Video URL" /></div>}
            {bgType === "image" && <div className="sx-input-group"><input className="sx-input" value={bgImage} onChange={e => setBgImage(e.target.value)} placeholder="Image URL" /></div>}
            
            <div className="sx-input-group">
                <label className="sx-label">Audio URL (.mp3)</label>
                <input className="sx-input" value={bgAudio} onChange={e => setBgAudio(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Name Color</label>
                <input type="color" className="sx-input" style={{height: '45px', padding: '5px'}} value={nameColor} onChange={e => setNameColor(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Bio Color</label>
                <input type="color" className="sx-input" style={{height: '45px', padding: '5px'}} value={bioColor} onChange={e => setBioColor(e.target.value)} />
            </div>
            <div className="sx-input-group">
                <label className="sx-label">Accent Color</label>
                <input type="color" className="sx-input" style={{height: '45px', padding: '5px'}} value={accent} onChange={e => setAccent(e.target.value)} />
            </div>
          </div>
        )}

        {tab === "badges" && (
          <div className="sx-pane">
            <label className="sx-label" style={{ display: "flex", gap: 10, alignItems: 'center', textTransform: 'none', opacity: 1 }}>
              <input type="checkbox" checked={badges.user} onChange={() => setBadges({ ...badges, user: !badges.user })} />
              User Badge
            </label>
            <div className="sx-input-group" style={{ marginTop: 20 }}>
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
        {bgType === "image" && bgImage && <img className="sx-bg-layer" src={bgImage} />}
        {bgAudio && <audio src={bgAudio} autoPlay loop />}
        
        <div className="sx-profile-card">
          <img src={avatar} className="sx-pfp" style={{ boxShadow: `0 0 40px ${accent}` }} />
          
          <div className="sx-name-container">
            <div className="sx-name" style={{ color: nameColor, fontSize: '24px', fontWeight: '600' }}>{name}</div>
          </div>

          <div className="sx-bio" style={{ color: bioColor }}>{bio}</div>

          <div className="sx-tags-row">
            {age && <div className="sx-tag"><span>🎂</span>{age}</div>}
            {gender && <div className="sx-tag"><span>⚥</span>{gender}</div>}
            {sexuality && <div className="sx-tag"><span>❤</span>{sexuality}</div>}
            {birthday && <div className="sx-tag"><span>🎉</span>{birthday}</div>}
            {timezone && <div className="sx-tag"><span>🌍</span>{timezone}</div>}
          </div>
          
          <div className="sx-badges-row">
            {badges.user && <div className="sx-badge">User</div>}
            {badges.dev && <div className="sx-badge dev" style={{ borderColor: accent, color: accent }}>Dev</div>}
          </div>

          <div className="sx-links-row">
            {links.map(l => {
              if (!l.url) return null;
              const icon = getIcon(l.url)
              return (
                <a key={l.id} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" className="sx-icon-link">
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
