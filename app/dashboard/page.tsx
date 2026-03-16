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

  // PRESET STATE
  const [preset, setPreset] = useState<"default" | "blossom">("default")

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
  const [gradient, setGradient] = useState("linear-gradient(135deg,#020617,#1e3a8a)")
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
        setPreset(profile.preset || "default")
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
      preset: preset,
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

  // PREVIEW COMPONENTS
  function DefaultProfile() {
    return (
      <div className="scdb-profile-card">
          <img src={avatar} className="scdb-pfp" style={{ boxShadow: `0 0 40px ${accent}` }} />
          <div className="name-container">
            <div className="scdb-name" style={{ color: nameColor, fontSize: '24px', fontWeight: '600' }}>{name}</div>
          </div>
          <div className="scdb-bio" style={{ color: bioColor }}>{bio}</div>
          <div className="scdb-tags">
            {age && <div className="tag"><span>🎂</span>{age}</div>}
            {gender && <div className="tag"><span>⚥</span>{gender}</div>}
            {sexuality && <div className="tag"><span>❤</span>{sexuality}</div>}
            {birthday && <div className="tag"><span>🎉</span>{birthday}</div>}
            {timezone && <div className="tag"><span>🌍</span>{timezone}</div>}
          </div>
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
                  <img src={icon} alt="" />
                </a>
              )
            })}
          </div>
        </div>
    )
  }

  if (loading) return <div style={{ height: '100vh', background: '#020617' }} />

  // --- HUB VIEW RENDER ---
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
          .hub-btns-group { display: flex; gap: 8px; }
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
    <div className="scdb-dashboard" style={{ fontFamily: `${font}, system-ui` }}>
      <style>{`
        .scdb-links-row { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 18px; margin-top: 25px; }
        .scdb-icon-link img { width: 30px; height: 30px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4)); transition: all 0.2s ease; opacity: 0.9; }
        .scdb-icon-link:hover img { transform: translateY(-2px); opacity: 1; filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)); }
        .name-container { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px; }
        .scdb-badges { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
        .badge { 
          padding: 3px 10px; border-radius: 6px; background: rgba(255, 255, 255, 0.06); 
          backdrop-filter: blur(4px); font-size: 11px; font-weight: 800;
          color: rgba(255, 255, 255, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); 
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .scdb-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 15px; }
        .tag {
          display: flex; align-items: center; gap: 5px; background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px; border-radius: 8px; font-size: 12px; border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .scdb-profile-card {
          ${showGlass ? `
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            padding: 40px 30px;
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          ` : 'background: transparent; border: none; padding: 40px 30px;'}
          width: 100%; max-width: 420px; text-align: center; position: relative; z-index: 5; transition: all 0.3s ease;
        }
        .editor-back-link { cursor: pointer; margin-bottom: 20px; display: inline-block; opacity: 0.5; font-size: 13px; }
        .editor-back-link:hover { opacity: 1; color: #ec4899; }

        /* Blossom Component CSS */
        .blossom-root { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .blossom-card { 
            background: rgba(255, 192, 203, 0.15); backdrop-filter: blur(12px);
            border: 2px solid rgba(255, 255, 255, 0.3); padding: 40px; border-radius: 40px;
            width: 100%; max-width: 380px; text-align: center; color: white;
        }
        .blossom-avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; margin-bottom: 20px; box-shadow: 0 0 30px rgba(255,105,180,0.5); }
        .blossom-name { font-size: 28px; font-weight: 800; margin-bottom: 10px; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.5); }
        .blossom-bio { font-size: 14px; opacity: 0.9; margin-bottom: 20px; line-height: 1.5; }
        .blossom-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 25px; }
        .blossom-tags span { background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 20px; font-size: 12px; }
        .blossom-links { display: flex; flex-direction: column; gap: 10px; }
        .blossom-link { 
            background: #fff; color: #ff69b4; padding: 12px; border-radius: 15px; 
            text-decoration: none; font-weight: 700; font-size: 14px; transition: 0.3s;
        }
        .blossom-link:hover { transform: scale(1.03); background: #ffe4e1; }
      `}</style>

      <div className="scdb-sidebar">
        <div className="editor-back-link" onClick={() => setView("hub")}>← Back to Hub</div>
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
            {/* PRESET SELECTOR */}
            <label className="scdb-label">Profile Preset</label>
            <div style={{display:"flex", gap:"10px", marginBottom:"25px"}}>
              <button
                className="scdb-btn"
                onClick={() => setPreset("default")}
                style={{background: preset === "default" ? "#2563eb" : "#111827", flex: 1}}
              >
                Default
              </button>
              <button
                className="scdb-btn"
                onClick={() => setPreset("blossom")}
                style={{background: preset === "blossom" ? "#ff4fa0" : "#111827", flex: 1}}
              >
                Blossom
              </button>
            </div>

            <label className="scdb-label">Avatar URL</label>
            <input className="scdb-input" value={avatar} onChange={e => setAvatar(e.target.value)} />
            <label className="scdb-label">Display Name</label>
            <input className="scdb-input" value={name} onChange={e => setName(e.target.value)} />
            <label className="scdb-label">Bio</label>
            <input className="scdb-input" value={bio} onChange={e => setBio(e.target.value)} />
            
            <label className="scdb-label">Age</label>
            <input className="scdb-input" value={age} onChange={e => setAge(e.target.value)} />
            <label className="scdb-label">Gender</label>
            <input className="scdb-input" value={gender} onChange={e => setGender(e.target.value)} />
            <label className="scdb-label">Sexuality</label>
            <input className="scdb-input" value={sexuality} onChange={e => setSexuality(e.target.value)} />
            <label className="scdb-label">Birthday</label>
            <input className="scdb-input" value={birthday} onChange={e => setBirthday(e.target.value)} />
            <label className="scdb-label">Timezone</label>
            <input className="scdb-input" value={timezone} onChange={e => setTimezone(e.target.value)} />

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
            <label className="scdb-label" style={{ marginTop: '20px' }}>Name Color</label>
            <input type="color" className="scdb-input" value={nameColor} onChange={e => setNameColor(e.target.value)} />
            <label className="scdb-label" style={{ marginTop: '10px' }}>Bio Color</label>
            <input type="color" className="scdb-input" value={bioColor} onChange={e => setBioColor(e.target.value)} />
            <label className="scdb-label" style={{ marginTop: '10px' }}>Accent Color</label>
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
        
        {/* PRESET SWITCHER */}
        {preset === "default" ? (
            <DefaultProfile />
        ) : (
            <BlossomProfile 
                avatar={avatar} 
                name={name} 
                bio={bio} 
                links={links} 
                age={age} 
                gender={gender} 
                sexuality={sexuality} 
                birthday={birthday} 
                timezone={timezone} 
            />
        )}
      </div>
    </div>
  )
}

function BlossomProfile({ avatar, name, bio, links, age, gender, sexuality, birthday, timezone }: any) {
  return (
    <div className="blossom-root">
      <div className="blossom-card">
        <img src={avatar} className="blossom-avatar" alt="avatar"/>
        <h2 className="blossom-name">{name}</h2>
        <p className="blossom-bio">{bio}</p>

        <div className="blossom-tags">
          {age && <span>🎂 {age}</span>}
          {gender && <span>⚥ {gender}</span>}
          {sexuality && <span>❤ {sexuality}</span>}
          {birthday && <span>🎉 {birthday}</span>}
          {timezone && <span>🌍 {timezone}</span>}
        </div>

        <div className="blossom-links">
          {links.map((l: any) => {
            if (!l.url) return null
            return (
              <a
                key={l.id}
                href={l.url.startsWith("http") ? l.url : `https://${l.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="blossom-link"
              >
                {l.title || l.url}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
