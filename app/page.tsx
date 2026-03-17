"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400","500","600","700"]
});

export default function Home() {
  return (
    <main className={`sc-main ${font.className}`}>

      <nav className="sc-nav">
        <div className="sc-logo">♡ softcard.cc</div>

        <Link href="/login">
          <button className="sc-dashboard-btn">Dashboard →</button>
        </Link>
      </nav>

      <section className="sc-hero">

        <div className="sc-glass-card">

          <h1 className="sc-title">
            Welcome to <br />
            <span>Softcard Biolink</span>
          </h1>

          <p className="sc-subtext">
            Create a single link for everything you share online — socials,
            projects, and content — all organized in one beautiful profile.
          </p>

          <div className="sc-buttons">
            <Link href="/login">
              <button className="sc-primary-btn">
                Create Your Page →
              </button>
            </Link>

            <button className="sc-secondary-btn">
              Learn More
            </button>
          </div>

        </div>

      </section>

    </main>
  );
}
