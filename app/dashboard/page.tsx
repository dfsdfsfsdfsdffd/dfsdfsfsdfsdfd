"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  Code,
  Copy,
  CopyPlus,
  Eye,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  LogOut,
  Music,
  Palette,
  Pencil,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";

type LinkStyle = "glass" | "filled" | "outline" | "soft";
type EditorTab = "profile" | "links" | "appearance" | "media" | "stats";
type ProfileEffect = "none" | "snow" | "rain" | "night" | "ctv";
type UsernameEffect = "none" | "typewriter" | "rainbow" | "fuzzy" | "glitch" | "sparkles";

type ProfileMeta = {
  cursorUrl: string;
  profileEffect: ProfileEffect;
  usernameEffect: UsernameEffect;
  bgBlur: number;
  bgOpacity: number;
  customFontUrl: string;
  customFontName: string;
};

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
  meta?: ProfileMeta;
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
  snapchat: "https://cdn.simpleicons.org/snapchat/fffc00",
  tiktok: "https://cdn.simpleicons.org/tiktok/ffffff",
  telegram: "https://cdn.simpleicons.org/telegram/26a5e4",
  soundcloud: "https://cdn.simpleicons.org/soundcloud/ff5500",
  paypal: "https://cdn.simpleicons.org/paypal/003087",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
  x: "https://cdn.simpleicons.org/x/ffffff",
  youtube: "https://cdn.simpleicons.org/youtube/ffffff",
  twitch: "https://cdn.simpleicons.org/twitch/ffffff",
  spotify: "https://cdn.simpleicons.org/spotify/ffffff",
  discord: "https://cdn.simpleicons.org/discord/ffffff",
  github: "https://cdn.simpleicons.org/github/ffffff",
  roblox: "https://cdn.simpleicons.org/roblox/ffffff",
  cashapp: "https://cdn.simpleicons.org/cashapp/00d632",
  venmo: "https://cdn.simpleicons.org/venmo/008cff",
  playstation: "https://cdn.simpleicons.org/playstation/0070cc",
  xbox: "https://cdn.simpleicons.org/xbox/107c10",
  applemusic: "https://cdn.simpleicons.org/applemusic/fa243c",
  gitlab: "https://cdn.simpleicons.org/gitlab/fc6d26",
  reddit: "https://cdn.simpleicons.org/reddit/ff4500",
  vk: "https://cdn.simpleicons.org/vk/0077ff",
  bluesky: "https://cdn.simpleicons.org/bluesky/0285ff",
  namemc: "https://cdn.simpleicons.org/namemc/12161a",
  onlyfans: "https://cdn.simpleicons.org/onlyfans/00aff0",
  linkedin: "https://cdn.simpleicons.org/linkedin/0a66c2",
  steam: "https://cdn.simpleicons.org/steam/ffffff",
  kick: "https://cdn.simpleicons.org/kick/53fc18",
  pinterest: "https://cdn.simpleicons.org/pinterest/e60023",
  osu: "https://cdn.simpleicons.org/osu/ff66aa",
  googlemaps: "https://cdn.simpleicons.org/googlemaps/4285f4",
  buymeacoffee: "https://cdn.simpleicons.org/buymeacoffee/ffdd00",
  facebook: "https://cdn.simpleicons.org/facebook/0866ff",
  threads: "https://cdn.simpleicons.org/threads/ffffff",
  patreon: "https://cdn.simpleicons.org/patreon/ff424d",
  signal: "https://cdn.simpleicons.org/signal/3a76f0",
  bitcoin: "https://cdn.simpleicons.org/bitcoin/f7931a",
  ethereum: "https://cdn.simpleicons.org/ethereum/ffffff",
  litecoin: "https://cdn.simpleicons.org/litecoin/a6a9aa",
  solana: "https://cdn.simpleicons.org/solana/9945ff",
  ripple: "https://cdn.simpleicons.org/xrp/346aa9",
  monero: "https://cdn.simpleicons.org/monero/ff6600",
  email:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='5' width='18' height='14' rx='2'/%3E%3Cpath d='m3 7 9 6 9-6'/%3E%3C/svg%3E",
  website:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M2 12h20'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E",
};

const defaultMeta: ProfileMeta = {
  cursorUrl: "",
  profileEffect: "none",
  usernameEffect: "none",
  bgBlur: 0,
  bgOpacity: 1,
  customFontUrl: "",
  customFontName: "",
};

const badgeInfo = {
  user: { label: "Verified User", description: "This profile belongs to a verified Softcard user.", color: "#3b82f6", icon: ShieldCheck },
  dev: { label: "Developer", description: "This user is marked as a Softcard developer.", color: "#a970ff", icon: Code },
  staff: { label: "Staff", description: "This user is marked as Softcard staff.", color: "#f59e0b", icon: Star },
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
  accent: "#a970ff",
  nameColor: "#ffffff",
  bioColor: "#ffffffb3",
  font: "Inter",
  bgType: "gradient",
  gradient: "linear-gradient(135deg, #170f2f 0%, #050106 100%)",
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
  { name: "Violet", accent: "#a970ff", nameColor: "#ffffff", bioColor: "#d8caff", gradient: "linear-gradient(135deg, #170f2f 0%, #050106 100%)" },
  { name: "Rose", accent: "#ff6bbd", nameColor: "#fff5fb", bioColor: "#ffd6eb", gradient: "linear-gradient(135deg, #2b0719 0%, #050106 100%)" },
  { name: "Cyan", accent: "#55d6ff", nameColor: "#f4fdff", bioColor: "#c7f2ff", gradient: "linear-gradient(135deg, #042336 0%, #02060a 100%)" },
  { name: "Mono", accent: "#ffffff", nameColor: "#ffffff", bioColor: "#b8bcc8", gradient: "linear-gradient(135deg, #17191f 0%, #030406 100%)" },
  { name: "Ember", accent: "#ff7a4d", nameColor: "#fff4ed", bioColor: "#ffd2bd", gradient: "linear-gradient(135deg, #341107 0%, #050201 100%)" },
  { name: "Forest", accent: "#46d39a", nameColor: "#f1fff8", bioColor: "#bff5db", gradient: "linear-gradient(135deg, #06251a 0%, #020806 100%)" },
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

function fileTitle(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 60);
}

function uploadLimit() {
  return 50 * 1024 * 1024;
}

