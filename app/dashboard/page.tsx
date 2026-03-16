"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const [tab, setTab] = useState<"profile" | "appearance">("profile");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [accent, setAccent] = useState("#ff5fa2");
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Fetch data on load
  useEffect(() => {
    async function loadProfile() {
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
    loadProfile();
  }, []);

  // 2. Save data function
  const handleSave = async () => {
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
    else alert("Saved successfully! ♡");
  };

  if (loading) return <div className="loading">Loading Editor...</div>;

  return (
    <div className="dash">
      <div className="editor">
        <div className="nav-header">
           <div className="back">← Dashboard</div>
           <button onClick={handleSave} className="saveBtn">Save Changes</button>
        </div>

        <div className="tabs">
          <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>Profile</button>
          <button className={tab === "appearance" ? "active" : ""} onClick={() => setTab("appearance")}>Appearance</button>
        </div>

        {tab === "profile" && (
          <div className="panel">
            <div className="avatarUpload">
              <img src="/avatar.png" alt="avatar" />
              <p>Click to change</p>
            </div>

            <label>Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} />

            <label>Username (URL)</label>
            <div className="username-input">
              <span>softcard.cc/</span>
              <input value={username} disabled /> {/* Username usually locked after setup */}
            </div>

            <label>Bio</label>
            <textarea maxLength={160} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people about yourself..." />
          </div>
        )}

        {tab === "appearance" && (
          <div className="panel">
            <h3>Accent Color</h3>
            <div className="colors">
              {["#4f8cff", "#00d1b2", "#ff5fa2", "#a855f7", "#ff7a00"].map(color => (
                <button key={color} style={{ background: color }} className={accent === color ? "selected" : ""} onClick={() => setAccent(color)} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="preview">
        <div className="profilePreview">
          <img src="/avatar.png" alt="preview-avatar" />
          <h2 style={{ color: accent }}>{displayName || "Your Name"}</h2>
          <p>{bio || "Your bio will appear here..."}</p>
        </div>
      </div>
    </div>
  );
}
