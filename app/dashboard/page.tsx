"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  CopyPlus,
  Layers,
  Link as LinkIcon,
  LogOut,
  MoveDown,
  MoveUp,
  Palette,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  User,
  X,
  Code,
} from "lucide-react";

type SocialLink = {
  id: number;
  type: string;
  url: string;
  label?: string;
  description?: string;
  color?: string;
  featured?: boolean;
  enabled?: boolean;
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
  bgType: "gradient" | "video" | "image";
  gradient: string;
  bgVideo: string;
  bgImage: string;
  bgAudio: string;
  showGlass: boolean;
  views: number;
};

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
  user: "Verified Softcard user",
  dev: "Softcard developer",
  staff: "Softcard staff",
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
  bioColor: "#d8d0ff",
  font: "Inter",
  bgType: "gradient",
  gradient: "linear-gradient(135deg, #151026 0%, #04050a 100%)",
  bgVideo: "",
  bgImage: "",
  bgAudio: "",
  showGlass: true,
  views: 0,
};

const themePresets = [
  { name: "Night", accent: "#a970ff", gradient: "linear-gradient(135deg, #151026 0%, #04050a 100%)" },
  { name: "Rose", accent: "#ff6bbd", gradient: "linear-gradient(135deg, #2a0719 0%, #050106 100%)" },
  { name: "Ocean", accent: "#4ddcff", gradient: "linear-gradient(135deg, #042333 0%, #02060a 100%)" },
  { name: "Mono", accent: "#ffffff", gradient: "linear-gradient(135deg, #1a1d24 0%, #030406 100%)" },
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

function safeHex(value: unknown) {
  return typeof value === "string" && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value) ? value : "";
}

