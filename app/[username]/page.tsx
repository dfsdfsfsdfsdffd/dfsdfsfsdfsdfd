"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { User, Code } from "lucide-react"

const iconMap: any = {
  tiktok: "https://cdn.simpleicons.org/tiktok/ffffff",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
  x: "https://cdn.simpleicons.org/x/ffffff",
  youtube: "https://cdn.simpleicons.org/youtube/ffffff",
  twitch: "https://cdn.simpleicons.org/twitch/ffffff",
  discord: "https://cdn.simpleicons.org/discord/ffffff",
  github: "https://cdn.simpleicons.org/github/ffffff",
  spotify: "https://cdn.simpleicons.org/spotify/ffffff"
}

function getIcon(url: string) {
  const lower = url.toLowerCase()
  const found = Object.keys(iconMap).find(key => lower.includes(key))
  return found ? iconMap[found] : "https://cdn.simpleicons.org/pwa/ffffff"
}

export default function PublicProfile({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [entered, setEntered] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", params.username)
        .single()

      setProfile(data)
    }

    loadProfile()
  }, [params.username])

  const enterSite = () => {
    setEntered(true)
    if (audioRef.current) audioRef.current.play().catch(() => {})
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }

  if (!profile) return null

  const socials =
    profile.links?.filter(
      (l: any) => !l.url.includes("title") && (!l.title || l.title === "New Link")
    ) || []

  return (
    <div className="sc-root">
      <style jsx>{`
        .sc-root {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: ${profile.font_family || "Inter"}, sans-serif;
          color: ${profile.name_color || "#fff"};
          background: #000;
        }

        /* ENTER SCREEN */
        .sc-enter {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 50;
          display: ${entered ? "none" : "flex"};
          align-items: center;
          justify-content: center;
          cursor: pointer;
          letter-spacing: 2px;
        }

        /* BACKGROUND */
        .sc-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
        }

        .sc-bg-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* fallback animated blobs */
        .sc-blob {
          position: absolute;
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, ${profile.accent_color || "red"} 0%, transparent 60%);
          filter: blur(120px);
          opacity: 0.5;
          animation: scFloat 12s infinite ease-in-out;
        }

        .sc-blob-a { top: -200px; left: -200px; }
        .sc-blob-b { bottom: -200px; right: -200px; animation-delay: 4s; }

        @keyframes scFloat {
          0% { transform: scale(1) }
          50% { transform: scale(1.2) translate(50px, -50px) }
          100% { transform: scale(1) }
        }

        /* CARD */
        .sc-card {
          position: relative;
          z-index: 5;
          text-align: center;
          padding: 20px;
          border-radius: 20px;
          max-width: 260px;

          background: ${profile.show_glass_card ? "rgba(0,0,0,0.3)" : "transparent"};
          backdrop-filter: ${profile.show_glass_card ? "blur(20px)" : "none"};
          border: ${profile.show_glass_card ? "1px solid rgba(255,255,255,0.08)" : "none"};
        }

        /* BADGES */
        .sc-badges {
          position: absolute;
          top: -10px;
          right: -10px;
          display: flex;
          gap: 6px;
        }

        .sc-badge {
          opacity: 0.7;
          transition: 0.2s;
        }

        .sc-badge:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        /* AVATAR */
        .sc-avatar {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: ${profile.avatar_shape === "circle" ? "50%" : "16px"};
          box-shadow: ${profile.accent_glow ? `0 0 25px ${profile.accent_color}` : "none"};
        }

        /* NAME */
        .sc-name {
          font-size: 20px;
          font-weight: 600;
          margin-top: 6px;
          color: ${profile.name_color || "#fff"};
        }

        /* BIO */
        .sc-bio {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 4px;
          color: ${profile.bio_color || "rgba(255,255,255,0.7)"};
        }

        /* SOCIALS */
        .sc-socials {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
        }

        .sc-social img {
          width: 16px;
          height: 16px;
          opacity: 0.8;
          transition: 0.2s;
        }

        .sc-social:hover img {
          opacity: 1;
          transform: scale(1.1);
        }
      `}</style>

      {!entered && (
        <div className="sc-enter" onClick={enterSite}>
          CLICK TO ENTER
        </div>
      )}

      {/* BACKGROUND SYSTEM */}
      <div className="sc-bg">
        {profile.background_type === "video" && (
          <video ref={videoRef} src={profile.background_value} className="sc-bg-media" loop muted playsInline />
        )}

        {profile.background_type === "image" && (
          <img src={profile.background_value} className="sc-bg-media" />
        )}

        {profile.background_type === "gradient" && (
          <div className="sc-bg-media" style={{ background: profile.background_value }} />
        )}

        {/* fallback blobs */}
        {!profile.background_type && (
          <>
            <div className="sc-blob sc-blob-a"></div>
            <div className="sc-blob sc-blob-b"></div>
          </>
        )}
      </div>

      {profile.audio_url && <audio ref={audioRef} src={profile.audio_url} loop />}

      <div className="sc-card">
        {(profile.badges?.user || profile.badges?.dev) && (
          <div className="sc-badges">
            {profile.badges?.user && <User size={14} className="sc-badge" />}
            {profile.badges?.dev && (
              <Code size={14} className="sc-badge" style={{ color: profile.accent_color }} />
            )}
          </div>
        )}

        <img src={profile.avatar_url} className="sc-avatar" />

        <div className="sc-name">{profile.display_name}</div>
        <div className="sc-bio">{profile.bio}</div>

        <div className="sc-socials">
          {socials.map((l: any) => (
            <a
              key={l.id}
              href={l.url.startsWith("http") ? l.url : `https://${l.url}`}
              target="_blank"
              className="sc-social"
            >
              <img src={getIcon(l.url)} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
