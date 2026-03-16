import Link from "next/link"

export default function Home() {
  return (
    <main className="h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">softcard.cc</h1>

        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <button className="px-6 py-3 bg-white text-black rounded-xl">
              Login
            </button>
          </Link>

          <Link href="/claim">
            <button className="px-6 py-3 bg-purple-600 rounded-xl">
              Claim Username
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}