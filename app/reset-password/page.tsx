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
      <div className="rp-orb rp-orb-one" />
      <div className="rp-orb rp-orb-two" />
      <Link href="/" className="rp-logo">softcard.cc</Link>
      <section className="rp-card">
        <div className="rp-icon" aria-hidden="true">SC</div>
        <p className="rp-kicker">Account Recovery</p>
        <h1>Reset Password</h1>
        <p className="rp-sub">Create a new password and get back into your Softcard dashboard.</p>

        {checking ? (
          <div className="rp-loading">
            <span />
            <p>Checking recovery session...</p>
          </div>
        ) : !hasSession ? (
          <div className="rp-stack">
            <p className="rp-error">{error || "This reset link is invalid or expired. Request a new one from the login page."}</p>
            <Link className="rp-action" href="/login">Request a new reset link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="rp-error">{error}</p>}
            {notice && <p className="rp-notice">{notice}</p>}
            <label>
              <span>New password</span>
              <input type="password" placeholder="At least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <label>
              <span>Confirm password</span>
              <input type="password" placeholder="Repeat your new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </label>
            <div className="rp-rules">
              <span className={password.length >= 6 ? "is-ok" : ""}>6+ characters</span>
              <span className={password && password === confirmPassword ? "is-ok" : ""}>Passwords match</span>
            </div>
            <button disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
          </form>
        )}

        <Link className="rp-back" href="/login">Back to login</Link>
      </section>

      <style jsx>{`
        .rp-main {
          min-height: 100vh;
          background:
            radial-gradient(circle at 18% 12%, rgba(95, 206, 255, 0.18), transparent 26%),
            radial-gradient(circle at 82% 18%, rgba(255, 180, 95, 0.16), transparent 28%),
            linear-gradient(135deg, #10100d 0%, #070807 48%, #11130d 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
          position: relative;
          isolation: isolate;
        }
        .rp-main::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: radial-gradient(circle at center, black, transparent 72%);
          pointer-events: none;
          z-index: -2;
        }
        .rp-orb {
          position: fixed;
          border-radius: 999px;
          filter: blur(12px);
          opacity: 0.62;
          pointer-events: none;
          z-index: -1;
        }
        .rp-orb-one {
          width: 220px;
          height: 220px;
          left: -60px;
          bottom: 12%;
          background: rgba(105, 226, 177, 0.18);
        }
        .rp-orb-two {
          width: 280px;
          height: 280px;
          right: -80px;
          top: 18%;
          background: rgba(255, 210, 120, 0.16);
        }
        .rp-logo {
          position: fixed;
          left: 24px;
          top: 20px;
          color: white;
          text-decoration: none;
          font-weight: 900;
          letter-spacing: -0.04em;
          opacity: 0.84;
        }
        .rp-card {
          width: min(460px, 100%);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 30px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.055)),
            rgba(13,14,12,0.8);
          box-shadow: 0 34px 110px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.12);
          padding: 34px;
          backdrop-filter: blur(24px);
          animation: rp-enter 0.55s ease both;
        }
        .rp-icon {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          background: linear-gradient(135deg, #fff7d6, #a7ffd8);
          color: #080907;
          font-size: 14px;
          font-weight: 1000;
          letter-spacing: -0.04em;
          box-shadow: 0 16px 36px rgba(167,255,216,0.16);
        }
        .rp-kicker {
          margin: 0 0 8px;
          color: rgba(209,255,227,0.62);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        h1 {
          margin: 0;
          font-size: clamp(36px, 8vw, 52px);
          letter-spacing: -0.05em;
          line-height: 0.92;
        }
        .rp-sub,
        .rp-muted {
          color: rgba(255,255,255,0.62);
          line-height: 1.55;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 22px;
        }
        .rp-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }
        input {
          width: 100%;
          min-height: 52px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.075);
          color: white;
          padding: 0 15px;
          font: inherit;
          outline: none;
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }
        input:focus {
          border-color: rgba(167,255,216,0.55);
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 4px rgba(167,255,216,0.08);
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        label span {
          color: rgba(255,255,255,0.72);
          font-size: 12px;
          font-weight: 900;
        }
        button {
          min-height: 52px;
          border: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, #ffffff, #e8ffd5 42%, #a7ffd8);
          color: #07080d;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 18px 36px rgba(167,255,216,0.14);
          transition: transform 0.18s ease, filter 0.18s ease;
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.04);
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
          line-height: 1.45;
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
          text-decoration: none;
        }
        .rp-back:hover {
          color: white;
          text-decoration: underline;
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
        .rp-rules {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: -2px;
        }
        .rp-rules span {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          background: rgba(255,255,255,0.055);
          color: rgba(255,255,255,0.52);
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 900;
        }
        .rp-rules span.is-ok {
          color: rgba(210,255,231,0.95);
          border-color: rgba(89,255,174,0.28);
          background: rgba(89,255,174,0.08);
        }
        .rp-loading {
          margin-top: 22px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.62);
          font-weight: 800;
        }
        .rp-loading span {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.18);
          border-top-color: #a7ffd8;
          animation: rp-spin 0.8s linear infinite;
        }
        @keyframes rp-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes rp-enter {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 560px) {
          .rp-main {
            align-items: flex-start;
            padding: 86px 16px 24px;
          }
          .rp-logo {
            left: 18px;
          }
          .rp-card {
            padding: 26px 20px;
            border-radius: 24px;
          }
        }
      `}</style>
    </main>
  );
}