function formatMb(bytes: number) {
  return `${Math.floor(bytes / 1024 / 1024)}MB`;
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
    const cleanedTitle = title.trim().slice(0, 60);
    if (cleanedTitle) params.set("title", cleanedTitle);
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

function readMeta(items: SocialLink[]): ProfileMeta {
  const metaLink = items.find((link) => link.type === "__softcard_meta");
  const meta = { ...defaultMeta, ...(metaLink?.meta || {}) };
  if ((meta.usernameEffect as string) === "shuffle") meta.usernameEffect = "glitch";
  return meta;
}

function writeMeta(items: SocialLink[], meta: ProfileMeta) {
  const existing = items.filter((link) => link.type !== "__softcard_meta");
  return [
    ...existing,
    {
      id: -1,
      type: "__softcard_meta",
      url: "https://softcard.cc",
      label: "",
      enabled: false,
      featured: false,
      meta,
    },
  ];
}

export default function SoftcardDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  const [view, setView] = useState<"hub" | "editor">("hub");
  const [tab, setTab] = useState<EditorTab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "reserved" | "invalid">("idle");
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [profileMeta, setProfileMeta] = useState<ProfileMeta>(defaultMeta);
  const [badges, setBadges] = useState<Badges>({ user: true, dev: false, staff: false });
  const [customThemes, setCustomThemes] = useState<ThemePreset[]>([]);

  const themes = [...baseThemes, ...customThemes];
  const totalClicks = links.reduce((sum, link) => sum + Number(link.clicks || 0), 0);
  const topLinks = [...links].sort((a, b) => Number(b.clicks || 0) - Number(a.clicks || 0)).slice(0, 5);
  const gradientColors = profile.gradient.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || ["#170f2f", "#050106"];
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
          views: data.views || 0,
          showGlass: data.show_glass_card ?? true,
        });
        const savedLinks = Array.isArray(data.links) ? data.links : [];
        setLinks(savedLinks.filter((link: SocialLink) => link.type !== "__softcard_meta"));
        setProfileMeta(readMeta(savedLinks));
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

  function updateLink(index: number, patch: Partial<SocialLink>) {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  function addLink() {
    setLinks((current) => [
      ...current,
      { id: Date.now(), type: "website", url: "", label: "", description: "", color: "", style: "glass", featured: false, enabled: true, clicks: 0 },
    ]);
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

  function removeLink(id: number) {
    setLinks((current) => current.filter((link) => link.id !== id));
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

  function updateGradient(c1: string, c2: string) {
    updateProfile("gradient", `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
  }

  async function uploadMedia(kind: "avatar" | "image" | "video" | "audio" | "cursor" | "font", file: File) {
    if (!supabase) throw new Error("Uploads are not configured.");
    if ((kind === "avatar" || kind === "image") && !file.type.startsWith("image/")) throw new Error("Use an image file.");
    if (kind === "video" && !file.type.startsWith("video/")) throw new Error("Use a video file.");
    if (kind === "audio" && !file.type.startsWith("audio/")) throw new Error("Use an audio file.");
    if (kind === "cursor" && !file.type.startsWith("image/")) throw new Error("Use an image file for the cursor.");
    if (kind === "font" && !/\.(ttf|otf)$/i.test(file.name)) throw new Error("Custom fonts must be .ttf or .otf files.");
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
    if (kind === "cursor") setProfileMeta((current) => ({ ...current, cursorUrl: publicUrl }));
    if (kind === "font") {
      setProfileMeta((current) => ({
        ...current,
        customFontUrl: publicUrl,
        customFontName: fileTitle(file.name) || "SoftcardCustomFont",
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
        const { data, error } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
        if (error) throw error;
        if (data && data.id !== user.id) throw new Error("That username is already taken.");
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
          links: writeMeta(normalizeLinks(links), profileMeta),
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
      alert("Published successfully!");
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

  const featureClass = (style?: LinkStyle) => `sx-feature-link sx-feature-${style || "glass"}`;

  if (loading) {
    return (
      <main className="classic-loading">
        <Palette size={22} />
        Loading dashboard
      </main>
    );
  }

  if (view === "hub") {
    return (
      <main className="classic-hub">
        <style>{classicStyles(profile, profileMeta)}</style>
        <div className="classic-hub-shell">
          <nav className="classic-hub-nav">
            <button className="classic-ghost" onClick={signOut}><LogOut size={16} /> Log out</button>
          </nav>

          <section className="classic-hub-center">
            <p className="classic-kicker">Dashboard</p>
            <h1>Welcome back, <span>{profile.username || "User"}</span></h1>
            <div className="classic-avatar-ring">
              <img src={profile.avatar || defaultProfile.avatar} alt="Profile" />
            </div>

            <div className="classic-hub-actions">
              <button className="classic-primary" onClick={() => setView("editor")}><Pencil size={18} /> Edit page</button>
              <a className="classic-secondary" href={`/${profile.username}`} target="_blank" rel="noreferrer"><ExternalLink size={18} /> View page</a>
            </div>

            <div className="classic-url-card">
              <span>{publicUrl}</span>
              <button onClick={copyUrl}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="classic-editor" style={{ fontFamily: `${profile.font}, Inter, system-ui, sans-serif` }}>
      <style>{classicStyles(profile, profileMeta)}</style>
      <aside className="classic-sidebar">
        <div className="classic-editor-head">
          <button className="classic-back" onClick={() => setView("hub")}><ArrowLeft size={16} /> Dashboard</button>
          <button className="classic-primary classic-save" onClick={saveChanges} disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save & Publish"}</button>
        </div>

        <div className="classic-tabs">
          <button className={tab === "profile" ? "is-active" : ""} onClick={() => setTab("profile")}><UserIcon size={14} /> Profile</button>
          <button className={tab === "links" ? "is-active" : ""} onClick={() => setTab("links")}><LinkIcon size={14} /> Links</button>
          <button className={tab === "appearance" ? "is-active" : ""} onClick={() => setTab("appearance")}><Palette size={14} /> Style</button>
          <button className={tab === "media" ? "is-active" : ""} onClick={() => setTab("media")}><Music size={14} /> Media</button>
          <button className={tab === "stats" ? "is-active" : ""} onClick={() => setTab("stats")}><BarChart3 size={14} /> Stats</button>
        </div>

        {tab === "profile" && (
          <Panel>
            <div className="classic-avatar-edit">
              <img src={profile.avatar || defaultProfile.avatar} alt="Profile" />
              <MediaDrop kind="avatar" icon={<ImageIcon size={20} />} title="Drop profile picture" hint="PNG, JPG, WEBP, GIF up to 50MB" onUpload={uploadMedia} />
            </div>
            <Field label="Avatar Image URL">
              <div className="classic-inline-input">
                <input value={profile.avatar} onChange={(e) => updateProfile("avatar", e.target.value)} placeholder="https://..." />
                <button onClick={() => updateProfile("avatar", "")}><X size={16} /></button>
              </div>
            </Field>
            <Field label="Username">
              <input value={profile.username} onChange={(e) => updateProfile("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30))} placeholder="username" />
              <div className={`classic-status ${usernameStatus}`}>
                {usernameStatus === "checking" && "Checking availability..."}
                {usernameStatus === "available" && "Available"}
                {usernameStatus === "taken" && "Already taken"}
                {usernameStatus === "reserved" && "Reserved username"}
                {usernameStatus === "invalid" && "Use 3-30 letters, numbers, underscores, or hyphens"}
                {usernameStatus === "idle" && publicUrl}
              </div>
            </Field>
            <Field label="Display Name">
              <input value={profile.name} onChange={(e) => updateProfile("name", e.target.value.slice(0, 60))} />
            </Field>
            <Field label="Short Bio">
              <textarea value={profile.bio} maxLength={150} onChange={(e) => updateProfile("bio", e.target.value)} placeholder="Tell the world about yourself..." />
              <small>{profile.bio.length}/150</small>
            </Field>
            <div className="classic-grid-2">
              <Field label="Age"><input type="number" value={profile.age} onChange={(e) => updateProfile("age", e.target.value.slice(0, 2))} /></Field>
              <Field label="Birthday"><input type="date" value={profile.birthday} onChange={(e) => updateProfile("birthday", e.target.value)} /></Field>
            </div>
            <div className="classic-grid-2">
              <Field label="Gender">
                <select value={profile.gender} onChange={(e) => updateProfile("gender", e.target.value)}>
                  <option value="">None</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-Binary</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Sexuality">
                <select value={profile.sexuality} onChange={(e) => updateProfile("sexuality", e.target.value)}>
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
              <select value={profile.timezone} onChange={(e) => updateProfile("timezone", e.target.value)}>
                <option value="">None</option>
                {Intl.supportedValuesOf("timeZone").map((timezone) => (
                  <option key={timezone} value={timezone}>{timezone.replace(/_/g, " ")}</option>
                ))}
              </select>
            </Field>
          </Panel>
        )}

        {tab === "links" && (
          <Panel>
            {links.map((link, index) => (
              <div className="classic-link-card" key={link.id}>
                <button className="classic-remove" onClick={() => removeLink(link.id)}><Trash2 size={14} /></button>
                <div className="classic-grid-2">
                  <select value={link.type} onChange={(e) => updateLink(index, { type: e.target.value })}>
                    {Object.keys(iconMap).map((key) => <option key={key} value={key}>{key.toUpperCase()}</option>)}
                  </select>
                  <select value={link.style || "glass"} onChange={(e) => updateLink(index, { style: e.target.value as LinkStyle })}>
                    <option value="glass">Glass</option>
                    <option value="filled">Filled</option>
                    <option value="outline">Outline</option>
                    <option value="soft">Soft</option>
                  </select>
                </div>
                <input value={link.url} onChange={(e) => updateLink(index, { url: e.target.value })} placeholder="https://..." />
                <input value={link.label || ""} maxLength={40} onChange={(e) => updateLink(index, { label: e.target.value })} placeholder="Display label" />
                <input value={link.description || ""} maxLength={80} onChange={(e) => updateLink(index, { description: e.target.value })} placeholder="Featured button description" />
                <div className="classic-grid-2">
                  <input value={link.color || ""} maxLength={7} onChange={(e) => updateLink(index, { color: e.target.value })} placeholder="#a970ff" />
                  <input type="color" value={link.color || profile.accent} onChange={(e) => updateLink(index, { color: e.target.value })} />
                </div>
                <div className="classic-tools">
                  <button onClick={() => duplicateLink(index)}><CopyPlus size={14} /> Copy</button>
                  <label><input type="checkbox" checked={link.enabled !== false} onChange={(e) => updateLink(index, { enabled: e.target.checked })} /> Show</label>
                  <label><input type="checkbox" checked={Boolean(link.featured)} onChange={(e) => updateLink(index, { featured: e.target.checked })} /> Feature</label>
                </div>
              </div>
            ))}
            <button className="classic-secondary classic-add" onClick={addLink}><Plus size={16} /> Add New Link</button>
          </Panel>
        )}

        {tab === "appearance" && (
          <Panel>
            <div className="classic-theme-grid">
              {themes.map((theme) => (
                <button key={theme.name} className="classic-theme" style={{ background: theme.gradient }} onClick={() => applyTheme(theme)}>
                  <span>{theme.name}</span>
                  <small>Apply theme</small>
                </button>
              ))}
            </div>
            <button className="classic-secondary classic-add" onClick={saveTheme}><CopyPlus size={16} /> Save Current Theme</button>
            <Field label="Font Style">
              <select value={profile.font} onChange={(e) => updateProfile("font", e.target.value)}>
                <option value="Inter">Inter</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Outfit">Outfit</option>
              </select>
            </Field>
            <div className="classic-grid-2">
              <Field label="Name Color"><input type="color" value={profile.nameColor.slice(0, 7)} onChange={(e) => updateProfile("nameColor", e.target.value)} /></Field>
              <Field label="Accent Color"><input type="color" value={profile.accent.slice(0, 7)} onChange={(e) => updateProfile("accent", e.target.value)} /></Field>
            </div>
            <Field label="Bio Color"><input type="color" value={profile.bioColor.slice(0, 7)} onChange={(e) => updateProfile("bioColor", e.target.value)} /></Field>
            <label className="classic-check"><input type="checkbox" checked={profile.showGlass} onChange={(e) => updateProfile("showGlass", e.target.checked)} /> Transparent Glass Card</label>
            <Field label="Profile Effect">
              <select value={profileMeta.profileEffect} onChange={(e) => setProfileMeta((current) => ({ ...current, profileEffect: e.target.value as ProfileEffect }))}>
                <option value="none">None</option>
                <option value="snow">Snowflakes</option>
                <option value="rain">Rain</option>
                <option value="night">Nighttime</option>
                <option value="ctv">CTV</option>
              </select>
            </Field>
            <Field label="Username Effect">
              <select value={profileMeta.usernameEffect} onChange={(e) => setProfileMeta((current) => ({ ...current, usernameEffect: e.target.value as UsernameEffect }))}>
                <option value="none">None</option>
                <option value="typewriter">Typewriter</option>
                <option value="rainbow">Rainbow</option>
                <option value="fuzzy">Fuzzy</option>
                <option value="glitch">Glitch</option>
                <option value="sparkles">Sparkles</option>
              </select>
            </Field>
            <Field label={`Background Blur: ${profileMeta.bgBlur}px`}>
              <input type="range" min="0" max="24" value={profileMeta.bgBlur} onChange={(e) => setProfileMeta((current) => ({ ...current, bgBlur: Number(e.target.value) }))} />
            </Field>
            <Field label={`Background Opacity: ${Math.round(profileMeta.bgOpacity * 100)}%`}>
              <input type="range" min="0.2" max="1" step="0.05" value={profileMeta.bgOpacity} onChange={(e) => setProfileMeta((current) => ({ ...current, bgOpacity: Number(e.target.value) }))} />
            </Field>
            <Field label="Custom Font File">
              <MediaDrop kind="font" icon={<Upload size={20} />} title="Drop .ttf or .otf" hint="Font file only" onUpload={uploadMedia} />
              {profileMeta.customFontUrl && <small>{profileMeta.customFontName || "Custom font uploaded"}</small>}
            </Field>
          </Panel>
        )}

        {tab === "media" && (
          <Panel>
            <Field label="Background Type">
              <select value={profile.bgType} onChange={(e) => updateProfile("bgType", e.target.value as ProfileData["bgType"])}>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </Field>
            <div className="classic-grid-2">
              <MediaDrop kind="image" icon={<ImageIcon size={20} />} title="Drop image" hint="PNG, JPG, WEBP, GIF up to 50MB" onUpload={uploadMedia} />
              <MediaDrop kind="video" icon={<Upload size={20} />} title="Drop video" hint="MP4, WEBM, MOV up to 50MB" onUpload={uploadMedia} />
            </div>
            {profile.bgType === "gradient" && (
              <div className="classic-grid-2">
                <Field label="Start Color"><input type="color" value={gradientColors[0]} onChange={(e) => updateGradient(e.target.value, gradientColors[1])} /></Field>
                <Field label="End Color"><input type="color" value={gradientColors[1]} onChange={(e) => updateGradient(gradientColors[0], e.target.value)} /></Field>
              </div>
            )}
            {profile.bgType !== "gradient" && (
              <Field label={profile.bgType === "video" ? "Video URL" : "Image URL"}>
                <input value={profile.bgType === "video" ? profile.bgVideo : profile.bgImage} onChange={(e) => profile.bgType === "video" ? updateProfile("bgVideo", e.target.value) : updateProfile("bgImage", e.target.value)} placeholder="https://..." />
              </Field>
            )}
            <MediaDrop kind="audio" icon={<Music size={20} />} title="Drop audio" hint="MP3, WAV, OGG, WEBM up to 50MB" onUpload={uploadMedia} />
            <Field label="Custom Cursor">
              <MediaDrop kind="cursor" icon={<Upload size={20} />} title="Drop cursor image" hint="PNG, JPG, GIF, WEBP" onUpload={uploadMedia} />
              {profileMeta.cursorUrl && (
                <button className="classic-secondary" onClick={() => setProfileMeta((current) => ({ ...current, cursorUrl: "" }))}>Clear cursor</button>
              )}
            </Field>
            <Field label="Audio Player Name"><input value={profile.bgAudioName} onChange={(e) => updateProfile("bgAudioName", e.target.value.slice(0, 60))} /></Field>
            <Field label="Audio URL"><input value={profile.bgAudio} onChange={(e) => updateProfile("bgAudio", e.target.value)} placeholder="https://..." /></Field>
            <label className="classic-check"><input type="checkbox" checked={profile.showAudioPlayer} onChange={(e) => updateProfile("showAudioPlayer", e.target.checked)} /> Show audio player</label>
            <label className="classic-check"><input type="checkbox" checked={profile.backgroundAudio} onChange={(e) => updateProfile("backgroundAudio", e.target.checked)} /> Use as background audio after click-to-enter</label>
          </Panel>
        )}

        {tab === "stats" && (
          <Panel>
            <div className="classic-stat-grid">
              <div className="classic-stat"><strong>{Number(profile.views || 0).toLocaleString()}</strong><span>Profile views</span></div>
              <div className="classic-stat"><strong>{totalClicks.toLocaleString()}</strong><span>Link clicks</span></div>
            </div>
            <div className="classic-link-card">
              <h3>Top Links</h3>
              {topLinks.length ? topLinks.map((link) => (
                <div className="classic-top-link" key={`top-${link.id}`}>
                  <span>{link.label || link.type || link.url}</span>
                  <strong>{Number(link.clicks || 0).toLocaleString()}</strong>
                </div>
              )) : <p className="classic-muted">Add links to start tracking clicks.</p>}
            </div>
          </Panel>
        )}
      </aside>

      <section className="classic-preview">
        {profile.bgType === "gradient" && <div className="classic-bg" style={{ background: profile.gradient }} />}
        {profile.bgType === "image" && profile.bgImage && <img className="classic-bg" src={profile.bgImage} alt="" />}
        {profile.bgType === "video" && profile.bgVideo && <video className="classic-bg" src={profile.bgVideo} autoPlay muted loop playsInline />}
        <EffectLayer effect={profileMeta.profileEffect} scope="screen" />
        <ProfilePreview profile={profile} meta={profileMeta} badges={badges} links={links} featureClass={featureClass} />
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="classic-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="classic-panel">{children}</div>;
}

function MediaDrop({
  kind,
  icon,
  title,
  hint,
  onUpload,
}: {
  kind: "avatar" | "image" | "video" | "audio" | "cursor" | "font";
  icon: ReactNode;
  title: string;
  hint: string;
  onUpload: (kind: "avatar" | "image" | "video" | "audio" | "cursor" | "font", file: File) => Promise<void>;
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
      className="classic-upload"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        handleFile(event.dataTransfer.files?.[0]);
      }}
    >
      {uploading ? <Upload size={20} /> : icon}
      <strong>{uploading ? "Uploading..." : title}</strong>
      <span>{hint}</span>
      <input
        type="file"
        accept={kind === "video" ? "video/*" : kind === "audio" ? "audio/*" : kind === "font" ? ".ttf,.otf" : "image/*"}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </label>
  );
}

function ProfilePreview({
  profile,
  meta,
  badges,
  links,
  featureClass,
}: {
  profile: ProfileData;
  meta: ProfileMeta;
  badges: Badges;
  links: SocialLink[];
  featureClass: (style?: LinkStyle) => string;
}) {
  const socials = links.filter((link) => link.enabled !== false && link.url && safeExternalUrl(link.url));
  const iconLinks = socials.filter((link) => !link.featured);
  const featureLinks = socials.filter((link) => link.featured && link.label).slice(0, 4);

  return (
    <div className="classic-profile-card">
      <div className="classic-view-count">
        <Eye size={14} strokeWidth={2.5} />
        {Number(profile.views || 0).toLocaleString()}
      </div>
      <img className="classic-pfp" src={profile.avatar || defaultProfile.avatar} alt="Profile" />
      <div className={`classic-name name-effect-${meta.usernameEffect}`} style={{ color: profile.nameColor }} data-name={profile.name || "User"}>
        {profile.name || "User"}
      </div>
      {(badges.user || badges.dev || badges.staff) && (
        <div className="classic-badges">
          {Object.entries(badgeInfo).map(([key, info]) => {
            if (!badges[key as keyof Badges]) return null;
            const Icon = info.icon;
            return (
              <span key={key} className="classic-badge" title={info.description}>
                <Icon size={14} color={key === "dev" ? profile.accent : info.color} />
              </span>
            );
          })}
        </div>
      )}
      <div className="classic-tags">
        {profile.age && <span>{profile.age} y/o</span>}
        {profile.gender && <span>{profile.gender}</span>}
        {profile.sexuality && <span>{profile.sexuality}</span>}
        {profile.birthday && <span>{new Date(profile.birthday).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}</span>}
        {profile.timezone && <span>{profile.timezone.split("/").pop()?.replace(/_/g, " ")}</span>}
      </div>
      <div className="classic-bio" style={{ color: profile.bioColor }}>{profile.bio || "No bio yet."}</div>
      <div className="classic-socials">
        {iconLinks.map((link) => (
          <a key={link.id} href={safeExternalUrl(link.url)} target="_blank" rel="noreferrer">
            <img src={iconMap[link.type] || iconMap.website} alt={link.type} />
          </a>
        ))}
      </div>
      <div className="classic-features">
        {featureLinks.map((link) => (
          <a key={`feature-${link.id}`} className={featureClass(link.style)} href={safeExternalUrl(link.url)} target="_blank" rel="noreferrer" style={{ borderColor: link.color || profile.accent }}>
            <span>
              <strong>{link.label}</strong>
              {link.description && <small>{link.description}</small>}
            </span>
            <span className="classic-feature-action">
              <img src={iconMap[link.type] || iconMap.website} alt="" />
              <ArrowUpRight size={15} />
            </span>
          </a>
        ))}
      </div>
      {profile.bgAudio && profile.showAudioPlayer && (
        <div className="classic-player">
          <span><Play size={15} fill="currentColor" /></span>
          <div>
            <strong>{profile.bgAudioName || fileTitle(profile.bgAudio.split("/").pop()?.split("?")[0] || "Profile audio")}</strong>
            <small>Profile audio</small>
          </div>
        </div>
      )}
    </div>
  );
}

function EffectLayer({ effect, scope = "card" }: { effect: ProfileEffect; scope?: "card" | "screen" }) {
  if (effect === "none") return null;
  return (
    <div className={`classic-effect classic-effect-${effect} classic-effect-${scope}`} aria-hidden="true">
      {Array.from({ length: effect === "rain" ? 42 : 28 }).map((_, index) => (
        <span
          key={index}
          style={{
            "--i": index,
            "--size": `${2 + (index % 4)}px`,
            "--speed": `${8 + (index % 6) * 0.8}s`,
            "--rain-speed": `${0.72 + (index % 5) * 0.08}s`,
            "--rain-height": `${32 + (index % 5) * 8}px`,
            "--twinkle-speed": `${2 + (index % 6) * 0.3}s`,
            "--drift": `${-18 + (index % 7) * 8}px`,
            "--left": `${3 + ((index * 3.4) % 94)}%`,
            "--star-top": `${7 + ((index * 3.1) % 78)}%`,
          } as any}
        />
      ))}
    </div>
  );
}

function classicStyles(profile: ProfileData, meta: ProfileMeta) {
  return `
    ${meta.customFontUrl ? `@font-face { font-family: "SoftcardCustomFont"; src: url("${meta.customFontUrl}") format("truetype"); font-display: swap; }` : ""}
    .classic-loading {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #05060a;
      color: white;
      font-weight: 900;
    }
    .classic-hub,
    .classic-editor {
      min-height: 100vh;
      color: white;
      cursor: ${meta.cursorUrl ? `url("${meta.cursorUrl}") 8 8, auto` : "auto"};
      background:
        radial-gradient(circle at 50% -10%, rgba(169,112,255,0.16), transparent 34%),
        #05060a;
    }
    .classic-hub-shell {
      min-height: 100vh;
      width: min(980px, calc(100vw - 36px));
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    }
    .classic-hub-nav {
      min-height: 76px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .classic-hub-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding-bottom: 80px;
    }
    .classic-kicker {
      color: ${profile.accent};
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: 0.18em;
    }
    .classic-hub h1 {
      margin-top: 12px;
      font-size: clamp(38px, 7vw, 72px);
      line-height: 0.98;
      letter-spacing: -0.04em;
    }
    .classic-hub h1 span {
      color: ${profile.accent};
    }
    .classic-avatar-ring {
      width: 250px;
      height: 250px;
      margin: 34px 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.045);
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 30px 90px rgba(0,0,0,0.34);
    }
    .classic-avatar-ring img {
      width: 138px;
      height: 138px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid ${profile.accent};
      padding: 4px;
    }
    .classic-hub-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .classic-url-card {
      margin-top: 26px;
      min-width: min(460px, 100%);
      padding: 12px;
      border-radius: 14px;
      background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .classic-url-card span {
      color: rgba(255,255,255,0.62);
      font-size: 14px;
    }
    .classic-url-card button,
    .classic-ghost,
    .classic-primary,
    .classic-secondary,
    .classic-back,
    .classic-tabs button,
    .classic-tools button,
    .classic-inline-input button {
      min-height: 40px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.055);
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 12px;
      font-weight: 850;
      text-decoration: none;
    }
    .classic-primary {
      border: 0;
      background: linear-gradient(135deg, #ffffff, #d8caff);
      color: #07080d;
      min-height: 46px;
      padding: 0 16px;
    }
    .classic-editor {
      display: grid;
      grid-template-columns: 420px minmax(0, 1fr);
      overflow: hidden;
    }
    .classic-sidebar {
      height: 100vh;
      overflow-y: auto;
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025)), #0b0c13;
      border-right: 1px solid rgba(255,255,255,0.1);
      padding: 22px;
    }
    .classic-editor-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 18px;
    }
    .classic-save {
      flex: 1;
    }
    .classic-tabs {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 6px;
      margin-bottom: 18px;
      padding: 5px;
      border-radius: 14px;
      background: rgba(255,255,255,0.045);
      border: 1px solid rgba(255,255,255,0.075);
    }
    .classic-tabs button {
      min-height: 42px;
      flex-direction: column;
      gap: 4px;
      padding: 0;
      font-size: 10px;
      color: rgba(255,255,255,0.62);
      background: transparent;
    }
    .classic-tabs button.is-active {
      background: ${profile.accent};
      color: white;
      border-color: transparent;
    }
    .classic-panel {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding-bottom: 34px;
    }
    .classic-field {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .classic-field > span {
      color: rgba(255,255,255,0.48);
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .classic-field small,
    .classic-muted {
      color: rgba(255,255,255,0.48);
      font-size: 12px;
    }
    .classic-field input,
    .classic-field select,
    .classic-field textarea,
    .classic-link-card input,
    .classic-link-card select {
      width: 100%;
      min-height: 44px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background-color: #22232b;
      color: white;
      outline: 0;
      padding: 11px 12px;
    }
    .classic-field select,
    .classic-link-card select {
      color-scheme: dark;
      appearance: auto;
      background: #22232b !important;
      color: #ffffff !important;
    }
    .classic-field option,
    .classic-link-card option {
      background-color: #11131b !important;
      color: #ffffff !important;
    }
    .classic-field textarea {
      min-height: 92px;
      resize: vertical;
      line-height: 1.5;
    }
    .classic-field input:focus,
    .classic-field select:focus,
    .classic-field textarea:focus,
    .classic-link-card input:focus,
    .classic-link-card select:focus {
      border-color: ${profile.accent};
      box-shadow: 0 0 0 4px ${profile.accent}22;
    }
    .classic-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .classic-inline-input {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 42px;
      gap: 8px;
    }
    .classic-status {
      font-size: 12px;
      font-weight: 800;
      color: rgba(255,255,255,0.56);
    }
    .classic-status.available { color: #46d39a; }
    .classic-status.taken,
    .classic-status.reserved,
    .classic-status.invalid { color: #ff8f8f; }
    .classic-avatar-edit {
      display: grid;
      grid-template-columns: 86px minmax(0, 1fr);
      gap: 14px;
      align-items: stretch;
    }
    .classic-avatar-edit img {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid ${profile.accent};
      padding: 3px;
      background: rgba(255,255,255,0.04);
    }
    .classic-upload {
      position: relative;
      min-height: 92px;
      border: 1px dashed rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.04);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 7px;
      text-align: center;
      color: rgba(255,255,255,0.68);
      padding: 12px;
    }
    .classic-upload input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .classic-upload strong {
      font-size: 12px;
    }
    .classic-upload span {
      font-size: 10px;
      line-height: 1.35;
      opacity: 0.66;
    }
    .classic-link-card,
    .classic-stat {
      position: relative;
      padding: 14px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.045);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .classic-remove {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      border: 1px solid rgba(255,77,77,0.26);
      background: rgba(255,77,77,0.12);
      color: #ff9a9a;
      border-radius: 9px;
    }
    .classic-tools {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .classic-tools label,
    .classic-check {
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.72);
      font-size: 13px;
      font-weight: 750;
    }
    .classic-tools input,
    .classic-check input {
      width: 16px;
      height: 16px;
      accent-color: ${profile.accent};
    }
    .classic-add {
      width: 100%;
      min-height: 44px;
      border-style: dashed;
    }
    .classic-theme-grid,
    .classic-stat-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .classic-theme {
      min-height: 78px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.14);
      color: white;
      text-align: left;
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 3px;
    }
    .classic-theme span,
    .classic-stat strong {
      font-weight: 900;
    }
    .classic-theme small,
    .classic-stat span {
      color: rgba(255,255,255,0.66);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .classic-stat strong {
      font-size: 28px;
      line-height: 1;
    }
    .classic-top-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 9px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .classic-top-link:last-child {
      border-bottom: 0;
    }
    .classic-top-link span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: rgba(255,255,255,0.72);
      font-size: 13px;
    }
    .classic-preview {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      isolation: isolate;
      padding: 34px;
      background: radial-gradient(circle at 50% 16%, rgba(169,112,255,0.13), transparent 31%), #05060a;
    }
    .classic-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
      opacity: ${meta.bgOpacity};
      filter: blur(${meta.bgBlur}px);
      transform: ${meta.bgBlur > 0 ? "scale(1.04)" : "none"};
    }
    .classic-profile-card {
      position: relative;
      z-index: 5;
      width: 90%;
      max-width: 420px;
      margin: auto;
      flex: 0 0 auto;
      padding: 28px 20px;
      border-radius: 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      overflow: hidden;
      background: ${profile.showGlass ? "rgba(0,0,0,0.45)" : "transparent"};
      backdrop-filter: ${profile.showGlass ? "blur(25px)" : "none"};
      border: ${profile.showGlass ? "1px solid rgba(255,255,255,0.1)" : "0"};
      box-shadow: ${profile.showGlass ? "0 25px 50px rgba(0,0,0,0.6)" : "none"};
    }
    .classic-profile-card > :not(.classic-effect) {
      position: relative;
      z-index: 1;
    }
    .classic-view-count {
      position: absolute;
      top: 18px;
      right: 22px;
      z-index: 5;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: rgba(255,255,255,0.85);
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      letter-spacing: 0.02em;
    }
    .classic-profile-card .classic-view-count {
      z-index: 20;
    }
    .classic-pfp {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid ${profile.accent};
      box-shadow: 0 0 30px ${profile.accent}44;
      padding: 3px;
      margin-bottom: 10px;
    }
    .classic-name {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 4px;
      letter-spacing: -0.03em;
      font-family: ${meta.customFontUrl ? '"SoftcardCustomFont"' : profile.font}, ${profile.font}, sans-serif;
      position: relative;
    }
    .name-effect-rainbow {
      background: linear-gradient(100deg, #ff4f8b 0%, #ffd166 18%, #72e0b1 38%, #55d6ff 58%, #a970ff 78%, #ff4f8b 100%);
      background-size: 320% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 14px ${profile.accent}35);
      animation: classic-rainbow 5.5s ease-in-out infinite;
    }
    .name-effect-fuzzy {
      text-shadow:
        0 0 4px currentColor,
        0 0 14px ${profile.accent},
        1px 0 8px rgba(85,214,255,0.34),
        -1px 0 8px rgba(255,79,139,0.32);
      animation: classic-fuzzy 2.4s ease-in-out infinite;
    }
    .name-effect-typewriter {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      border-right: 2px solid currentColor;
      vertical-align: bottom;
      max-width: 100%;
      animation: classic-type 4.2s steps(22, end) infinite, classic-caret 0.8s step-end infinite;
    }
    .name-effect-glitch {
      text-shadow: 0 0 16px ${profile.accent}44;
      animation: classic-glitch-base 3.2s steps(1, end) infinite;
    }
    .name-effect-glitch::before,
    .name-effect-glitch::after {
      content: attr(data-name);
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
    }
    .name-effect-glitch::before {
      color: #ff4f8b;
      transform: translateX(-2px);
      clip-path: inset(0 0 48% 0);
      animation: classic-glitch-slice 2.6s steps(1, end) infinite;
    }
    .name-effect-glitch::after {
      color: #55d6ff;
      transform: translateX(2px);
      clip-path: inset(52% 0 0 0);
      animation: classic-glitch-slice 2.6s steps(1, end) infinite reverse;
    }
    .name-effect-sparkles {
      text-shadow: 0 0 12px ${profile.accent}40;
    }
    .name-effect-sparkles::after {
      content: "";
      position: absolute;
      inset: -16px -24px;
      pointer-events: none;
      background:
        radial-gradient(circle, #fff 0 1px, transparent 2px) 7% 35% / 18px 18px no-repeat,
        radial-gradient(circle, ${profile.accent} 0 1.5px, transparent 3px) 90% 12% / 20px 20px no-repeat,
        radial-gradient(circle, #fff 0 1px, transparent 2px) 82% 88% / 16px 16px no-repeat,
        radial-gradient(circle, ${profile.accent} 0 1px, transparent 2px) 19% 83% / 14px 14px no-repeat,
        linear-gradient(115deg, transparent 0 44%, rgba(255,255,255,0.9) 49%, transparent 54% 100%);
      background-size: 18px 18px, 20px 20px, 16px 16px, 14px 14px, 240% 100%;
      filter: drop-shadow(0 0 7px ${profile.accent});
      opacity: 0.72;
      animation: classic-sparkle 2.8s ease-in-out infinite;
    }
    .classic-badges,
    .classic-tags,
    .classic-socials {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 7px;
      margin-top: 10px;
    }
    .classic-badges {
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.08);
      margin-bottom: 10px;
      margin-top: 0;
    }
    .classic-badge,
    .classic-tags span {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      font-size: 11px;
      font-weight: 800;
    }
    .classic-badge {
      position: relative;
      width: 14px;
      height: 14px;
      justify-content: center;
      padding: 0;
    }
    .classic-tags span {
      gap: 5px;
      border: 1px solid rgba(255,255,255,0.05);
      background: rgba(255,255,255,0.05);
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 600;
      color: rgba(255,255,255,0.6);
    }
    .classic-tags {
      gap: 4px;
      margin-top: 0;
      margin-bottom: 10px;
      width: 100%;
    }
    .classic-bio {
      max-width: 85%;
      margin-top: 0;
      margin-bottom: 14px;
      font-size: 14px;
      line-height: 1.35;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .classic-socials {
      gap: 14px;
      margin-top: 2px;
    }
    .classic-socials a {
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 0.75;
      transition: 0.3s;
    }
    .classic-socials a:hover {
      opacity: 1;
      transform: scale(1.1) translateY(-2px);
    }
    .classic-socials img {
      width: 24px;
      height: 24px;
    }
    .classic-features {
      width: 100%;
      max-width: 310px;
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sx-feature-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      text-decoration: none;
      padding: 11px 13px;
      font-size: 13px;
      font-weight: 700;
      text-align: left;
    }
    .sx-feature-link span {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sx-feature-link strong,
    .sx-feature-link small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sx-feature-link strong {
      font-size: 13px;
      line-height: 1.2;
    }
    .sx-feature-link small {
      opacity: 0.6;
      font-size: 11px;
      line-height: 1.25;
    }
    .classic-feature-action {
      display: inline-flex;
      align-items: center;
      flex-direction: row;
      gap: 8px;
      flex-shrink: 0;
    }
    .classic-feature-action img {
      width: 18px;
      height: 18px;
      opacity: 0.84;
    }
    .sx-feature-glass { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.12); }
    .sx-feature-filled { background: ${profile.accent}; border-color: ${profile.accent}; }
    .sx-feature-outline { background: transparent; border-color: currentColor; }
    .sx-feature-soft { background: ${profile.accent}24; border-color: ${profile.accent}66; }
    .classic-player {
      width: 100%;
      max-width: 310px;
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      text-align: left;
    }
    .classic-player > span {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: ${profile.accent};
      color: white;
      box-shadow: 0 8px 20px ${profile.accent}33;
      flex: 0 0 auto;
    }
    .classic-player div {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .classic-player strong {
      font-size: 12px;
      font-weight: 800;
      color: rgba(255,255,255,0.9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .classic-player small {
      color: rgba(255,255,255,0.46);
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    .classic-effect {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      border-radius: inherit;
      z-index: 0;
    }
    .classic-effect-screen {
      position: absolute;
      inset: 0;
      border-radius: 0;
      z-index: 2;
    }
    .classic-effect-screen::before,
    .classic-effect-screen::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .classic-effect span {
      position: absolute;
      left: var(--left, 50%);
      top: -40px;
      opacity: 0;
    }
    .classic-effect-snow span {
      width: var(--size, 4px);
      height: var(--size, 4px);
      border-radius: 999px;
      background: rgba(255,255,255,0.92);
      box-shadow: 0 0 12px rgba(255,255,255,0.52);
      animation: classic-fall var(--speed, 9s) linear infinite;
      animation-delay: calc(var(--i, 0) * -0.43s);
    }
    .classic-effect-snow::before {
      background:
        radial-gradient(circle at 20% 15%, rgba(255,255,255,0.24), transparent 18%),
        radial-gradient(circle at 80% 8%, rgba(85,214,255,0.16), transparent 18%);
      opacity: 0.72;
    }
    .classic-effect-rain span {
      width: 1px;
      height: var(--rain-height, 40px);
      border-radius: 999px;
      background: linear-gradient(180deg, transparent, rgba(160,205,255,0.88));
      box-shadow: 0 0 8px rgba(85,214,255,0.25);
      transform: rotate(11deg);
      animation: classic-rain var(--rain-speed, 0.86s) linear infinite;
      animation-delay: calc(var(--i, 0) * -0.12s);
    }
    .classic-effect-rain::before {
      background: linear-gradient(180deg, rgba(10,18,32,0.08), rgba(70,120,170,0.18) 72%, rgba(255,255,255,0.08));
    }
    .classic-effect-rain::after {
      background: radial-gradient(ellipse at 50% 100%, rgba(170,205,255,0.2), transparent 56%);
      opacity: 0.55;
    }
    .classic-effect-night {
      background:
        radial-gradient(circle at 72% 18%, rgba(255,251,214,0.95) 0 15px, rgba(255,251,214,0.18) 16px 34px, transparent 35px),
        radial-gradient(circle at 70% 18%, rgba(255,255,255,0.2), transparent 9%),
        linear-gradient(180deg, rgba(4,7,18,0.42), rgba(3,5,12,0.2));
    }
    .classic-effect-night span {
      width: var(--size, 2px);
      height: var(--size, 2px);
      border-radius: 999px;
      background: rgba(255,255,255,0.95);
      top: var(--star-top, 28%);
      box-shadow: 0 0 10px rgba(255,255,255,0.62);
      animation: classic-twinkle var(--twinkle-speed, 2.8s) ease-in-out infinite;
      animation-delay: calc(var(--i, 0) * -0.21s);
    }
    .classic-effect-night::after {
      background: radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.32) 100%);
    }
    .classic-effect-ctv {
      background:
        repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 5px),
        linear-gradient(90deg, rgba(255,0,80,0.08), rgba(0,255,210,0.06));
      mix-blend-mode: screen;
      opacity: 0.86;
      animation: classic-ctv 0.22s steps(2,end) infinite;
    }
    .classic-effect-ctv::before {
      background:
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0 1px, transparent 1.5px),
        radial-gradient(circle at 75% 65%, rgba(255,255,255,0.04) 0 1px, transparent 1.5px);
      background-size: 7px 7px, 9px 9px;
      animation: classic-noise 0.36s steps(2,end) infinite;
    }
    .classic-effect-ctv::after {
      background: radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.26));
    }
    @keyframes classic-rainbow {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes classic-fuzzy {
      0%, 100% { filter: blur(0); transform: translate3d(0,0,0); }
      45% { filter: blur(0.55px); transform: translate3d(0.4px,-0.2px,0); }
      62% { filter: blur(0.2px); transform: translate3d(-0.4px,0.2px,0); }
    }
    @keyframes classic-type {
      0%, 12% { max-width: 0; }
      52%, 78% { max-width: 100%; }
      100% { max-width: 0; }
    }
    @keyframes classic-caret { 50% { border-color: transparent; } }
    @keyframes classic-glitch-base {
      0%, 88%, 100% { transform: none; }
      90% { transform: skewX(-3deg); }
      92% { transform: skewX(2deg) translateX(1px); }
      94% { transform: none; }
    }
    @keyframes classic-glitch-slice {
      0%, 86%, 100% { opacity: 0; }
      88% { opacity: 0.8; transform: translate(-2px, -1px); }
      90% { opacity: 0.55; transform: translate(2px, 1px); }
      92% { opacity: 0.72; transform: translate(-1px, 0); }
      94% { opacity: 0; }
    }
    @keyframes classic-sparkle {
      0%, 100% { background-position: 7% 35%, 90% 12%, 82% 88%, 19% 83%, 180% 0; opacity: 0.42; }
      45% { background-position: 12% 28%, 86% 18%, 78% 84%, 22% 76%, 42% 0; opacity: 0.95; }
      70% { opacity: 0.55; }
    }
    @keyframes classic-fall {
      0% { opacity: 0; transform: translate3d(0,-30px,0) rotate(0deg); }
      12%, 88% { opacity: 0.82; }
      100% { opacity: 0; transform: translate3d(var(--drift, 24px), 112vh, 0) rotate(220deg); }
    }
    @keyframes classic-rain {
      0% { opacity: 0; transform: translate3d(44px,-60px,0) rotate(11deg); }
      14%, 82% { opacity: 0.86; }
      100% { opacity: 0; transform: translate3d(-48px,112vh,0) rotate(11deg); }
    }
    @keyframes classic-twinkle {
      0%, 100% { opacity: 0.24; transform: scale(0.82); }
      45% { opacity: 0.95; transform: scale(1.45); }
      70% { opacity: 0.42; }
    }
    @keyframes classic-ctv {
      0%, 100% { filter: hue-rotate(0deg); transform: translateX(0); }
      50% { filter: hue-rotate(18deg); transform: translateX(1px); }
    }
    @keyframes classic-noise {
      0% { transform: translate3d(0,0,0); opacity: 0.35; }
      100% { transform: translate3d(-2px,1px,0); opacity: 0.55; }
    }
    @media (max-width: 900px) {
      .classic-editor {
        grid-template-columns: 1fr;
        overflow: auto;
      }
      .classic-sidebar {
        height: auto;
        min-height: auto;
      }
      .classic-preview {
        min-height: 640px;
      }
      .classic-grid-2,
      .classic-theme-grid,
      .classic-stat-grid {
        grid-template-columns: 1fr;
      }
      .classic-tabs {
        overflow-x: auto;
      }
    }
  `;
}
