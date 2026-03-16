"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from '@supabase/ssr';
import UsernameSetup from "@/components/UsernameSetup"; // We'll build this next

export default function Dashboard() {
  const [profile, setProfile] = useState({
    displayName: "",
    username: "",
    avatar: "https://i.imgur.com/1X6g1YH.jpeg",
    linkTitle: "",
    linkUrl: "",
    setupCompleted: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          displayName: data.display_name || "",
          username: data.username || "",
          avatar: data.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg",
          linkTitle: data.link_title || "",
          linkUrl: data.link_url || "",
          setupCompleted: data.setup_completed
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({
      display_name: profile.displayName,
      avatar_url: profile.avatar,
      link_title: profile.linkTitle,
      link_url: profile.linkUrl
    }).eq('id', user?.id);
    setSaving(false);
  };

  if (loading) return <div className="loading">Loading...</div>;

  // 1. Force Setup if they haven't claimed a username
  if (!profile.setupCompleted) {
    return <UsernameSetup supabase={supabase} onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="scdb-root">
      <div className="scdb-sidebar">
        <div className="scdb-back">← Back to Dashboard</div>

        <div className="scdb-tabs">
          <div className="scdb-tab scdb-tab-active">Profile</div>
          <div className="scdb-tab" onClick={handleSave}>
            {saving ? "Saving..." : "Save Changes"}
          </div>
        </div>

        <div className="scdb-card">
          <img className="scdb-avatar" src={profile.avatar} alt="avatar" />
          
          <label className="scdb-label">Avatar URL</label>
          <input 
            className="scdb-input" 
            value={profile.avatar}
            onChange={(e) => setProfile({...profile, avatar: e.target.value})}
          />

          <label className="scdb-label">Display Name</label>
          <input 
            className="scdb-input" 
            value={profile.displayName}
            onChange={(e) => setProfile({...profile, displayName: e.target.value})}
          />

          <label className="scdb-label">Username (Locked)</label>
          <input className="scdb-input" value={profile.username} disabled />

          <div style={{ marginTop: '20px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
            <label className="scdb-label">Link Title</label>
            <input 
              className="scdb-input" 
              value={profile.linkTitle}
              onChange={(e) => setProfile({...profile, linkTitle: e.target.value})}
            />
            <label className="scdb-label">Link URL</label>
            <input 
              className="scdb-input" 
              value={profile.linkUrl}
              onChange={(e) => setProfile({...profile, linkUrl: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="scdb-preview">
        <div className="scdb-preview-card">
          <img className="scdb-preview-avatar" src={profile.avatar} alt="preview" />
          <div className="scdb-preview-name">{profile.displayName || "Name"}</div>
          <div className="scdb-links">
            {profile.linkUrl && (
              <div className="scdb-link">{profile.linkTitle || "Visit Link"}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
