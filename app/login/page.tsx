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
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // 🔄 AUTO-LOGIN LOGIC
  // If they are already logged in, send them to dashboard immediately
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
        // 1. Check username availability FIRST
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
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: username } }
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (authData?.user) {
          // 3. Create Profile (The "Fixed" way)
          // We use upsert or a cleaner insert to ensure the profile exists
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([{ 
              id: authData.user.id, 
              username: username, 
              email: email,
              views: 0 // Initialize views
            }]);

          if (profileError) {
            // If profile creation fails, we actually have a problem. 
            // Most likely a RLS policy issue or the user already exists in Auth.
            setError("Account created, but profile setup failed. Please try signing in.");
            setLoading(false);
            return;
          }
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

        <form className="lx-form" onSubmit={handleSubmit}>
          {error && <p className="lx-error">{error}</p>}

          {mode === "signup" && (
            <input
              className="lx-input"
              type="text"
              placeholder="Username"
              required
              value={username}
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
