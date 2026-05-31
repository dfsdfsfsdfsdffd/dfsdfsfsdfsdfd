"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowUpRight, Code, Eye, ShieldCheck, Star, Volume2, VolumeX } from "lucide-react";

const iconMap: Record<string, string> = {
  discord: "https://cdn.simpleicons.org/discord/ffffff",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
  tiktok: "https://cdn.simpleicons.org/tiktok/ffffff",
  x: "https://cdn.simpleicons.org/x/ffffff",
  youtube: "https://cdn.simpleicons.org/youtube/ffffff",
  twitch: "https://cdn.simpleicons.org/twitch/ffffff",
  spotify: "https://cdn.simpleicons.org/spotify/ffffff",
  github: "https://cdn.simpleicons.org/github/ffffff",
  threads: "https://cdn.simpleicons.org/threads/ffffff",
  linkedin: "https://cdn.simpleicons.org/linkedin/ffffff",
  website: "https://cdn.simpleicons.org/pwa/ffffff",
};

const badgeInfo = {
  user: { label: "Verified User", description: "This profile belongs to a verified Softcard user." },
  dev: { label: "Developer", description: "This user is marked as a Softcard developer." },
  staff: { label: "Staff", description: "This user is marked as Softcard staff." },
};

const SAFE_FONTS = new Set(["Inter", "Playfair Display", "JetBrains Mono", "Outfit"]);
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

function safeColor(value: unknown, fallback: string) {
  return typeof value === "string" && HEX_COLOR.test(value) ? value : fallback;
}

function safeFont(value: unknown) {
  return typeof value === "string" && SAFE_FONTS.has(value) ? value : "Inter";
}

