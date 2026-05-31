"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Space_Grotesk } from "next/font/google";
import { ArrowLeft, ArrowRight, Heart, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  useEffect(() => {
    async function checkUser() {
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push("/dashboard");
    }
    checkUser();
  }, [router, supabase]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Auth is not configured.");

      if (mode === "signup") {
        const cleanedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

        if (cleanedUsername.length < 3 || cleanedUsername.length > 30) {
          throw new Error("Username must be 3-30 characters.");
        }
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        if (password !== passwordConfirm) throw new Error("Passwords do not match.");

        const { data: existingUser, error: existingError } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", cleanedUsername)
          .maybeSingle();

        if (existingError) throw new Error("Unable to verify username availability.");
        if (existingUser) throw new Error("That username is already taken.");

        const signupResponse = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username: cleanedUsername }),
        });
        const signupResult = await signupResponse.json();

        if (!signupResponse.ok) throw new Error(signupResult.error || "Unable to create account.");

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`sf-auth ${font.className}`}>
      <nav className="sf-auth-nav">
        <Link href="/" className="sf-auth-back">
          <ArrowLeft size={16} />
          Home
        </Link>
        <Link href="/" className="sf-brand">
          <Heart size={18} fill="currentColor" />
          softcard.cc
        </Link>
      </nav>

      <section className="sf-auth-shell">
        <div className="sf-auth-copy">
          <p className="sf-kicker">
            <ShieldCheck size={14} />
            Protected dashboard
          </p>
          <h1>{mode === "signin" ? "Sign in and edit your page." : "Claim your softcard link."}</h1>
          <p>
            {mode === "signin"
              ? "Manage your profile, links, badges, background media, and public page from one dashboard."
              : "Your username becomes your public URL. Pick it carefully because people will visit it directly."}
          </p>
          <div className="sf-auth-points">
            <span><UserRound size={15} /> Custom profile editor</span>
            <span><LockKeyhole size={15} /> Safer server-side signup</span>
          </div>
        </div>

        <form className="sf-auth-card" onSubmit={handleSubmit}>
          <div className="sf-auth-tabs">
            <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>
              Sign in
            </button>
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
              Sign up
            </button>
          </div>

          {error && <div className="sf-form-error">{error}</div>}

          {mode === "signup" && (
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
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                />
              </div>
            </label>
          )}

          <label className="sf-field">
            <span>Email</span>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label className="sf-field">
            <span>Password</span>
            <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          {mode === "signup" && (
            <label className="sf-field">
              <span>Confirm password</span>
              <input type="password" required value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} />
            </label>
          )}

          <button className="sf-submit" disabled={loading}>
            {loading ? "Working..." : mode === "signin" ? "Open dashboard" : "Create account"}
            <ArrowRight size={17} />
          </button>
        </form>
      </section>
    </main>
  );
}
