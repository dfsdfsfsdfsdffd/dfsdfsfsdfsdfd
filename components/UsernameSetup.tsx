"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type UsernameSetupProps = {
  onComplete: () => void;
  userId: string;
};

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;

export default function UsernameSetup({ onComplete, userId }: UsernameSetupProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function claimUsername() {
    setLoading(true);
    setError("");

    if (!userId) {
      setError("User missing. Please sign in again.");
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const cleanedUsername = username.trim().toLowerCase().replace(/\s+/g, "");

    if (!USERNAME_REGEX.test(cleanedUsername)) {
      setError("Username must be 3-30 characters and may only include letters, numbers, underscores, or hyphens.");
      setLoading(false);
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", cleanedUsername)
      .maybeSingle();

    if (existingError) {
      setError("Unable to check username availability.");
      setLoading(false);
      return;
    }

    if (existing) {
      setError("That username is already taken! ♡");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: cleanedUsername,
        setup_completed: true,
      })
      .eq("id", userId);

    if (updateError) {
      setError("Unable to claim that username. Please try something else.");
      setLoading(false);
      return;
    }

    onComplete();
    setLoading(false);
  }

  return (
    <div className="setup-overlay" style={{
      position: "fixed", inset: 0, background: "#020617",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div style={{ width: "100%", maxWidth: "400px", textAlign: "center", padding: "20px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Claim your URL</h1>
        <p style={{ opacity: 0.6, marginBottom: "30px" }}>This cannot be changed later.</p>

        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "15px", top: "12px", opacity: 0.5 }}>softcard.cc/</span>
          <input
            style={{
              width: "100%", padding: "12px 12px 12px 105px", borderRadius: "10px",
              background: "#0b1726", border: "1px solid rgba(255,255,255,0.1)", color: "white",
            }}
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
          />
        </div>

        {error && <p style={{ color: "#ff4f4f", marginTop: "10px", fontSize: "14px" }}>{error}</p>}

        <button
          onClick={claimUsername}
          disabled={loading || username.length < 3}
          style={{
            marginTop: "20px", width: "100%", padding: "12px", borderRadius: "10px",
            background: "#3b82f6", color: "white", border: "none", cursor: "pointer",
            opacity: (loading || username.length < 3) ? 0.5 : 1,
          }}
        >
          {loading ? "Checking..." : "Claim Username →"}
        </button>
      </div>
    </div>
  );
}
