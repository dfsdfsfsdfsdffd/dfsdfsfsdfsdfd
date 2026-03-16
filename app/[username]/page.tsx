import { FaInstagram, FaTiktok, FaSpotify } from 'react-icons/fa'; // Install react-icons

export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="min-h-screen bg-[#e2e2e2] flex flex-col items-center justify-center p-4 font-sans">
      {/* Background Image/Overlay (Optional) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img src="/your-feather-bg.jpg" className="w-full h-full object-cover" alt="" />
      </div>

      <div className="z-10 flex flex-col items-center text-center">
        {/* Profile Image */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/50 mb-4 shadow-sm">
          <img src="/avatar.jpg" alt="profile" className="w-full h-full object-cover" />
        </div>

        {/* Username */}
        <h1 className="text-4xl font-bold text-zinc-700 tracking-tighter lowercase mb-1">
          {params.username}
        </h1>

        {/* Bio/Small Text */}
        <p className="text-zinc-500 text-sm mb-8">~♡</p>

        {/* Social Icons */}
        <div className="flex gap-6">
          <FaInstagram className="text-pink-300 text-3xl hover:opacity-70 cursor-pointer transition" />
          <FaTiktok className="text-pink-300 text-3xl hover:opacity-70 cursor-pointer transition" />
          <FaSpotify className="text-pink-300 text-3xl hover:opacity-70 cursor-pointer transition" />
        </div>

        {/* View Count (Optional) */}
        <div className="mt-12 flex items-center gap-2 text-zinc-400 text-xs">
          <span>👁 507</span>
        </div>
      </div>
    </div>
  );
}
