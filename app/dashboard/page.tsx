"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Code,
  Copy,
  CopyPlus,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon,
  LogOut,
  Music,
  Palette,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

type LinkStyle = "glass" | "filled" | "outline" | "soft";
type Tab = "profile" | "links" | "style" | "media" | "stats";

type SocialLink = {
  id: number;
  type: string;
  url: string;
  label?: string;
  description?: string;
  color?: string;
  style?: LinkStyle;
  featured?: boolean;
  enabled?: boolean;
  clicks?: number;
};

type Badges = {
  user: boolean;
  dev: boolean;
  staff: boolean;
};

type ProfileData = {
  avatar: string;
  name: string;
  username: string;
  bio: string;
  age: string;
  gender: string;
  sexuality: string;
  birthday: string;
  timezone: string;
  accent: string;
  nameColor: string;
  bioColor: string;
  font: string;
  bgType: "gradient" | "image" | "video";
  gradient: string;
  bgVideo: string;
  bgImage: string;
  bgAudio: string;
  bgAudioName: string;
  showAudioPlayer: boolean;
  backgroundAudio: boolean;
  showGlass: boolean;
  views: number;
};

type ThemePreset = {
  name: string;
  accent: string;
  nameColor: string;
  bioColor: string;
  gradient: string;
};

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const RESERVED_USERNAMES = new Set([
  "setup",
  "dashboard",
  "admin",
  "login",
  "api",
  "settings",
  "hub",
  "edit",
  "support",
  "credits",
  "more",
]);

const iconMap: Record<string, string> = {
  tiktok: "https://cdn.simpleicons.org/tiktok/ffffff",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
  x: "https://cdn.simpleicons.org/x/ffffff",
  youtube: "https://cdn.simpleicons.org/youtube/ffffff",
  twitch: "https://cdn.simpleicons.org/twitch/ffffff",
  spotify: "https://cdn.simpleicons.org/spotify/ffffff",
  discord: "https://cdn.simpleicons.org/discord/ffffff",
  github: "https://cdn.simpleicons.org/github/ffffff",
  threads: "https://cdn.simpleicons.org/threads/ffffff",
  linkedin: "https://cdn.simpleicons.org/linkedin/ffffff",
  website:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M2 12h20'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E",
};

const badgeInfo = {
  user: { label: "Verified User", icon: ShieldCheck, color: "#54a9ff" },
  dev: { label: "Developer", icon: Code, color: "#72e0b1" },
  staff: { label: "Staff", icon: Star, color: "#f4c95d" },
};

const defaultProfile: ProfileData = {
  avatar: "https://i.imgur.com/1X6g1YH.jpeg",
  name: "User",
  username: "",
  bio: "",
  age: "",
  gender: "",
  sexuality: "",
  birthday: "",
  timezone: "",
  accent: "#72e0b1",
  nameColor: "#ffffff",
  bioColor: "#d8dee8",
  font: "Inter",
  bgType: "gradient",
  gradient: "linear-gradient(135deg, #101820 0%, #07090d 100%)",
  bgVideo: "",
  bgImage: "",
  bgAudio: "",
  bgAudioName: "",
  showAudioPlayer: true,
  backgroundAudio: true,
  showGlass: true,
  views: 0,
};

const baseThemes: ThemePreset[] = [
  { name: "Studio", accent: "#72e0b1", nameColor: "#ffffff", bioColor: "#d8dee8", gradient: "linear-gradient(135deg, #101820 0%, #07090d 100%)" },
  { name: "Signal", accent: "#66c7f4", nameColor: "#f7fdff", bioColor: "#ccefff", gradient: "linear-gradient(135deg, #082536 0%, #05090d 100%)" },
  { name: "Coral", accent: "#ff8b70", nameColor: "#fff5f1", bioColor: "#ffd7ca", gradient: "linear-gradient(135deg, #32120c 0%, #080504 100%)" },
  { name: "Ink", accent: "#ffffff", nameColor: "#ffffff", bioColor: "#b7bfcc", gradient: "linear-gradient(135deg, #1a1d25 0%, #050608 100%)" },
  { name: "Canopy", accent: "#96d65c", nameColor: "#f7fff2", bioColor: "#d8f2c5", gradient: "linear-gradient(135deg, #102818 0%, #050906 100%)" },
  { name: "Gold", accent: "#e8c766", nameColor: "#fff8df", bioColor: "#f1ddb0", gradient: "linear-gradient(135deg, #2b220c 0%, #070604 100%)" },
];

function safeExternalUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 90) || "softcard-media";
}

function uploadLimit() {
  return 50 * 1024 * 1024;
}

function formatMb(bytes: number) {
  return `${Math.floor(bytes / 1024 / 1024)}MB`;
}

function fileTitle(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 60);
}

