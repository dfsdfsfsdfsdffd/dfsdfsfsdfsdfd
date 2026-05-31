"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

const font = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const RESERVED_USERNAMES = ["setup", "dashboard", "admin", "login", "api", "settings", "hub", "edit", "www"];

export default function Setup() {
  const [username, setUsername] = useState("");
  const [isTaken, setIsTaken] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  useEffect(() => {
    async function checkUsername() {
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
      }

      setIsReserved(false);
      const { data } = await supabase.from("profiles").select("username").eq("username", lowerUsername).maybeSingle();
      setIsTaken(Boolean(data));
    }

    const timeoutId = setTimeout(checkUsername, 450);
    return () => clearTimeout(timeoutId);
  }, [supabase, username]);

  async function handleSave() {
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured.");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You need to sign in first.");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username: username.toLowerCase(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "Unable to save username.");
    } finally {
      setLoading(false);
    }
  }

  const canSave = username.length >= 3 && !isTaken && !isReserved && !loading;

  return (
    <main className={`sf-setup ${font.className}`}>
      <section className="sf-setup-card">
        <p className="sf-kicker">Claim your link</p>
        <h1>Choose your Softcard URL.</h1>
        <p>This username becomes the public link people visit.</p>

        <label className="sf-field">
          <span>
            Username
            <small>This will be your softcard.cc/ link</small>
          </span>
          <div className="sf-url-field">
            <b>softcard.cc/</b>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            />
          </div>
        </label>

        {username.length > 0 && (
          <div className={`sf-setup-status ${isTaken || isReserved ? "bad" : "good"}`}>
            {isTaken || isReserved ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {isReserved ? "This username is reserved." : isTaken ? "This link is already taken." : "Link available."}
          </div>
        )}

        <button className="sf-submit" disabled={!canSave} onClick={handleSave}>
          {loading ? "Saving..." : "Create my page"}
          <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}