function normalizeLinks(links: SocialLink[]) {
  return links
    .map((link) => ({
      ...link,
      url: safeExternalUrl(link.url),
      label: (link.label || "").trim().slice(0, 40),
      description: (link.description || "").trim().slice(0, 80),
      color: safeHex(link.color),
      enabled: link.enabled !== false,
      featured: Boolean(link.featured),
    }))
    .filter((link) => link.url);
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  const [mode, setMode] = useState<"home" | "editor">("home");
  const [tab, setTab] = useState<"profile" | "links" | "style" | "badges">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [badges, setBadges] = useState<Badges>({ user: true, dev: false, staff: false });

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (data) {
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
          bgAudio: data.audio_url || "",
          showGlass: data.show_glass_card ?? true,
          views: data.views || 0,
        });
        setLinks(Array.isArray(data.links) ? data.links : []);
        setBadges(data.badges || { user: true, dev: false, staff: false });
      }

      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  function updateProfile<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function updateLink(index: number, key: keyof SocialLink, value: string | boolean) {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, [key]: value } : link)));
  }

  function addLink() {
    setLinks((current) => [
      ...current,
      { id: Date.now(), type: "website", url: "", label: "", description: "", color: "", enabled: true, featured: false },
    ]);
  }

  function removeLink(id: number) {
    setLinks((current) => current.filter((link) => link.id !== id));
  }

  function moveLink(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const copy = [...links];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setLinks(copy);
  }

  function duplicateLink(index: number) {
    const link = links[index];
    if (!link) return;
    const copy = [...links];
    copy.splice(index + 1, 0, { ...link, id: Date.now(), label: link.label ? `${link.label} copy` : "" });
    setLinks(copy);
  }

  async function saveChanges() {
    if (!supabase) return;
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found.");

      const backgroundValue =
        profile.bgType === "gradient" ? profile.gradient : profile.bgType === "video" ? profile.bgVideo : profile.bgImage;

      const { error } = await supabase
        .from("profiles")
        .update({
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
          background_value: backgroundValue,
          audio_url: profile.bgAudio,
          show_glass_card: profile.showGlass,
          setup_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;
      alert("Published successfully.");
    } catch (error: any) {
      alert(error.message || "Could not publish.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  function copyUrl() {
    if (!profile.username) return;
    navigator.clipboard.writeText(`https://softcard.cc/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (loading) {
    return (
      <main className="sc-screen">
        <div className="sc-loader">Loading Softcard...</div>
      </main>
    );
  }

  if (mode === "home") {
    return (
      <main className="sc-dash-home">
        <button className="sc-logout" onClick={logout} aria-label="Log out">
          <LogOut size={18} />
        </button>

        <section className="sc-hub">
          <p className="sc-eyebrow">Dashboard</p>
          <h1>Welcome back, {profile.username || "creator"}</h1>

          <div className="sc-hub-card">
            <img src={profile.avatar} alt="" />
            <div>
              <strong>{profile.name || "Your profile"}</strong>
              <span>{profile.bio || "No bio yet."}</span>
            </div>
          </div>

          <div className="sc-hub-actions">
            <button onClick={() => setMode("editor")}>
              <Layers size={17} />
              Edit page
            </button>
            <a href={`/${profile.username}`} target="_blank" rel="noreferrer">
              <ArrowUpRight size={17} />
              View page
            </a>
          </div>

          <div className="sc-url-bar">
            <span>softcard.cc/{profile.username || "username"}</span>
            <button onClick={copyUrl}>{copied ? <Check size={15} /> : <Copy size={15} />}</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="sc-editor">
      <aside className="sc-editor-side">
        <div className="sc-editor-top">
          <button className="sc-ghost" onClick={() => setMode("home")}>
            <X size={16} />
            Close
          </button>
          <button className="sc-save" onClick={saveChanges} disabled={saving}>
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>

        <div className="sc-tabs">
          <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
            <User size={14} />
            Profile
          </button>
          <button className={tab === "links" ? "active" : ""} onClick={() => setTab("links")}>
            <LinkIcon size={14} />
            Links
          </button>
          <button className={tab === "style" ? "active" : ""} onClick={() => setTab("style")}>
            <Palette size={14} />
            Style
          </button>
          <button className={tab === "badges" ? "active" : ""} onClick={() => setTab("badges")}>
            <ShieldCheck size={14} />
            Badges
          </button>
        </div>

        {tab === "profile" && (
          <section className="sc-panel">
            <label>
              Avatar URL
              <input value={profile.avatar} onChange={(event) => updateProfile("avatar", event.target.value)} />
            </label>
            <label>
              Display name
              <input value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} />
            </label>
            <label>
              Bio
              <textarea rows={4} maxLength={150} value={profile.bio} onChange={(event) => updateProfile("bio", event.target.value)} />
            </label>
            <div className="sc-grid-2">
              <label>
                Age
                <input value={profile.age} onChange={(event) => updateProfile("age", event.target.value.slice(0, 2))} />
              </label>
              <label>
                Birthday
                <input type="date" value={profile.birthday} onChange={(event) => updateProfile("birthday", event.target.value)} />
              </label>
            </div>
            <div className="sc-grid-2">
              <label>
                Gender
                <input value={profile.gender} onChange={(event) => updateProfile("gender", event.target.value)} />
              </label>
              <label>
                Sexuality
                <input value={profile.sexuality} onChange={(event) => updateProfile("sexuality", event.target.value)} />
              </label>
            </div>
            <label>
              Timezone
              <input value={profile.timezone} onChange={(event) => updateProfile("timezone", event.target.value)} placeholder="America/New_York" />
            </label>
          </section>
        )}

        {tab === "links" && (
          <section className="sc-panel">
            <button className="sc-add" onClick={addLink}>
              <Plus size={16} />
              Add link
            </button>

            {links.map((link, index) => (
              <article className="sc-link-card" key={link.id}>
                <button className="sc-delete" onClick={() => removeLink(link.id)} aria-label="Remove link">
                  <Trash2 size={15} />
                </button>

                <label>
                  Type
                  <span className="sc-select">
                    <select value={link.type} onChange={(event) => updateLink(index, "type", event.target.value)}>
                      {Object.keys(iconMap).map((key) => (
                        <option key={key} value={key}>
                          {key.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={17} />
                  </span>
                </label>

                <label>
                  Label
                  <input value={link.label || ""} maxLength={40} onChange={(event) => updateLink(index, "label", event.target.value)} />
                </label>

                <label>
                  URL
                  <input value={link.url} onChange={(event) => updateLink(index, "url", event.target.value)} placeholder="https://..." />
                </label>

                <label>
                  Featured description
                  <input value={link.description || ""} maxLength={80} onChange={(event) => updateLink(index, "description", event.target.value)} />
                </label>

                <div className="sc-grid-2">
                  <label>
                    Accent
                    <input value={link.color || ""} maxLength={7} onChange={(event) => updateLink(index, "color", event.target.value)} placeholder="#a970ff" />
                  </label>
                  <label>
                    Pick
                    <input type="color" value={safeHex(link.color) || profile.accent} onChange={(event) => updateLink(index, "color", event.target.value)} />
                  </label>
                </div>

                <div className="sc-link-tools">
                  <button disabled={index === 0} onClick={() => moveLink(index, -1)}>
                    <MoveUp size={14} />
                    Up
                  </button>
                  <button disabled={index === links.length - 1} onClick={() => moveLink(index, 1)}>
                    <MoveDown size={14} />
                    Down
                  </button>
                  <button onClick={() => duplicateLink(index)}>
                    <CopyPlus size={14} />
                    Copy
                  </button>
                </div>

                <div className="sc-switches">
                  <label>
                    <input type="checkbox" checked={link.enabled !== false} onChange={(event) => updateLink(index, "enabled", event.target.checked)} />
                    Show
                  </label>
                  <label>
                    <input type="checkbox" checked={Boolean(link.featured)} onChange={(event) => updateLink(index, "featured", event.target.checked)} />
                    Large button
                  </label>
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === "style" && (
          <section className="sc-panel">
            <div className="sc-presets">
              {themePresets.map((preset) => (
                <button
                  key={preset.name}
                  style={{ background: preset.gradient }}
                  onClick={() => setProfile((current) => ({ ...current, accent: preset.accent, gradient: preset.gradient, bgType: "gradient" }))}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="sc-grid-2">
              <label>
                Accent
                <input type="color" value={profile.accent} onChange={(event) => updateProfile("accent", event.target.value)} />
              </label>
              <label>
                Name
                <input type="color" value={profile.nameColor} onChange={(event) => updateProfile("nameColor", event.target.value)} />
              </label>
            </div>

            <label>
              Bio color
              <input type="color" value={profile.bioColor.slice(0, 7)} onChange={(event) => updateProfile("bioColor", event.target.value)} />
            </label>

            <label>
              Background type
              <span className="sc-select">
                <select value={profile.bgType} onChange={(event) => updateProfile("bgType", event.target.value as ProfileData["bgType"])}>
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <ChevronDown size={17} />
              </span>
            </label>

            {profile.bgType === "gradient" && (
              <label>
                Gradient
                <input value={profile.gradient} onChange={(event) => updateProfile("gradient", event.target.value)} />
              </label>
            )}

            {profile.bgType === "image" && (
              <label>
                Image URL
                <input value={profile.bgImage} onChange={(event) => updateProfile("bgImage", event.target.value)} />
              </label>
            )}

            {profile.bgType === "video" && (
              <label>
                Video URL
                <input value={profile.bgVideo} onChange={(event) => updateProfile("bgVideo", event.target.value)} />
              </label>
            )}

            <label>
              Audio URL
              <input value={profile.bgAudio} onChange={(event) => updateProfile("bgAudio", event.target.value)} />
            </label>

            <label className="sc-inline-check">
              <input type="checkbox" checked={profile.showGlass} onChange={(event) => updateProfile("showGlass", event.target.checked)} />
              Glass profile card
            </label>
          </section>
        )}

        {tab === "badges" && (
          <section className="sc-panel">
            <div className="sc-note">
              <ShieldCheck size={18} />
              Badges are managed from the admin panel.
            </div>
          </section>
        )}
      </aside>

      <section className="sc-live-preview">
        <ProfilePreview profile={profile} links={links} badges={badges} />
      </section>
    </main>
  );
}

function ProfilePreview({ profile, links, badges }: { profile: ProfileData; links: SocialLink[]; badges: Badges }) {
  const visibleLinks = links.filter((link) => link.enabled !== false && safeExternalUrl(link.url));
  const featuredLinks = visibleLinks.filter((link) => link.featured && link.label);
  const iconLinks = visibleLinks.filter((link) => !link.featured);

  return (
    <div className="sc-profile-preview" style={{ background: profile.bgType === "gradient" ? profile.gradient : "#04050a" }}>
      {profile.bgType === "image" && safeExternalUrl(profile.bgImage) && <img className="sc-bg-media" src={safeExternalUrl(profile.bgImage)} alt="" />}
      {profile.bgType === "video" && safeExternalUrl(profile.bgVideo) && <video className="sc-bg-media" src={safeExternalUrl(profile.bgVideo)} muted loop autoPlay playsInline />}

      <div className={`sc-profile-card ${profile.showGlass ? "is-glass" : ""}`}>
        <img className="sc-avatar" src={profile.avatar} alt="" />
        <h2 style={{ color: profile.nameColor }}>{profile.name}</h2>

        {(badges.user || badges.dev || badges.staff) && (
          <div className="sc-badges">
            {badges.user && <span title={badgeInfo.user}><ShieldCheck size={14} color="#55a7ff" /></span>}
            {badges.dev && <span title={badgeInfo.dev}><Code size={14} color={profile.accent} /></span>}
            {badges.staff && <span title={badgeInfo.staff}><Star size={14} color="#f7b731" /></span>}
          </div>
        )}

        <div className="sc-tags">
          {profile.age && <span>{profile.age} y/o</span>}
          {profile.gender && <span>{profile.gender}</span>}
          {profile.sexuality && <span>{profile.sexuality}</span>}
          {profile.timezone && <span>{profile.timezone.split("/").pop()?.replace("_", " ")}</span>}
        </div>

        <p style={{ color: profile.bioColor }}>{profile.bio || "No bio yet."}</p>

        <div className="sc-icons">
          {iconLinks.map((link) => (
            <a key={link.id} href={safeExternalUrl(link.url)} target="_blank" rel="noreferrer">
              <img src={iconMap[link.type] || iconMap.website} alt={link.type} />
            </a>
          ))}
        </div>

        <div className="sc-featured-links">
          {featuredLinks.slice(0, 4).map((link) => (
            <a key={link.id} href={safeExternalUrl(link.url)} target="_blank" rel="noreferrer" style={{ borderColor: safeHex(link.color) || profile.accent }}>
              <span>
                <strong>{link.label}</strong>
                {link.description && <small>{link.description}</small>}
              </span>
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
