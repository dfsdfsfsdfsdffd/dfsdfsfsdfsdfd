"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({ subsets: ["latin"], weight: ["400", "600"] });

// 1. Define your banned/reserved list here
const RESERVED_USERNAMES = [
  "setup", 
  "dashboard", 
  "admin", 
  "login", 
  "api", 
  "settings", 
  "hub", 
  "edit"
];

export default function Setup() {
  const [username, setUsername] = useState("");
  const [isTaken, setIsTaken] = useState(false);
  const [isReserved, setIsReserved] = useState(false); // 2. New state for reserved check
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  useEffect(() => {
    const checkUsername = async () => {
      if (!supabase) return;

      const lowerUsername = username.toLowerCase();
      
      if (lowerUsername.length < 3) {
        setIsReserved(false);
        setIsTaken(false);
        return;
      }

      if (RESERVED_USERNAMES.includes(lowerUsername)) {
        setIsReserved(true);
        setIsTaken(false);
        return;
      } else {
        setIsReserved(false);
      }

      const response = await fetch(`/api/username?username=${encodeURIComponent(lowerUsername)}`);
      const result = await response.json();
      setIsReserved(result.status === "reserved");
      setIsTaken(result.status === "taken");
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSave = async () => {
    setLoading(true);
    if (!supabase) {
      alert("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const lowerUsername = username.toLowerCase();
    const response = await fetch(`/api/username?username=${encodeURIComponent(lowerUsername)}&currentId=${encodeURIComponent(user?.id || "")}`);
    const result = await response.json();

    if (!response.ok || result.status !== "available") {
      alert(result.status === "reserved" ? "That username is reserved." : "That username is already taken.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user?.id, 
        username: lowerUsername,
        updated_at: new Date() 
      });

    if (!error) {
      router.push('/dashboard');
    } else {
      alert("Error saving: " + error.message);
    }
    setLoading(false);
  };

return (
  <main className={`ux-root ${font.className}`}>
    <div className="ux-card">
      <h1 className="ux-title">Claim your link</h1>
      <p className="ux-sub">This will be your unique Softcard URL</p>

      <div className="ux-form">
        <div className="ux-input-wrap">
          <span className="ux-prefix">softcard.cc/</span>
          <input
            className="ux-input"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.replace(/[^a-z0-9_]/gi, ""))
            }
          />
        </div>

        {username.length > 0 && (
          <p
            className={`ux-status ${
              isTaken || isReserved ? "ux-error" : "ux-success"
            }`}
          >
            {isReserved
              ? "✖ This username is reserved"
              : isTaken
              ? "✖ This link is already taken"
              : "✔ Link available!"}
          </p>
        )}

        <button
          className="ux-btn"
          disabled={loading || isTaken || isReserved || username.length < 3}
          onClick={handleSave}
        >
          {loading ? "Saving..." : "Create My Page"}
        </button>
      </div>
    </div>
  </main>
  );
}
