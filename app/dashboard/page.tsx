"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from '@supabase/ssr';
import ProfilePanel from "@/components/ProfilePanel";
import AppearancePanel from "@/components/AppearancePanel";
import Preview from "@/components/Preview";

export default function Dashboard() {
  const [tab, setTab] = useState<"profile" | "appearance">("profile");
  
  // MERGED STATE: One object to rule them all
  const [profile, setProfile] = useState({
    avatar: "https://i.imgur.com/1X6g1YH.jpeg",
    displayName: "",
    username: "",
    bio: "",
    accent: "#ff5fa2",
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
          avatar: data.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg",
          displayName: data.display_name || "",
          username: data.username || "",
          bio: data.bio || "",
          accent: data.accent_color || "#ff5fa2",
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.displayName,
        bio: profile.bio,
        accent_color: profile.accent,
        // If you add avatar upload later, add it here
      })
      .eq('id', user?.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      // Optional: Add a "Saved!" toast here
    }
    setSaving(false);
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard">
      <header className="topbar">
        <span className="back">← Back to Dashboard</span>
        <button 
          className="saveBtn" 
          onClick={handleSave} 
          disabled={saving}
          style={{ background: profile.accent }} // Dynamic button color based on accent
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </header>

      <div className="dashboardLayout">
        <div className="editor">
          <div className="tabs">
            <button
              className={tab === "profile" ? "tab active" : "tab"}
              onClick={() => setTab("profile")}
            >
              Profile
            </button>
            <button
              className={tab === "appearance" ? "tab active" : "tab"}
              onClick={() => setTab("appearance")}
            >
              Appearance
            </button>
          </div>

          <div className="panelContent">
            {tab === "profile" && (
              <ProfilePanel profile={profile} setProfile={setProfile} />
            )}
            {tab === "appearance" && (
              <AppearancePanel profile={profile} setProfile={setProfile} />
            )}
          </div>
        </div>

        {/* The Preview now stays perfectly in sync with the object */}
        <Preview profile={profile} />
      </div>
    </div>
  );
}
