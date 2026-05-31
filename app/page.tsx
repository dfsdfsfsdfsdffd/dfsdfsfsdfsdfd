"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  Heart,
  Link as LinkIcon,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const features = [
  { icon: LinkIcon, title: "Featured links", text: "Turn important socials into large buttons without duplicating the small icon." },
  { icon: Palette, title: "Live editor", text: "Change avatar, bio, colors, backgrounds, audio, tags, and link order from one clean panel." },
  { icon: BadgeCheck, title: "Badge tooltips", text: "Badges explain what they mean on hover and stay controlled from the admin panel." },
  { icon: ShieldCheck, title: "Safer defaults", text: "Public URLs, colors, media, admin access, and signup input are validated before use." },
];

export default function Home() {
  return (
    <main className={`sf-root ${font.className}`}>
      <nav className="sf-nav">
        <Link href="/" className="sf-brand">
          <Heart size={18} fill="currentColor" />
          softcard.cc
        </Link>

        <div className="sf-nav-links">
          <Link href="/">Home</Link>
          <Link href="/more">Features</Link>
          <Link href="/login">Dashboard</Link>
          <Link href="/more">Support</Link>
        </div>

        <Link href="/login" className="sf-nav-button">
          Login
        </Link>
      </nav>

      <section className="sf-hero">
        <div className="sf-hero-copy">
          <p className="sf-kicker">
            <Sparkles size={14} />
            Built for clean personal profiles
          </p>
          <h1>SOFTCARD</h1>
          <p>
            A polished profile page for socials, badges, media, and one memorable
            softcard.cc link.
          </p>

          <div className="sf-actions">
            <Link href="/login" className="sf-primary">
              Create page
              <ArrowRight size={17} />
            </Link>
            <Link href="/more" className="sf-secondary">
              See features
            </Link>
          </div>
        </div>

        <div className="sf-preview" aria-hidden="true">
          <div className="sf-preview-top">
            <span />
            <span />
            <span />
          </div>
          <div className="sf-profile-mini">
            <div className="sf-mini-views">
              <Eye size={13} />
              1.2k
            </div>
            <img src="https://i.imgur.com/1X6g1YH.jpeg" alt="" />
            <strong>akuryo</strong>
            <div className="sf-mini-badges">
              <ShieldCheck size={14} />
              <BadgeCheck size={14} />
              <Sparkles size={14} />
            </div>
            <p>rockstar</p>
            <div className="sf-mini-link">
              <span>
                <b>softcard.cc</b>
                <small>MY SITE</small>
              </span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </section>

      <section className="sf-feature-band">
        <div className="sf-section-head">
          <p>More control, less clutter</p>
          <h2>Everything users need without making the dashboard messy.</h2>
        </div>

        <div className="sf-feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="sf-feature-card">
                <Icon size={20} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>

        <div className="sf-security-strip">
          <LockKeyhole size={18} />
          Server signup route, httpOnly admin session, same-origin admin checks, safer public link rendering.
        </div>
      </section>
    </main>
  );
}
