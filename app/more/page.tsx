import Link from "next/link";
import { ArrowLeft, BadgeCheck, Brush, Link as LinkIcon, LockKeyhole, Music, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: LinkIcon,
    title: "Social links",
    text: "Add, reorder, duplicate, hide, or feature links as large buttons from the dashboard.",
  },
  {
    icon: Brush,
    title: "Profile styling",
    text: "Tune avatar, display name, bio, tags, colors, background image, video, gradient, and glass mode.",
  },
  {
    icon: BadgeCheck,
    title: "Badge hover text",
    text: "User, developer, and staff badges show clear descriptions when someone hovers them.",
  },
  {
    icon: Music,
    title: "Media support",
    text: "Use HTTPS image, video, and audio URLs while keeping public rendering filtered.",
  },
  {
    icon: LockKeyhole,
    title: "Protected tools",
    text: "Dashboard routes require a real Supabase user session and admin tools use an httpOnly session.",
  },
  {
    icon: ShieldCheck,
    title: "Safer output",
    text: "Profile links, colors, fonts, and media are normalized before they appear on public pages.",
  },
];

export default function MorePage() {
  return (
    <main className="sf-root">
      <nav className="sf-nav">
        <Link href="/" className="sf-auth-back">
          <ArrowLeft size={16} />
          Home
        </Link>
        <Link href="/" className="sf-brand">
          softcard.cc
        </Link>
        <Link href="/login" className="sf-nav-button">
          Create
        </Link>
      </nav>

      <section className="sf-feature-band">
        <div className="sf-section-head">
          <p>Features</p>
          <h2>A cleaner profile builder with the controls users actually expect.</h2>
        </div>

        <div className="sf-feature-grid">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <article className="sf-feature-card" key={item.title}>
                <Icon size={20} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
