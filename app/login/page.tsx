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

  // Prevents the "Unsupported Server Component type" error during Vercel build
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Auth Logic
    const { data, error: authError } = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: username } } 
        });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!data.user) return;

    // 2. Redirect Check: Does this user have a claimed link?
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', data.user.id)
      .single();

    if (!profile?.username) {
      router.push("/setup"); // Go claim softcard.cc/username
    } else {
      router.push("/dashboard"); // Go to editor
    }
    
    setLoading(false);
  };

  return (
    <main className={`loginPage ${font.className}`}>
      <nav className="nav">
        <Link href="/" className="logo">♡ softcard.cc</Link>
      </nav>

      <div className="loginCard">
        <h1>{mode === "signin" ? "Sign In" : "Create Account"}</h1>

        <p className="subtitle">
          {mode === "signin"
            ? "Login to your Softcard dashboard"
            : "Create your Softcard profile"}
        </p>

        <button className="discordBtn" type="button">
          Continue with Discord
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form className="loginForm" onSubmit={handleSubmit}>
          {error && <p style={{ color: '#ff5cad', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
          
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="loginBtn" disabled={loading}>
            {loading ? "Processing..." : (mode === "signin" ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="switchMode">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button type="button" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("signin")}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
