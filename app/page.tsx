"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="main">

      <nav className="nav">
        <div className="logo">♡ softcard.cc</div>

        <Link href="/login">
          <button className="dashboard">Dashboard →</button>
        </Link>
      </nav>

  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    
      
      <section className="hero">

        <h1>
          Welcome to <br />
          <span>Softcard Biolink</span>
        </h1>

        <p>
          Create a single link for everything you share online — socials,
          projects, and content — all organized in one beautiful profile.
        </p>

        <div className="buttons">
          <Link href="/login">
            <button className="primary">Create Your Page →</button>
          </Link>

          <button className="secondary">Learn More</button>
        </div>

      </section>

    </main>
  );
}
