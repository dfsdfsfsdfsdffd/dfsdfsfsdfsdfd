"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import { Space_Grotesk } from "next/font/google";
// Consistent branding with heart icon
import { Heart } from "lucide-react";

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

  // 🔄 AUTO-LOGIN: Stay logged in logic
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        // 1. Check username availability
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username)
          .maybeSingle();

        if (existingUser) {
          setError("That username is already taken.");
          setLoading(false);
          return;
        }

        // 2. Auth SignUp 
        // We rely on the SQL Trigger to create the profile row automatically
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { full_name: username },
            // Ensures the user stays logged in after confirmation if applicable
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        // 3. Redirect to setup immediately for new accounts
        if (authData.user) {
          router.push("/setup");
          return;
        }

      } else {
        // SIGN IN LOGIC
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        // 4. Check if they need setup or dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', signInData.user.id)
          .single();

        if (!profile?.display_name) {
          router.push("/setup");
        } else {
          router.push("/dashboard");
        }
      }

      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`lx-main ${font.className}`}>
      <nav className="lx-nav">
        <Link href="/" className="lx-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={18} fill="#7000ff" color="#7000ff" />
          softcard.cc
        </Link>
      </nav>

      <section className="lx-wrap">
        <h1 className="lx-title">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h1>

        <p className="lx-sub">
          {mode === "signin" ? "Login to your dashboard" : "Start your Softcard page"}
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
              // Prevent spaces and force lowercase for clean URLs
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
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
            <>Don’t have an account? <button onClick={() => setMode("signup")}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode("signin")}>Sign in</button></>
          )}
        </div>
      </section>
    </main>
  );
}