function splitAudioMeta(value: string) {
  if (!value) return { url: "", title: "", showPlayer: true, backgroundAudio: true };
  try {
    const parsed = new URL(value);
    const params = new URLSearchParams(parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash);
    const oldTitle = parsed.hash.startsWith("#softcardTitle=")
      ? decodeURIComponent(parsed.hash.replace("#softcardTitle=", ""))
      : "";
    const title = params.get("title") || oldTitle;
    const showPlayer = params.get("player") !== "0";
    const backgroundAudio = params.get("bg") !== "0";
    parsed.hash = "";
    return { url: parsed.toString(), title, showPlayer, backgroundAudio };
  } catch {
    return { url: value, title: "", showPlayer: true, backgroundAudio: true };
  }
}

function audioUrlWithMeta(url: string, title: string, showPlayer: boolean, backgroundAudio: boolean) {
  if (!url.trim()) return "";
  try {
    const parsed = new URL(url.trim());
    const params = new URLSearchParams();
    const cleanTitle = title.trim().slice(0, 60);
    if (cleanTitle) params.set("title", cleanTitle);
    if (!showPlayer) params.set("player", "0");
    if (!backgroundAudio) params.set("bg", "0");
    parsed.hash = params.toString();
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

function normalizeLinks(items: SocialLink[]) {
  return items
    .map((link) => ({
      ...link,
      label: (link.label || "").trim().slice(0, 40),
      description: (link.description || "").trim().slice(0, 80),
      color: HEX_COLOR.test(link.color || "") ? link.color : "",
      style: ["glass", "filled", "outline", "soft"].includes(link.style || "") ? link.style : "glass",
      clicks: Number(link.clicks || 0),
      url: safeExternalUrl(link.url),
      enabled: link.enabled !== false,
      featured: Boolean(link.featured),
    }))
    .filter((link) => link.url);
}

export default function DashboardEditor() {
  const router = useRouter();
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  const [tab, setTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "reserved" | "invalid">("idle");
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [badges, setBadges] = useState<Badges>({ user: true, dev: false, staff: false });
  const [customThemes, setCustomThemes] = useState<ThemePreset[]>([]);

  const allThemes = [...baseThemes, ...customThemes];
  const totalClicks = links.reduce((sum, link) => sum + Number(link.clicks || 0), 0);
  const topLinks = [...links].sort((a, b) => Number(b.clicks || 0) - Number(a.clicks || 0)).slice(0, 5);
  const gradientColors = profile.gradient.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || ["#101820", "#07090d"];
  const publicUrl = `softcard.cc/${profile.username || "username"}`;

  useEffect(() => {
    async function loadData() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        const audioMeta = splitAudioMeta(data.audio_url || "");
        setProfile({
          ...defaultProfile,
          avatar: data.avatar_url || defaultProfile.avatar,
          name: data.display_name || defaultProfile.name,
          username: data.username || "",
          bio: data.bio || "",
          age: data.age || "",
          gender: data.gender || "",
          sexuality: data.sexuality || "",
          birthday: data.birthday || "",
          timezone: data.timezone || "",
          accent: data.accent_color || defaultProfile.accent,
          nameColor: data.name_color || defaultProfile.nameColor,
          bioColor: data.bio_color || defaultProfile.bioColor,
          font: data.font_family || defaultProfile.font,
          bgType: data.background_type || defaultProfile.bgType,
          gradient: data.background_type === "gradient" ? data.background_value || defaultProfile.gradient : defaultProfile.gradient,
          bgVideo: data.background_type === "video" ? data.background_value || "" : "",
          bgImage: data.background_type === "image" ? data.background_value || "" : "",
          bgAudio: audioMeta.url,
          bgAudioName: audioMeta.title,
          showAudioPlayer: audioMeta.showPlayer,
          backgroundAudio: audioMeta.backgroundAudio,
          showGlass: data.show_glass_card ?? true,
          views: data.views || 0,
        });
        setLinks(Array.isArray(data.links) ? data.links : []);
        setBadges(data.badges || { user: true, dev: false, staff: false });
        setOriginalUsername(data.username || "");
      }
      setLoading(false);
    }

    loadData();
  }, [router, supabase]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("softcard_custom_themes") || "[]");
      if (Array.isArray(saved)) setCustomThemes(saved.slice(0, 8));
    } catch {}
  }, []);

  useEffect(() => {
    async function checkUsername() {
      if (!supabase || !profile.username) {
        setUsernameStatus("idle");
        return;
      }

      const username = profile.username.trim().toLowerCase();
      if (username === originalUsername) {
        setUsernameStatus("idle");
        return;
      }
      if (!USERNAME_REGEX.test(username)) {
        setUsernameStatus("invalid");
        return;
      }
      if (RESERVED_USERNAMES.has(username)) {
        setUsernameStatus("reserved");
        return;
      }

      setUsernameStatus("checking");
      const { data } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
      setUsernameStatus(data && data.id !== currentUserId ? "taken" : "available");
    }

    const timeoutId = window.setTimeout(checkUsername, 450);
    return () => window.clearTimeout(timeoutId);
  }, [currentUserId, originalUsername, profile.username, supabase]);

  function updateProfile<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function updateGradient(c1: string, c2: string) {
    updateProfile("gradient", `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
  }

  function addLink() {
    setLinks((current) => [
      ...current,
      { id: Date.now(), type: "website", url: "", label: "", description: "", color: "", style: "glass", featured: false, enabled: true, clicks: 0 },
    ]);
  }

  function updateLink(index: number, patch: Partial<SocialLink>) {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  function removeLink(id: number) {
    setLinks((current) => current.filter((link) => link.id !== id));
  }

  function duplicateLink(index: number) {
    const link = links[index];
    if (!link) return;
    setLinks((current) => {
      const next = [...current];
      next.splice(index + 1, 0, { ...link, id: Date.now(), label: link.label ? `${link.label} copy` : "" });
      return next;
    });
  }

  async function uploadMedia(kind: "avatar" | "image" | "video" | "audio", file: File) {
    if (!supabase) throw new Error("Uploads are not configured.");
    if ((kind === "avatar" || kind === "image") && !file.type.startsWith("image/")) throw new Error("Use an image file.");
    if (kind === "video" && !file.type.startsWith("video/")) throw new Error("Use a video file.");
    if (kind === "audio" && !file.type.startsWith("audio/")) throw new Error("Use an audio file.");
    if (file.size > uploadLimit()) throw new Error(`File is too large. Use a file under ${formatMb(uploadLimit())}.`);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You need to be signed in to upload media.");

    const path = `${user.id}/${kind}/${Date.now()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw new Error(
        error.message.includes("Bucket not found")
          ? "Create a public Supabase Storage bucket named media first."
          : error.message.includes("row-level security")
          ? "Supabase Storage blocked this upload. Add the media bucket RLS policies first."
          : error.message
      );
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    const publicUrl = data.publicUrl;

    if (kind === "avatar") updateProfile("avatar", publicUrl);
    if (kind === "image") setProfile((current) => ({ ...current, bgType: "image", bgImage: publicUrl }));
    if (kind === "video") setProfile((current) => ({ ...current, bgType: "video", bgVideo: publicUrl }));
    if (kind === "audio") {
      setProfile((current) => ({
        ...current,
        bgAudio: publicUrl,
        bgAudioName: current.bgAudioName || fileTitle(file.name),
        showAudioPlayer: true,
        backgroundAudio: true,
      }));
    }
  }

  async function saveChanges() {
    if (!supabase) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found.");

      const username = profile.username.trim().toLowerCase();
      if (!USERNAME_REGEX.test(username)) throw new Error("Username must be 3-30 characters and may only include letters, numbers, underscores, or hyphens.");
      if (RESERVED_USERNAMES.has(username)) throw new Error("That username is reserved.");
      if (username !== originalUsername) {
        const { data: existing, error } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
        if (error) throw error;
        if (existing && existing.id !== user.id) throw new Error("That username is already taken.");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          display_name: profile.name,
          avatar_url: profile.avatar,
          bio: profile.bio,
          age: profile.age,
          gender: profile.gender,
          sexuality: profile.sexuality,
          birthday: profile.birthday,
          timezone: profile.timezone,
          links: normalizeLinks(links),
          accent_color: profile.accent,
          name_color: profile.nameColor,
          bio_color: profile.bioColor,
          font_family: profile.font,
          background_type: profile.bgType,
          background_value: profile.bgType === "gradient" ? profile.gradient : profile.bgType === "video" ? profile.bgVideo : profile.bgImage,
          audio_url: audioUrlWithMeta(profile.bgAudio, profile.bgAudioName, profile.showAudioPlayer, profile.backgroundAudio),
          show_glass_card: profile.showGlass,
          setup_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;
      setOriginalUsername(username);
      alert("Saved.");
    } catch (error: any) {
      alert(error.message || "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
  }

  function copyUrl() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function applyTheme(theme: ThemePreset) {
    setProfile((current) => ({
      ...current,
      accent: theme.accent,
      nameColor: theme.nameColor,
      bioColor: theme.bioColor,
      bgType: "gradient",
      gradient: theme.gradient,
    }));
  }

  function saveTheme() {
    const nextTheme = {
      name: `Custom ${customThemes.length + 1}`,
      accent: profile.accent,
      nameColor: profile.nameColor,
      bioColor: profile.bioColor,
      gradient: profile.gradient,
    };
    const nextThemes = [nextTheme, ...customThemes].slice(0, 8);
    setCustomThemes(nextThemes);
    window.localStorage.setItem("softcard_custom_themes", JSON.stringify(nextThemes));
  }

  const featuredClass = (style?: LinkStyle) => `rx-feature rx-feature-${style || "glass"}`;
  const previewBackground = profile.bgType === "gradient" ? profile.gradient : "#07090d";

  if (loading) {
    return (
      <main className="rx-loading">
        <Sparkles size={22} />
        <span>Loading editor</span>
      </main>
    );
  }

  return (
    <main className="rx-shell">
      <style jsx>{`
        .rx-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 420px minmax(0, 1fr) 390px;
          background: #080a0e;
          color: #f4f7fb;
          font-family: ${profile.font}, Inter, system-ui, sans-serif;
        }
        .rx-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #080a0e;
          color: #f4f7fb;
          font-weight: 800;
        }
        .rx-sidebar,
        .rx-inspector {
          min-height: 100vh;
          background: #0d1117;
          border-color: rgba(255,255,255,0.1);
        }
        .rx-sidebar {
          border-right: 1px solid rgba(255,255,255,0.1);
          padding: 22px;
          overflow-y: auto;
        }
        .rx-inspector {
          border-left: 1px solid rgba(255,255,255,0.1);
          padding: 22px;
          overflow-y: auto;
        }
        .rx-main {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px;
          overflow: hidden;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,0.02) 1px, transparent 1px),
            #080a0e;
          background-size: 56px 56px;
        }
        .rx-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }
        .rx-brand {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rx-brand strong {
          font-size: 18px;
          letter-spacing: 0;
        }
        .rx-brand span,
        .rx-muted {
          color: rgba(244,247,251,0.56);
          font-size: 12px;
          line-height: 1.4;
        }
        .rx-actions,
        .rx-inline {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rx-icon,
        .rx-button,
        .rx-secondary,
        .rx-chip,
        .rx-tab,
        .rx-mini {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.055);
          color: #f4f7fb;
          border-radius: 8px;
          font-weight: 800;
        }
        .rx-icon {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .rx-button {
          min-height: 42px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #f4f7fb;
          color: #091016;
          border: 0;
        }
        .rx-secondary {
          min-height: 40px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .rx-tabs {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 6px;
          margin-bottom: 18px;
        }
        .rx-tab {
          min-height: 44px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: rgba(244,247,251,0.58);
          font-size: 10px;
          letter-spacing: 0;
        }
        .rx-tab-active {
          background: ${profile.accent};
          color: #07100c;
          border-color: transparent;
        }
        .rx-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rx-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .rx-label {
          color: rgba(244,247,251,0.54);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        .rx-input,
        .rx-select,
        .rx-textarea {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.06);
          color: #f4f7fb;
          border-radius: 8px;
          padding: 12px 12px;
          outline: 0;
        }
        .rx-textarea {
          min-height: 92px;
          resize: vertical;
          line-height: 1.5;
        }
        .rx-input:focus,
        .rx-select:focus,
        .rx-textarea:focus {
          border-color: ${profile.accent};
          box-shadow: 0 0 0 4px ${profile.accent}22;
        }
        .rx-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .rx-url-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 38px;
          gap: 8px;
        }
        .rx-status {
          font-size: 12px;
          font-weight: 800;
          color: rgba(244,247,251,0.56);
        }
        .rx-status.available { color: #72e0b1; }
        .rx-status.taken,
        .rx-status.reserved,
        .rx-status.invalid { color: #ff927e; }
        .rx-upload {
          position: relative;
          min-height: 96px;
          border: 1px dashed rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 7px;
          text-align: center;
          color: rgba(244,247,251,0.66);
          padding: 12px;
        }
        .rx-upload input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .rx-avatar-box {
          display: grid;
          grid-template-columns: 86px minmax(0, 1fr);
          gap: 12px;
          align-items: stretch;
        }
        .rx-avatar-box img {
          width: 86px;
          height: 86px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid ${profile.accent};
          padding: 3px;
          background: rgba(255,255,255,0.06);
        }
        .rx-link-card,
        .rx-stat-card,
        .rx-theme {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.045);
          border-radius: 8px;
        }
        .rx-link-card {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rx-link-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .rx-link-tools {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .rx-mini {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
        }
        .rx-check {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(244,247,251,0.72);
          font-size: 13px;
          font-weight: 750;
        }
        .rx-check input {
          width: 16px;
          height: 16px;
          accent-color: ${profile.accent};
        }
        .rx-theme-grid,
        .rx-stat-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .rx-theme {
          min-height: 74px;
          padding: 12px;
          color: #fff;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 3px;
        }
        .rx-theme span,
        .rx-stat-card strong {
          font-weight: 900;
        }
        .rx-theme small,
        .rx-stat-card span {
          color: rgba(255,255,255,0.66);
          font-size: 11px;
          font-weight: 800;
        }
        .rx-stat-card {
          padding: 14px;
        }
        .rx-stat-card strong {
          display: block;
          font-size: 28px;
          line-height: 1;
        }
        .rx-stat-card span {
          display: block;
          margin-top: 8px;
          text-transform: uppercase;
        }
        .rx-top-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .rx-top-link:last-child {
          border-bottom: 0;
        }
        .rx-top-link span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: rgba(244,247,251,0.72);
          font-size: 13px;
        }
        .rx-preview-bg {
          position: absolute;
          inset: 0;
          background: ${previewBackground};
        }
        .rx-preview-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rx-device {
          position: relative;
          z-index: 2;
          width: min(430px, 100%);
          min-height: 620px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 28px;
          background: rgba(0,0,0,0.22);
          padding: 18px;
          box-shadow: 0 32px 100px rgba(0,0,0,0.4);
        }
        .rx-card {
          min-height: 100%;
          border-radius: 22px;
          padding: 26px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: ${profile.showGlass ? "rgba(8,10,14,0.58)" : "transparent"};
          border: ${profile.showGlass ? "1px solid rgba(255,255,255,0.12)" : "0"};
          backdrop-filter: ${profile.showGlass ? "blur(18px)" : "none"};
        }
        .rx-pfp {
          width: 104px;
          height: 104px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid ${profile.accent};
          padding: 3px;
          margin-bottom: 12px;
        }
        .rx-name {
          color: ${profile.nameColor};
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1.1;
        }
        .rx-bio {
          max-width: 310px;
          color: ${profile.bioColor};
          margin-top: 10px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .rx-badges,
        .rx-tags,
        .rx-socials {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }
        .rx-badge,
        .rx-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.075);
          border-radius: 999px;
          padding: 5px 8px;
          font-size: 11px;
          font-weight: 800;
          color: rgba(244,247,251,0.72);
        }
        .rx-socials a {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .rx-socials img {
          width: 19px;
          height: 19px;
        }
        .rx-features {
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
        }
        .rx-feature {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          text-decoration: none;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 800;
        }
        .rx-feature-glass { background: rgba(255,255,255,0.08); }
        .rx-feature-filled { background: ${profile.accent}; border-color: ${profile.accent}; color: #06100b; }
        .rx-feature-outline { background: transparent; border-color: currentColor; }
        .rx-feature-soft { background: ${profile.accent}24; border-color: ${profile.accent}66; }
        .rx-feature-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }
        .rx-feature-text span,
        .rx-feature-text small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rx-feature-text small {
          opacity: 0.66;
          font-size: 11px;
        }
        .rx-player {
          width: 100%;
          max-width: 320px;
          margin-top: 12px;
          min-height: 46px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 11px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          text-align: left;
        }
        .rx-player-icon {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: ${profile.accent};
          color: #06100b;
          flex: 0 0 auto;
        }
        .rx-panel-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }
        .rx-panel-title strong {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .rx-danger {
          color: #ffb09f;
          border-color: rgba(255,146,126,0.3);
          background: rgba(255,146,126,0.1);
        }
        @media (max-width: 1180px) {
          .rx-shell {
            grid-template-columns: 390px minmax(0, 1fr);
          }
          .rx-inspector {
            grid-column: 1 / -1;
            min-height: auto;
            border-left: 0;
            border-top: 1px solid rgba(255,255,255,0.1);
          }
        }
        @media (max-width: 840px) {
          .rx-shell {
            grid-template-columns: 1fr;
          }
          .rx-sidebar,
          .rx-inspector {
            min-height: auto;
          }
          .rx-main {
            min-height: 720px;
            padding: 18px;
          }
          .rx-tabs {
            grid-template-columns: repeat(5, minmax(52px, 1fr));
            overflow-x: auto;
          }
          .rx-row,
          .rx-theme-grid,
          .rx-stat-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <aside className="rx-sidebar">
        <div className="rx-top">
          <div className="rx-brand">
            <strong>Softcard editor</strong>
            <span>{publicUrl}</span>
          </div>
          <div className="rx-actions">
            <button className="rx-icon" onClick={copyUrl} title="Copy public URL">
              {copied ? <Check size={17} /> : <Copy size={17} />}
            </button>
            <button className="rx-icon" onClick={signOut} title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>

        <button className="rx-button" onClick={saveChanges} disabled={saving} style={{ width: "100%", marginBottom: 16 }}>
          <Save size={17} />
          {saving ? "Saving" : "Save changes"}
        </button>

        <div className="rx-tabs">
          {[
            ["profile", User, "Profile"],
            ["links", LinkIcon, "Links"],
            ["style", Palette, "Style"],
            ["media", Music, "Media"],
            ["stats", BarChart3, "Stats"],
          ].map(([value, Icon, label]) => {
            const TabIcon = Icon as typeof User;
            return (
              <button key={value as string} className={`rx-tab ${tab === value ? "rx-tab-active" : ""}`} onClick={() => setTab(value as Tab)}>
                <TabIcon size={14} />
                {label as string}
              </button>
            );
          })}
        </div>

        {tab === "profile" && (
          <section className="rx-section">
            <div className="rx-avatar-box">
              <img src={profile.avatar || defaultProfile.avatar} alt="Profile" />
              <MediaDrop kind="avatar" icon={<ImageIcon size={20} />} title="Drop profile picture" hint="Image up to 50MB" onUpload={uploadMedia} />
            </div>
            <Field label="Avatar URL">
              <div className="rx-url-row">
                <input className="rx-input" value={profile.avatar} onChange={(e) => updateProfile("avatar", e.target.value)} placeholder="https://..." />
                <button className="rx-icon" onClick={() => updateProfile("avatar", "")} title="Clear avatar">
                  <X size={16} />
                </button>
              </div>
            </Field>
            <Field label="Username">
              <input
                className="rx-input"
                value={profile.username}
                onChange={(e) => updateProfile("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30))}
                placeholder="username"
              />
              <div className={`rx-status ${usernameStatus}`}>
                {usernameStatus === "checking" && "Checking availability"}
                {usernameStatus === "available" && "Available"}
                {usernameStatus === "taken" && "Already taken"}
                {usernameStatus === "reserved" && "Reserved username"}
                {usernameStatus === "invalid" && "Use 3-30 letters, numbers, underscores, or hyphens"}
                {usernameStatus === "idle" && publicUrl}
              </div>
            </Field>
            <Field label="Display name">
              <input className="rx-input" value={profile.name} onChange={(e) => updateProfile("name", e.target.value.slice(0, 60))} />
            </Field>
            <Field label="Bio">
              <textarea className="rx-textarea" value={profile.bio} maxLength={150} onChange={(e) => updateProfile("bio", e.target.value)} placeholder="Tell people who you are." />
              <span className="rx-muted">{profile.bio.length}/150</span>
            </Field>
            <div className="rx-row">
              <Field label="Age">
                <input className="rx-input" type="number" value={profile.age} onChange={(e) => updateProfile("age", e.target.value.slice(0, 2))} />
              </Field>
              <Field label="Birthday">
                <input className="rx-input" type="date" value={profile.birthday} onChange={(e) => updateProfile("birthday", e.target.value)} />
              </Field>
            </div>
            <div className="rx-row">
              <Field label="Gender">
                <select className="rx-select" value={profile.gender} onChange={(e) => updateProfile("gender", e.target.value)}>
                  <option value="">None</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-Binary</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Sexuality">
                <select className="rx-select" value={profile.sexuality} onChange={(e) => updateProfile("sexuality", e.target.value)}>
                  <option value="">None</option>
                  <option>Straight</option>
                  <option>Gay</option>
                  <option>Lesbian</option>
                  <option>Bisexual</option>
                  <option>Pansexual</option>
                  <option>Asexual</option>
                  <option>Queer</option>
                </select>
              </Field>
            </div>
            <Field label="Timezone">
              <select className="rx-select" value={profile.timezone} onChange={(e) => updateProfile("timezone", e.target.value)}>
                <option value="">None</option>
                {Intl.supportedValuesOf("timeZone").map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                ))}
              </select>
            </Field>
          </section>
        )}

        {tab === "links" && (
          <section className="rx-section">
            {links.map((link, index) => (
              <div className="rx-link-card" key={link.id}>
                <div className="rx-link-head">
                  <strong>{link.label || link.type || "Link"}</strong>
                  <button className="rx-icon rx-danger" onClick={() => removeLink(link.id)} title="Remove link">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="rx-row">
                  <select className="rx-select" value={link.type} onChange={(e) => updateLink(index, { type: e.target.value })}>
                    {Object.keys(iconMap).map((key) => <option key={key} value={key}>{key.toUpperCase()}</option>)}
                  </select>
                  <select className="rx-select" value={link.style || "glass"} onChange={(e) => updateLink(index, { style: e.target.value as LinkStyle })}>
                    <option value="glass">Glass</option>
                    <option value="filled">Filled</option>
                    <option value="outline">Outline</option>
                    <option value="soft">Soft</option>
                  </select>
                </div>
                <input className="rx-input" value={link.url} onChange={(e) => updateLink(index, { url: e.target.value })} placeholder="https://..." />
                <input className="rx-input" value={link.label || ""} maxLength={40} onChange={(e) => updateLink(index, { label: e.target.value })} placeholder="Button label" />
                <input className="rx-input" value={link.description || ""} maxLength={80} onChange={(e) => updateLink(index, { description: e.target.value })} placeholder="Short description" />
                <div className="rx-row">
                  <input className="rx-input" value={link.color || ""} maxLength={7} onChange={(e) => updateLink(index, { color: e.target.value })} placeholder="#72e0b1" />
                  <input className="rx-input" type="color" value={link.color || profile.accent} onChange={(e) => updateLink(index, { color: e.target.value })} style={{ padding: 5 }} />
                </div>
                <div className="rx-link-tools">
                  <button className="rx-mini" onClick={() => duplicateLink(index)}><CopyPlus size={14} /> Copy</button>
                  <label className="rx-check"><input type="checkbox" checked={link.enabled !== false} onChange={(e) => updateLink(index, { enabled: e.target.checked })} /> Show</label>
                  <label className="rx-check"><input type="checkbox" checked={Boolean(link.featured)} onChange={(e) => updateLink(index, { featured: e.target.checked })} /> Feature</label>
                </div>
              </div>
            ))}
            <button className="rx-secondary" onClick={addLink}>
              <Plus size={16} />
              Add link
            </button>
          </section>
        )}

        {tab === "style" && (
          <section className="rx-section">
            <div className="rx-theme-grid">
              {allThemes.map((theme) => (
                <button key={theme.name} className="rx-theme" style={{ background: theme.gradient }} onClick={() => applyTheme(theme)}>
                  <span>{theme.name}</span>
                  <small>Apply theme</small>
                </button>
              ))}
            </div>
            <button className="rx-secondary" onClick={saveTheme}><CopyPlus size={16} /> Save current theme</button>
            <Field label="Font">
              <select className="rx-select" value={profile.font} onChange={(e) => updateProfile("font", e.target.value)}>
                <option value="Inter">Inter</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Outfit">Outfit</option>
              </select>
            </Field>
            <div className="rx-row">
              <Field label="Name color">
                <input className="rx-input" type="color" value={profile.nameColor.slice(0, 7)} onChange={(e) => updateProfile("nameColor", e.target.value)} />
              </Field>
              <Field label="Accent">
                <input className="rx-input" type="color" value={profile.accent.slice(0, 7)} onChange={(e) => updateProfile("accent", e.target.value)} />
              </Field>
            </div>
            <Field label="Bio color">
              <input className="rx-input" type="color" value={profile.bioColor.slice(0, 7)} onChange={(e) => updateProfile("bioColor", e.target.value)} />
            </Field>
            <label className="rx-check"><input type="checkbox" checked={profile.showGlass} onChange={(e) => updateProfile("showGlass", e.target.checked)} /> Glass profile panel</label>
          </section>
        )}

        {tab === "media" && (
          <section className="rx-section">
            <Field label="Background type">
              <select className="rx-select" value={profile.bgType} onChange={(e) => updateProfile("bgType", e.target.value as ProfileData["bgType"])}>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </Field>
            <div className="rx-row">
              <MediaDrop kind="image" icon={<ImageIcon size={20} />} title="Drop background image" hint="Image up to 50MB" onUpload={uploadMedia} />
              <MediaDrop kind="video" icon={<Upload size={20} />} title="Drop background video" hint="Video up to 50MB" onUpload={uploadMedia} />
            </div>
            {profile.bgType === "gradient" && (
              <div className="rx-row">
                <Field label="Start color">
                  <input className="rx-input" type="color" value={gradientColors[0]} onChange={(e) => updateGradient(e.target.value, gradientColors[1])} />
                </Field>
                <Field label="End color">
                  <input className="rx-input" type="color" value={gradientColors[1]} onChange={(e) => updateGradient(gradientColors[0], e.target.value)} />
                </Field>
              </div>
            )}
            {profile.bgType !== "gradient" && (
              <Field label={profile.bgType === "video" ? "Video URL" : "Image URL"}>
                <input
                  className="rx-input"
                  value={profile.bgType === "video" ? profile.bgVideo : profile.bgImage}
                  onChange={(e) => profile.bgType === "video" ? updateProfile("bgVideo", e.target.value) : updateProfile("bgImage", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            )}
            <MediaDrop kind="audio" icon={<Music size={20} />} title="Drop profile audio" hint="Audio up to 50MB" onUpload={uploadMedia} />
            <Field label="Audio title">
              <input className="rx-input" value={profile.bgAudioName} onChange={(e) => updateProfile("bgAudioName", e.target.value.slice(0, 60))} />
            </Field>
            <Field label="Audio URL">
              <input className="rx-input" value={profile.bgAudio} onChange={(e) => updateProfile("bgAudio", e.target.value)} placeholder="https://..." />
            </Field>
            <label className="rx-check"><input type="checkbox" checked={profile.showAudioPlayer} onChange={(e) => updateProfile("showAudioPlayer", e.target.checked)} /> Show audio player</label>
            <label className="rx-check"><input type="checkbox" checked={profile.backgroundAudio} onChange={(e) => updateProfile("backgroundAudio", e.target.checked)} /> Use as click-to-enter audio</label>
          </section>
        )}

        {tab === "stats" && (
          <section className="rx-section">
            <div className="rx-stat-grid">
              <div className="rx-stat-card"><strong>{Number(profile.views || 0).toLocaleString()}</strong><span>Profile views</span></div>
              <div className="rx-stat-card"><strong>{totalClicks.toLocaleString()}</strong><span>Link clicks</span></div>
            </div>
            <div className="rx-link-card">
              <div className="rx-link-head"><strong>Top links</strong><span className="rx-muted">tracked redirects</span></div>
              {topLinks.length ? topLinks.map((link) => (
                <div className="rx-top-link" key={`top-${link.id}`}>
                  <span>{link.label || link.type || link.url}</span>
                  <strong>{Number(link.clicks || 0).toLocaleString()}</strong>
                </div>
              )) : <span className="rx-muted">No links yet.</span>}
            </div>
          </section>
        )}
      </aside>

      <section className="rx-main">
        <div className="rx-preview-bg" />
        {profile.bgType === "image" && profile.bgImage && <img className="rx-preview-media" src={profile.bgImage} alt="" />}
        {profile.bgType === "video" && profile.bgVideo && <video className="rx-preview-media" src={profile.bgVideo} autoPlay muted loop playsInline />}
        <div className="rx-device">
          <ProfilePreview profile={profile} links={links} badges={badges} featuredClass={featuredClass} />
        </div>
      </section>

      <aside className="rx-inspector">
        <div className="rx-panel-title">
          <strong><Eye size={16} /> Publish check</strong>
          {profile.username && <a className="rx-secondary" href={`/${profile.username}`} target="_blank" rel="noreferrer"><ArrowUpRight size={15} /> View</a>}
        </div>
        <section className="rx-section">
          <div className="rx-stat-grid">
            <div className="rx-stat-card"><strong>{links.filter((link) => link.enabled !== false && link.url).length}</strong><span>Visible links</span></div>
            <div className="rx-stat-card"><strong>{links.filter((link) => link.featured && link.url).length}</strong><span>Featured</span></div>
          </div>
          <div className="rx-link-card">
            <div className="rx-link-head"><strong>Badges</strong><span className="rx-muted">admin managed</span></div>
            <div className="rx-inline" style={{ flexWrap: "wrap" }}>
              {Object.entries(badgeInfo).map(([key, item]) => {
                const Icon = item.icon;
                const active = badges[key as keyof Badges];
                return (
                  <span className="rx-badge" key={key} style={{ opacity: active ? 1 : 0.38 }}>
                    <Icon size={14} color={item.color} />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="rx-link-card">
            <div className="rx-link-head"><strong>Current URL</strong><button className="rx-mini" onClick={copyUrl}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy</button></div>
            <span className="rx-muted">{publicUrl}</span>
          </div>
        </section>
      </aside>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="rx-group">
      <span className="rx-label">{label}</span>
      {children}
    </label>
  );
}

function MediaDrop({
  kind,
  icon,
  title,
  hint,
  onUpload,
}: {
  kind: "avatar" | "image" | "video" | "audio";
  icon: ReactNode;
  title: string;
  hint: string;
  onUpload: (kind: "avatar" | "image" | "video" | "audio", file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file?: File) {
    if (!file || uploading) return;
    setUploading(true);
    try {
      await onUpload(kind, file);
    } catch (error: any) {
      alert(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label
      className="rx-upload"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        handleFile(event.dataTransfer.files?.[0]);
      }}
    >
      {uploading ? <Upload size={20} /> : icon}
      <strong>{uploading ? "Uploading" : title}</strong>
      <span>{hint}</span>
      <input
        type="file"
        accept={kind === "video" ? "video/*" : kind === "audio" ? "audio/*" : "image/*"}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </label>
  );
}

function ProfilePreview({
  profile,
  links,
  badges,
  featuredClass,
}: {
  profile: ProfileData;
  links: SocialLink[];
  badges: Badges;
  featuredClass: (style?: LinkStyle) => string;
}) {
  const socials = links.filter((link) => link.enabled !== false && link.url && safeExternalUrl(link.url));
  const standardLinks = socials.filter((link) => !link.featured);
  const featuredLinks = socials.filter((link) => link.featured && link.label).slice(0, 4);

  return (
    <div className="rx-card">
      <img className="rx-pfp" src={profile.avatar || defaultProfile.avatar} alt="Profile" />
      <div className="rx-name">{profile.name || "User"}</div>
      {(badges.user || badges.dev || badges.staff) && (
        <div className="rx-badges">
          {Object.entries(badgeInfo).map(([key, item]) => {
            if (!badges[key as keyof Badges]) return null;
            const Icon = item.icon;
            return <span className="rx-badge" key={key}><Icon size={14} color={item.color} />{item.label}</span>;
          })}
        </div>
      )}
      <div className="rx-tags">
        {profile.age && <span className="rx-tag">{profile.age} y/o</span>}
        {profile.gender && <span className="rx-tag">{profile.gender}</span>}
        {profile.sexuality && <span className="rx-tag">{profile.sexuality}</span>}
        {profile.birthday && <span className="rx-tag">{new Date(profile.birthday).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}</span>}
        {profile.timezone && <span className="rx-tag">{profile.timezone.split("/").pop()?.replace(/_/g, " ")}</span>}
      </div>
      <div className="rx-bio">{profile.bio || "No bio yet."}</div>
      <div className="rx-socials">
        {standardLinks.map((link) => (
          <a key={link.id} href={safeExternalUrl(link.url)} target="_blank" rel="noreferrer">
            <img src={iconMap[link.type] || iconMap.website} alt={link.type} />
          </a>
        ))}
      </div>
      <div className="rx-features">
        {featuredLinks.map((link) => (
          <a key={`feature-${link.id}`} className={featuredClass(link.style)} href={safeExternalUrl(link.url)} target="_blank" rel="noreferrer" style={{ borderColor: link.color || profile.accent }}>
            <span className="rx-feature-text">
              <span>{link.label}</span>
              {link.description && <small>{link.description}</small>}
            </span>
            <ArrowUpRight size={15} />
          </a>
        ))}
      </div>
      {profile.bgAudio && profile.showAudioPlayer && (
        <div className="rx-player">
          <span className="rx-player-icon"><Music size={15} /></span>
          <span className="rx-feature-text">
            <span>{profile.bgAudioName || fileTitle(profile.bgAudio.split("/").pop()?.split("?")[0] || "Profile audio")}</span>
            <small>Profile audio</small>
          </span>
        </div>
      )}
    </div>
  );
}
