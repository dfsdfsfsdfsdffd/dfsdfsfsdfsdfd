"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400","500","600","700"]
});

export default function Home() {
  return (
    <main className={`sx-main ${font.className}`}>

      <nav className="sx-nav">
        <div className="sx-logo">softcard.cc</div>

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

          <button className="sx-secondary">
            Learn More
          </button>
        </div>

      </section>

    </main>
  );
}
