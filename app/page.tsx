import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="main-container">
      {/* The background is handled in globals.css via the ::before selector */}
      
      <nav suppressHydrationWarning>
        <div className="logo">♡ softcard.cc</div>
        <Link href="/login">
          <button className="dashboard">Dashboard →</button>
        </Link>
      </nav>

      <div className="hero">
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
      </div>
    </main>
  );
}
