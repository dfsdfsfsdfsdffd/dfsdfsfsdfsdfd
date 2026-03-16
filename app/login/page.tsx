"use client";

import { useState } from "react"; // For tracking input
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // The Supabase tool
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient(); // Initialize Supabase

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // This is the part that checks Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message); // If password is wrong or user doesn't exist
    } else {
      router.push("/dashboard"); // If it works, go to the "hi" page
    }
  };

  return (
    <main className={`loginPage ${font.className}`}>
      <nav className="nav">
        <Link href="/" className="logo">♡ softcard.cc</Link>
      </nav>

      <div className="loginCard">
        <h1>Login</h1>
        <p className="subtitle">Access your Softcard dashboard</p>

        <button className="discordBtn" type="button">
          Login with Discord
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form className="loginForm" onSubmit={handleLogin}>
          {error && <p style={{ color: '#ff5cad', fontSize: '12px' }}>{error}</p>}
          
          <input 
            type="email" 
            placeholder="Email" 
            required 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button type="submit" className="loginBtn">
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
