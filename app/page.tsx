import React from 'react';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050306] text-white overflow-hidden selection:bg-pink-500/30">
      {/* LIGHT BEAM BACKGROUND */}
      <div className="fixed -top-[20%] -left-[20%] w-[140%] h-[140%] pointer-events-none z-0 opacity-70">
        <div 
          className="w-full h-full blur-[90px]"
          style={{
            background: 'linear-gradient(120deg, transparent 20%, rgba(255,80,160,0.35) 40%, rgba(255,120,200,0.25) 55%, transparent 70%)'
          }}
        />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 flex justify-between items-center px-8 md:px-[70px] py-7">
        <div className="text-[18px] font-semibold tracking-tight">
          ♡ softcard.cc
        </div>
        <button className="bg-gradient-to-br from-[#ff4fb3] to-[#ff86c6] px-[22px] py-[10px] rounded-[30px] text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8_25px_rgba(255,80,160,0.4)]">
          Dashboard →
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 h-[80vh] max-w-[850px] mx-auto">
        <h1 className="text-[48px] md:text-[64px] font-bold leading-[1.1] tracking-[-1px]">
          Welcome to <br />
          <span className="bg-gradient-to-r from-[#ff6fb8] to-[#ffc3e8] bg-clip-text text-transparent">
            Softcard Biolink
          </span>
        </h1>

        <p className="mt-[22px] text-[18px] text-[#d9c9d3] max-w-[650px] leading-relaxed">
          Create a single link for everything you share online — socials,
          projects, and content — all organized in one beautiful profile.
        </p>

        {/* BUTTONS */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button className="bg-gradient-to-br from-[#ff4fb3] to-[#ff86c6] px-8 py-[15px] rounded-[50px] text-[15px] font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(255,80,160,0.45)]">
            Create Your Page →
          </button>
          <button className="bg-transparent border border-white/20 px-8 py-[15px] rounded-[50px] text-[15px] font-medium transition-all duration-300 hover:bg-white/5">
            Learn More
          </button>
        </div>
      </section>
    </main>
  );
}
