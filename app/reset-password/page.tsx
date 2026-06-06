"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  useEffect(() => {
    async function checkSession() {
      if (!supabase) {
        setError("Auth is not configured.");
        setChecking(false);
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("This reset link is invalid or expired. Request a new one from the login page.");
          setChecking(false);
          return;
        }
        window.history.replaceState({}, "", "/reset-password");
      } else if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setError("This reset link is invalid or expired. Request a new one from the login page.");
          setChecking(false);
          return;
        }
        window.history.replaceState({}, "", "/reset-password");
      }

      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(Boolean(session));
      setChecking(false);
    }

    checkSession();
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError("Auth is not configured.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setNotice("Password updated. Redirecting to login...");
    setTimeout(() => router.push("/login?auth=reset-complete"), 700);
  }

  return (
    <main className={`rp-main ${font.className}`}>
      <Link href="/" className="rp-logo">softcard.cc</Link>
      <section className="rp-card">
        <p className="rp-kicker">Account Recovery</p>
        <h1>Reset Password</h1>
        <p className="rp-sub">Enter a new password for your Softcard account.</p>

        {checking ? (
          <p className="rp-muted">Checking recovery session...</p>
        ) : !hasSession ? (
          <div className="rp-stack">
            <p className="rp-error">{error || "This reset link is invalid or expired. Request a new one from the login page."}</p>
            <Link className="rp-action" href="/login">Request a new reset link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="rp-error">{error}</p>}
            {notice && <p className="rp-notice">{notice}</p>}
            <input type="password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            <button disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
          </form>
        )}

        <Link className="rp-back" href="/login">Back to login</Link>
      </section>

      <style jsx>{`
        .rp-main {
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, rgba(169,112,255,0.22), transparent 30%), #05060a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .rp-logo {
          position: fixed;
          left: 24px;
          top: 20px;
          color: white;
          text-decoration: none;
          font-weight: 900;
        }
        .rp-card {
          width: min(430px, 100%);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          background: rgba(12,13,18,0.76);
          box-shadow: 0 30px 90px rgba(0,0,0,0.34);
          padding: 28px;
          backdrop-filter: blur(20px);
        }
        .rp-kicker {
          margin: 0 0 8px;
          color: rgba(255,255,255,0.52);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.05em;
        }
        .rp-sub,
        .rp-muted {
          color: rgba(255,255,255,0.62);
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }
        .rp-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }
        input {
          min-height: 48px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: white;
          padding: 0 14px;
          font: inherit;
          outline: none;
        }
        button {
          min-height: 48px;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #ffffff, #d8caff);
          color: #07080d;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .rp-error,
        .rp-notice {
          margin: 0;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
        }
        .rp-error {
          border: 1px solid rgba(255,95,134,0.32);
          background: rgba(255,95,134,0.09);
          color: rgba(255,221,229,0.94);
        }
        .rp-notice {
          border: 1px solid rgba(89,255,174,0.24);
          background: rgba(89,255,174,0.08);
          color: rgba(210,255,231,0.94);
        }
        .rp-back {
          display: inline-block;
          margin-top: 18px;
          color: rgba(255,255,255,0.68);
          font-size: 13px;
          font-weight: 800;
        }
        .rp-action {
          min-height: 44px;
          border-radius: 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: 900;
        }
      `}</style>
    </main>
  );
}
