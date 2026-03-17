"use client";

import { useState, useMemo } from "react";
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
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        // 🔍 Check username first (faster UX)
        const { data: existingUsername } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username)
          .maybeSingle();

        if (existingUsername) {
          setError("That username is already taken.");
          setLoading(false);
          return;
        }
      }

      // 🔐 AUTH
      const { data, error: authError } = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: username } }
          });

      if (authError) {
        // 🔥 Handle duplicate email cleanly
        if (authError.message.toLowerCase().includes("already")) {
          setError("An account with this email already exists.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setLoading(false);
        return;
      }

      // 📦 CREATE PROFILE (protected by SQL constraints too)
      if (mode === "signup") {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            username: username,
            email: email
          });

        // 🔥 This catches DB-level duplicate errors
        if (insertError) {
          if (insertError.message.toLowerCase().includes("username")) {
            setError("That username is already taken.");
          } else if (insertError.message.toLowerCase().includes("email")) {
            setError("An account with this email already exists.");
          } else {
            setError("Something went wrong. Try again.");
          }
          setLoading(false);
          return;
        }
      }

      // 🔁 REDIRECT LOGIC
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single();

      if (!profile?.username) {
        router.push("/setup");
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      setError("Unexpected error. Try again.");
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
            ? "Login to your dashboard"
            : "Start your Softcard page"}
        </p>

        <form className="lx-form" onSubmit={handleSubmit}>
          {error && <p className="lx-error">{error}</p>}

          {mode === "signup" && (
            <input
              className="lx-input"
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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

          <button className="lx-primary" disabled={loading}>
            {loading ? "Processing..." : (mode === "signin" ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="lx-switch">
          {mode === "signin" ? (
            <>
              Don’t have an account?{" "}
              <button onClick={() => setMode("signup")}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("signin")}>Sign in</button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