function safeGradient(value: unknown) {
  if (typeof value !== "string") return "linear-gradient(135deg, #111827 0%, #020617 100%)";
  const colors = value.match(/#(?:[0-9a-fA-F]{3}){1,2}/g);
  if (!colors?.[0] || !colors?.[1]) return "linear-gradient(135deg, #111827 0%, #020617 100%)";
  return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
}

function safeMediaUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function safeExternalUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function getIcon(link: any) {
  return iconMap[link?.type] || iconMap.website;
}

export default function PublicProfile({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) return;
      const { data } = await supabase.from("profiles").select("*").eq("username", params.username).single();
      if (data) {
        setProfile(data);
        await supabase.rpc("increment_profile_views", { target_id: data.id });
      }
    }
    loadProfile();
  }, [params.username, supabase]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  function handleEnter() {
    setHasEntered(true);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().catch(() => {});
    }
    videoRef.current?.play().catch(() => {});
  }

  if (!profile) return null;

  const socials = profile.links?.filter((link: any) => link.enabled !== false && safeExternalUrl(link.url)) || [];
  const featuredLinks = socials.filter((link: any) => link.featured && link.label).slice(0, 5);
  const iconLinks = socials.filter((link: any) => !link.featured);
  const accent = safeColor(profile.accent_color, "#a970ff");
  const nameColor = safeColor(profile.name_color, "#ffffff");
  const bioColor = safeColor(profile.bio_color, "#d1d5db");
  const fontFamily = safeFont(profile.font_family);
  const background = safeGradient(profile.background_value);
  const bgUrl =
    (profile.background_type === "image" || profile.background_type === "video") && profile.background_value
      ? safeMediaUrl(profile.background_value)
      : "";
  const avatarUrl = safeMediaUrl(profile.avatar_url) || "https://i.imgur.com/1X6g1YH.jpeg";
  const audioUrl = safeMediaUrl(profile.audio_url);
  const needsEnter = Boolean(audioUrl || (profile.background_type === "video" && bgUrl));

  return (
    <main className="pf-screen">
      <style jsx>{`
        .pf-screen {
          min-height: 100vh;
          width: 100vw;
          color: white;
          font-family: ${fontFamily}, Inter, sans-serif;
          background: ${profile.background_type === "gradient" ? background : "#03050a"};
          display: grid;
          place-items: center;
          overflow: hidden;
          position: relative;
          padding: 22px;
        }
        .pf-screen::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 18%, ${accent}2b, transparent 34%),
            linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.34));
          pointer-events: none;
          z-index: 2;
        }
        .pf-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
        }
        .pf-bg :global(img),
        .pf-bg :global(video) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(0.85) brightness(0.62);
        }
        .pf-card {
          width: min(390px, calc(100vw - 32px));
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          padding: 24px 20px;
          border-radius: 24px;
          background: ${profile.show_glass_card ? "rgba(5, 7, 12, 0.62)" : "rgba(5, 7, 12, 0.22)"};
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
          backdrop-filter: ${profile.show_glass_card ? "blur(22px)" : "none"};
        }
        .pf-views {
          position: absolute;
          right: 18px;
          top: 17px;
          display: inline-flex;
          gap: 6px;
          align-items: center;
          font-size: 12px;
          font-weight: 800;
          color: rgba(255,255,255,0.8);
        }
        .pf-avatar {
          width: 102px;
          height: 102px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid ${accent};
          box-shadow: 0 0 36px ${accent}55;
          padding: 3px;
          background: rgba(255,255,255,0.08);
        }
        .pf-name {
          margin: 2px 0 0;
          color: ${nameColor};
          font-size: 30px;
          line-height: 1;
          font-weight: 900;
          max-width: 100%;
          word-break: break-word;
        }
        .pf-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .pf-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .pf-badge::after {
          content: attr(data-tip);
          position: absolute;
          left: 50%;
          bottom: calc(100% + 10px);
          transform: translateX(-50%) translateY(4px);
          width: max-content;
          max-width: 210px;
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(0,0,0,0.9);
          border: 1px solid rgba(255,255,255,0.16);
          color: white;
          font-size: 11px;
          line-height: 1.35;
          opacity: 0;
          pointer-events: none;
          transition: 0.16s ease;
          z-index: 10;
        }
        .pf-badge:hover::after {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .pf-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          width: 100%;
        }
        .pf-tags span {
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.065);
          border: 1px solid rgba(255,255,255,0.075);
          color: rgba(255,255,255,0.68);
          font-size: 11px;
          font-weight: 700;
        }
        .pf-bio {
          max-width: 310px;
          margin: 0;
          color: ${bioColor};
          font-size: 14px;
          line-height: 1.45;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .pf-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 13px;
          margin-top: 2px;
        }
        .pf-icons a {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.08);
          transition: 0.18s ease;
        }
        .pf-icons a:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.12);
        }
        .pf-icons img {
          width: 18px;
          height: 18px;
        }
        .pf-featured {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 4px;
        }
        .pf-featured a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 54px;
          padding: 11px 13px;
          border-radius: 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          text-decoration: none;
          transition: 0.18s ease;
        }
        .pf-featured a:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.13);
        }
        .pf-link-text {
          min-width: 0;
          text-align: left;
          display: grid;
          gap: 2px;
        }
        .pf-link-text strong,
        .pf-link-text small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pf-link-text small {
          color: rgba(255,255,255,0.56);
          font-size: 11px;
        }
        .pf-audio {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 6;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 999px;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
        }
        .pf-audio button {
          border: 0;
          background: transparent;
          color: white;
          cursor: pointer;
          display: inline-flex;
        }
        .pf-audio input {
          width: 88px;
          accent-color: ${accent};
        }
        .pf-enter {
          position: fixed;
          inset: 0;
          z-index: 20;
          display: ${needsEnter && !hasEntered ? "grid" : "none"};
          place-items: center;
          background: rgba(0,0,0,0.94);
          color: rgba(255,255,255,0.74);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.3em;
          cursor: pointer;
        }
        @media (max-width: 520px) {
          .pf-screen { padding: 16px; }
          .pf-card { padding: 22px 16px; border-radius: 20px; }
          .pf-audio { right: 14px; bottom: 14px; }
        }
      `}</style>

      <button className="pf-enter" onClick={handleEnter}>
        CLICK TO ENTER
      </button>

      <div className="pf-bg">
        {profile.background_type === "video" && bgUrl ? (
          <video key={bgUrl} ref={videoRef} src={bgUrl} loop muted playsInline />
        ) : profile.background_type === "image" && bgUrl ? (
          <img key={bgUrl} src={bgUrl} alt="" />
        ) : null}
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}

      {audioUrl && hasEntered && (
        <div className="pf-audio">
          <button onClick={() => setIsMuted((value) => !value)} aria-label="Toggle audio">
            {isMuted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => {
              setVolume(Number(event.target.value));
              if (isMuted) setIsMuted(false);
            }}
          />
        </div>
      )}

      <section className="pf-card">
        <div className="pf-views">
          <Eye size={14} />
          {Number((profile.views || 0) + 1).toLocaleString()}
        </div>

        <img src={avatarUrl} className="pf-avatar" alt="profile" />
        <h1 className="pf-name">{profile.display_name || profile.username}</h1>

        {(profile.badges?.user || profile.badges?.dev || profile.badges?.staff) && (
          <div className="pf-badges">
            {profile.badges?.user && (
              <span className="pf-badge" data-tip={badgeInfo.user.description} aria-label={badgeInfo.user.label}>
                <ShieldCheck size={15} color="#55a7ff" />
              </span>
            )}
            {profile.badges?.dev && (
              <span className="pf-badge" data-tip={badgeInfo.dev.description} aria-label={badgeInfo.dev.label}>
                <Code size={15} color={accent} />
              </span>
            )}
            {profile.badges?.staff && (
              <span className="pf-badge" data-tip={badgeInfo.staff.description} aria-label={badgeInfo.staff.label}>
                <Star size={15} color="#f7b731" />
              </span>
            )}
          </div>
        )}

        <div className="pf-tags">
          {profile.age && <span>{profile.age} y/o</span>}
          {profile.gender && <span>{profile.gender}</span>}
          {profile.sexuality && <span>{profile.sexuality}</span>}
          {profile.birthday && (
            <span>{new Date(profile.birthday).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}</span>
          )}
          {profile.timezone && <span>{profile.timezone.split("/").pop()?.replace(/_/g, " ")}</span>}
        </div>

        <p className="pf-bio">{profile.bio || "No bio yet."}</p>

        <div className="pf-icons">
          {iconLinks.map((link: any) => (
            <a key={link.id} href={safeExternalUrl(link.url)} target="_blank" rel="noopener noreferrer" aria-label={link.type || "link"}>
              <img src={getIcon(link)} alt="" />
            </a>
          ))}
        </div>

        <div className="pf-featured">
          {featuredLinks.map((link: any) => (
            <a
              key={`featured-${link.id}`}
              href={safeExternalUrl(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderColor: safeColor(link.color, accent) }}
            >
              <span className="pf-link-text">
                <strong>{String(link.label).slice(0, 40)}</strong>
                {link.description && <small>{String(link.description).slice(0, 80)}</small>}
              </span>
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
