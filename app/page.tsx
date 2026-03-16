"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {

  useEffect(() => {

    function lockZoom() {
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, user-scalable=no"
        );
      }
    }

    function disableZoom(event: KeyboardEvent) {
      if (event.ctrlKey && (event.key === '+' || event.key === '-' || event.key === '0')) {
        event.preventDefault();
      }
    }

    function preventScrollZoom(event: WheelEvent) {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    }

    lockZoom();

    document.addEventListener("wheel", preventScrollZoom, { passive: false });
    document.addEventListener("keydown", disableZoom);

    return () => {
      document.removeEventListener("wheel", preventScrollZoom);
      document.removeEventListener("keydown", disableZoom);
    };

  }, []);

  return (
    <main className="main-container">

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
