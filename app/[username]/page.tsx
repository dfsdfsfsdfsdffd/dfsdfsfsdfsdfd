export default async function ProfilePage({ params }: { params: { username: string } }) {
  // Logic to fetch user from Supabase using params.username
  // Then map through the links and display them as big buttons
  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-20 px-4">
      <div className="w-24 h-24 bg-zinc-800 rounded-full mb-4" /> {/* Avatar */}
      <h1 className="text-2xl font-bold text-white mb-8">@{params.username}</h1>
      
      <div className="w-full max-w-md space-y-4">
        {/* Example Link mapping */}
        <a href="#" className="block w-full p-4 bg-zinc-900 border border-zinc-800 text-center rounded-xl text-white hover:scale-[1.02] transition-transform">
          Twitter
        </a>
      </div>
    </div>
  );
}