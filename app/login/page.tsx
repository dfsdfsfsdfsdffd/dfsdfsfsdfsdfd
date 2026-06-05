"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  useEffect(() => {
    const authStatus = new URLSearchParams(window.location.search).get("auth");
    const authMessages: Record<string, string> = {
      "missing-code": "Discord login did not return an auth code.",
      "not-configured": "Discord login is not configured yet.",
      "callback-failed": "Discord login failed. Try again.",
      "no-user": "Discord login completed, but no user session was found.",
    };
    if (authStatus) {
      setError(authMessages[authStatus] || "Discord login failed. Try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }

    const checkUser = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleDiscordLogin = async () => {
    setDiscordLoading(true);
    setError(null);

    if (!supabase) {
      setError("Auth is not configured.");
      setDiscordLoading(false);
      return;
    }

    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
        scopes: "identify email",
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setDiscordLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        setError("Auth is not configured.");
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        const cleanedUsername = username.trim().toLowerCase().replace(/\s+/g, "");

        if (cleanedUsername.length < 3) {
          setError("Username must be at least 3 characters.");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        if (password !== passwordConfirm) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        // 1. Check username availability FIRST
        const { data: existingUser, error: existingError } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", cleanedUsername)
          .maybeSingle();

        if (existingError) {
          setError("Unable to verify username availability.");
          setLoading(false);
          return;
        }

        if (existingUser) {
          setError("That username is already taken.");
          setLoading(false);
          return;
        }

        const signupResponse = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            username: cleanedUsername,
          }),
        });

        const signupResult = await signupResponse.json();

        if (!signupResponse.ok) {
          setError(signupResult.error || "Unable to create account.");
          setLoading(false);
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }
      } else {
        // SIGN IN LOGIC
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }
      }

      // 4. Final Redirect
      router.push("/dashboard");
      router.refresh(); // Forces Next.js to re-check the session

    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`lx-main ${font.className}`}>
      <nav className="lx-nav">
        <Link href="/" className="lx-logo">softcard.cc</Link>
      </nav>

      <section className="lx-wrap">
        <h1 className="lx-title">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="lx-sub">
          {mode === "signin"
            ? "Sign in to edit and publish your Softcard."
            : "Pick your username, then sign in instantly after signup."}
        </p>

        <form className="lx-form" onSubmit={handleSubmit}>
          {error && <p className="lx-error">{error}</p>}

          {mode === "signup" && (
            <div className="lx-field">
              <div className="lx-field-top">
                <label htmlFor="signup-username">Username</label>
                <span>This will be your softcard.cc/ link</span>
              </div>
              <div className="lx-url-input">
                <span>softcard.cc/</span>
                <input
                  id="signup-username"
                  type="text"
                  placeholder="username"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                />
              </div>
              <p className="lx-help">Use 3-30 letters, numbers, underscores, or hyphens.</p>
            </div>
          )}

          <input
            className="lx-input"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="lx-input"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === "signup" && (
            <input
              className="lx-input"
              type="password"
              placeholder="Confirm password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          )}

          <button className="lx-primary" disabled={loading}>
            {loading ? "Processing..." : (mode === "signin" ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="lx-divider"><span>or</span></div>

        <button className="lx-discord" type="button" onClick={handleDiscordLogin} disabled={discordLoading || loading}>
          <img src="https://cdn.simpleicons.org/discord/ffffff" alt="" />
          {discordLoading ? "Opening Discord..." : mode === "signin" ? "Sign in with Discord" : "Sign up with Discord"}
        </button>

        <div className="lx-switch">
          {mode === "signin" ? (
            <>Don't have an account? <button onClick={() => setMode("signup")}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode("signin")}>Sign in</button></>
          )}
        </div>
      </section>
      <style jsx>{`
        .lx-divider {
          width: min(420px, calc(100vw - 40px));
          margin: 18px auto 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.42);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .lx-divider::before,
        .lx-divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: rgba(255,255,255,0.1);
        }
        .lx-discord {
          width: min(420px, calc(100vw - 40px));
          min-height: 48px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(88,101,242,0.92), rgba(129,140,248,0.72));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 16px 34px rgba(88,101,242,0.22);
          transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
        }
        .lx-discord:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.06);
          box-shadow: 0 20px 42px rgba(88,101,242,0.3);
        }
        .lx-discord:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .lx-discord img {
          width: 19px;
          height: 19px;
        }
      `}</style>
    </main>
  );
}
