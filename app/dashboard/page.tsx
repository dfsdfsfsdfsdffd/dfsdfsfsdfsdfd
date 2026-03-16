"use client"
import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'

export default function Dashboard() {
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setName(profile.display_name || "")
        setUsername(profile.username || "")
        setAvatar(profile.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg")
        // Using the existing bio or a new 'primary_link' column if you added it
        setLinkTitle(profile.link_title || "")
        setLinkUrl(profile.link_url || "")
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  async function saveEverything() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Updates profile and the single link simultaneously
    await supabase.from('profiles').update({
      display_name: name,
      avatar_url: avatar,
      link_title: linkTitle,
      link_url: linkUrl
    }).eq('id', user?.id)
    
    setSaving(false)
  }

  const referral = `https://softcard.cc/signup?ref=${username}`

  if (loading) return <div style={{color: 'white', padding: '20px'}}>Loading...</div>

  return (
    <div className="scdash">
      <style jsx>{`
        .scdash { height:100vh; display:grid; grid-template-columns:420px 1fr; background:#020617; color:white; font-family:Inter,system-ui; }
        .scdash-editor { background:#081223; padding:30px; overflow:auto; border-right:1px solid rgba(255,255,255,.05); }
        .scdash-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .scdash-btn { padding:10px 16px; border-radius:10px; border:none; cursor:pointer; background:#3b82f6; color:white; }
        .scdash-input { width:100%; padding:10px; margin-top:6px; border-radius:8px; border:none; background:#020617; color:white; }
        .scdash-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .scdash-label { font-size:12px; opacity:.7; margin-top:12px; display:block; }
        .scdash-preview { display:flex; align-items:center; justify-content:center; background: radial-gradient(circle at 80% 40%, #1e3a8a 0%, transparent 50%), #000; }
        .scdash-avatar { width:110px; height:110px; border-radius:50%; object-fit:cover; box-shadow:0 0 35px #3b82f6; }
        .scdash-linkbtn { width: 100%; padding:12px; border-radius:10px; background:#0b1726; border:1px solid rgba(255,255,255,.08); cursor:pointer; margin-top: 20px; display: block; text-decoration: none; color: white; text-align: center; }
      `}</style>

      <div className="scdash-editor">
        <div className="scdash-header">
          <div style={{fontSize: '24px', fontWeight: '600'}}>Edit Profile</div>
          <button className="scdash-btn" onClick={saveEverything}>{saving ? "Saving..." : "Save"}</button>
        </div>

        <div className="scdash-profile">
          <label className="scdash-label">Avatar URL</label>
          <input className="scdash-input" value={avatar} onChange={e=>setAvatar(e.target.value)} />

          <label className="scdash-label">Display Name</label>
          <input className="scdash-input" value={name} onChange={e=>setName(e.target.value)} />

          <label className="scdash-label">Username (Locked)</label>
          <input className="scdash-input" value={username} disabled />
        </div>

        <div style={{marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px'}}>
          <div style={{fontWeight: '600'}}>Your Single Link</div>
          <label className="scdash-label">Button Text</label>
          <input className="scdash-input" value={linkTitle} onChange={e=>setLinkTitle(e.target.value)} placeholder="e.g. My Portfolio" />
          
          <label className="scdash-label">URL</label>
          <input className="scdash-input" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div style={{marginTop: '30px', background: '#0c1626', padding: '15px', borderRadius: '10px', fontSize: '13px'}}>
          Referral Link: <br/> <span style={{opacity: 0.7}}>{referral}</span>
        </div>
      </div>

      <div className="scdash-preview">
        <div style={{textAlign: 'center'}}>
          <img src={avatar} className="scdash-avatar" />
          <div style={{fontSize: '28px', marginTop: '10px'}}>{name || "akuryō"}</div>
          <div style={{opacity: 0.7}}>@{username}</div>
          {linkUrl && (
            <a href={linkUrl} className="scdash-linkbtn">
              {linkTitle || "Visit Link"}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
