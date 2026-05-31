"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { ArrowRight, Heart, Link as LinkIcon, ShieldCheck, Sparkles } from "lucide-react";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  const navItems = ["Home", "Features", "Dashboard", "Support", "Credits"];

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
      </section>
    </main>
  );
}
