"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400","500","600","700"]
});

export default function Home() {
  return (
    <main className={`sf-main ${font.className}`}>

      <nav className="sf-nav">
        <div className="sf-logo">softcard.cc</div>

        <Link href="/login">
          <button className="sf-nav-btn">Dashboard →</button>
        </Link>
      </nav>

      <section className="sf-hero">

        <div className="sf-glass">

          <h1 className="sf-title">
            Welcome to <br />
            <span>Softcard</span>
          </h1>

          <p className="sf-sub">
            A clean, beautiful way to share everything you do online.
          </p>

          <div className="sf-actions">
            <Link href="/login">
              <button className="sf-primary">
                Create Your Page
              </button>
            </Link>

            <button className="sf-secondary">
              Learn More
            </button>
          </div>

        </div>

      </section>

    </main>
  );
}
