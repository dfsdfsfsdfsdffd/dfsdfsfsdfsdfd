"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { ArrowRight, BadgeCheck, Heart, Link as LinkIcon, Palette, ShieldCheck, Sparkles } from "lucide-react";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  const navItems = ["Home", "Features", "Dashboard", "Support", "Credits"];
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const type = url.searchParams.get("type");

    if (code && (!type || type === "recovery")) {
      router.replace(`/reset-password?code=${encodeURIComponent(code)}`);
    }
  }, [router]);

  return (
    <main className={`sx-main ${font.className}`}>
      <nav className="sx-nav">
        <div className="sx-logo">
          <Heart size={18} fill="currentColor" />
          softcard.cc
        </div>

        <div className="sx-nav-links">
          {navItems.map((item, index) => (
            <a
              key={item}
              href={item === "Dashboard" ? "/login" : item === "Home" ? "/" : "/more"}
              className={index === 0 ? "is-active" : ""}
            >
              {item}
            </a>
          ))}
        </div>

        <Link href="/login">
          <button className="sx-nav-btn">Login</button>
        </Link>
      </nav>

      <section className="sx-hero">
        <div className="sx-kicker">
          <Sparkles size={14} />
          <span>Built for personal links</span>
        </div>

        <h1 className="sx-title">SOFTCARD</h1>

        <p className="sx-sub">
          A focused profile utility for socials, badges, media, and a clean softcard.cc link.
        </p>

        <div className="sx-actions">
          <Link href="/login">
            <button className="sx-primary">
              Create page
              <ArrowRight size={16} />
            </button>
          </Link>

          <Link href="/more">
            <button className="sx-secondary">Learn more</button>
          </Link>
        </div>

        <div className="sx-feature-grid">
          <div className="sx-feature">
            <LinkIcon size={18} />
            <span>Custom softcard.cc URL</span>
          </div>
          <div className="sx-feature">
            <Sparkles size={18} />
            <span>Live profile editor</span>
          </div>
          <div className="sx-feature">
            <ShieldCheck size={18} />
            <span>Protected dashboard</span>
          </div>
        </div>

        <div className="sx-product-grid">
          <div className="sx-product-card">
            <BadgeCheck size={20} />
            <h2>Badges that mean something</h2>
            <p>Verified, developer, and staff badges are admin-controlled and explain themselves on hover.</p>
          </div>
          <div className="sx-product-card">
            <Palette size={20} />
            <h2>Profiles with actual style</h2>
            <p>Theme presets, glass cards, background media, audio, colors, and featured links.</p>
          </div>
          <div className="sx-product-card">
            <ShieldCheck size={20} />
            <h2>Hardened by default</h2>
            <p>Protected dashboard, safer signup flow, sanitized public links, and locked-down admin tools.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
