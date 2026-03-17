"use client";

import { useState, useEffect } from "react";
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
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUsername = async () => {
      const lowerUsername = username.toLowerCase();
      
      if (lowerUsername.length < 3) {
        setIsReserved(false);
        setIsTaken(false);
        return;
      }

      // 3. Check if it's in the reserved list first
      if (RESERVED_USERNAMES.includes(lowerUsername)) {
        setIsReserved(true);
        setIsTaken(false);
        return;
      } else {
        setIsReserved(false);
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', lowerUsername)
        .single();

      setIsTaken(!!data);
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user?.id, 
        username: username.toLowerCase(),
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
