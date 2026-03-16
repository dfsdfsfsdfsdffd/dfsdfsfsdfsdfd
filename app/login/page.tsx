"use client";

import { useState, useMemo } from "react"; // Added useMemo
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({ subsets: ["latin"], weight: ["400", "700"] });

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // FIX: Wrap in useMemo to prevent Vercel "Unsupported Server Component" error
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Authenticate the user
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

    // 2. Check if they have a profile/username already
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', data.user.id)
      .single();

    // 3. Redirect based on existence of profile
    if (!profile?.username) {
      router.push("/setup");
    } else {
      router.push("/dashboard");
    }
    
    setLoading(false);
  };

  return (
    <main className={`loginPage ${font.className}`}>
      {/* ... keep your existing return/JSX code here ... */}
      <form onSubmit={handleSubmit}>
         {/* your inputs */}
         <button disabled={loading}>{loading ? "..." : mode}</button>
      </form>
    </main>
  );
}
