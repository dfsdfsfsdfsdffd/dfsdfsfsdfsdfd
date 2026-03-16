"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const [tab, setTab] = useState("profile");
  
  // State for database fields
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [accent, setAccent] = useState("#ff5fa2");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // 1. Fetch current data when the page opens
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setAccent(data.accent_color || "#ff5fa2");
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  // 2. Save function
  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
        accent_color: accent,
      })
      .eq('id', user?.id);

    if (error) alert(error.message);
    setSaving(false);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="topbar">
        <span>← Back to Dashboard</span>
        <button 
          className="saveBtn" 
          onClick={handleSave} 
          disabled={saving}
          style={{ background: accent, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', float: 'right' }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </header>

      <div className="dashboardLayout">
        {/* LEFT SIDEBAR */}
        <div className="sidebar">
          <button className={tab === "profile" ? "tab active" : "tab"} onClick={() => setTab("profile")}>Profile</button>
          <button className={tab === "appearance" ? "tab active" : "tab"} onClick={() => setTab("appearance")}>Appearance</button>
        </div>

        {/* EDITOR */}
        <div className="editor">
          {tab === "profile" && (
            <div className="panel">
              <h2>Profile</h2>
              <div className="avatarUpload">
                <img src="/avatar.png" alt="avatar" />
                <span>Upload Avatar</span>
              </div>

              <label>Display Name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display Name" />
              
              <label>Username (URL)</label>
              <input value={username} disabled placeholder="Username" style={{ opacity: 0.5 }} />

              <label>Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself" />

              <label className="toggle">
                <input type="checkbox" />
                <span>Discord Activity</span>
              </label>
            </div>
          )}

          {tab === "appearance" && (
            <div className="panel">
              <h2>Appearance</h2>
              <div className="colorGrid">
                {["#4f8cff", "#00d1b2", "#ff5fa2", "#a855f7", "#ff7a00"].map(color => (
                  <div 
                    key={color} 
                    className={`color ${accent === color ? 'selected' : ''}`} 
                    style={{ background: color, border: accent === color ? '2px solid white' : 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }} 
                    onClick={() => setAccent(color)}
                  />
                ))}
              </div>

              <h3>Button Style</h3>
              <div className="buttonStyles">
                <button className="style filled">Filled</button>
                <button className="style outline">Outline</button>
                <button className="style glass">Glass</button>
              </div>
            </div>
          )}
        </div>

        {/* PREVIEW */}
        <div className="preview">
          <div className="phone">
            <img className="avatar" src="/avatar.png" alt="preview" />
            <h2 style={{ color: accent }}>{displayName || "Display Name"}</h2>
            <p style={{ textAlign: 'center', padding: '0 20px', fontSize: '14px', opacity: 0.8 }}>{bio}</p>
            <button className="linkBtn" style={{ background: accent }}>Example Link</button>
            <button className="linkBtn" style={{ background: accent }}>Another Link</button>
          </div>
        </div>
      </div>
    </div>
  );
}
