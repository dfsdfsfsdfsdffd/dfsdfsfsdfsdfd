"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"; // Added for navigation
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400","500","600","700"]
});

export default function Login() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // This sends them to the new dashboard route
    router.push("/dashboard");
  };

  return (
    <main className={`loginPage ${font.className}`}>
      <nav className="nav">
        <Link href="/" className="logo">♡ softcard.cc</Link>
      </nav>

      <div className="loginCard">
        <h1>Login</h1>
        <p className="subtitle">Access your Softcard dashboard</p>

        <button className="discordBtn" onClick={() => router.push("/dashboard")}>
          Login with Discord
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form className="loginForm" onSubmit={handleLogin}>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="loginBtn">
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}