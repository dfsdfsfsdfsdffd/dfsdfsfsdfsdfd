"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
// Import the Heart icon
import { Heart } from "lucide-react";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400","500","600","700"]
});

export default function Home() {
  return (
    <main className={`sx-main ${font.className}`}>
      <nav className="sx-nav">
        {/* LOGO WITH HEART ICON */}
        <div className="sx-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={20} fill="#7000ff" color="#7000ff" /> 
          softcard.cc
        </div>

        <Link href="/login">
          <button className="sx-nav-btn">Dashboard →</button>
        </Link>
      </nav>

      <section className="sx-hero">
        <h1 className="sx-title">
          Build Your <span>Presence</span>
        </h1>

        <p className="sx-sub">
          One clean link for everything you are.
        </p>

        <div className="sx-actions">
          <Link href="/login">
            <button className="sx-primary">
              Create Page →
            </button>
          </Link>

          {/* LINK TO THE NEW MORE PAGE */}
          <Link href="/more">
            <button className="sx-secondary">
              Learn More
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
