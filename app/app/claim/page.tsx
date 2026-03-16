"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Claim() {
  const [username, setUsername] = useState("")
  const [available, setAvailable] = useState(null)

  const checkUsername = async () => {
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)

    if (data.length === 0) setAvailable(true)
    else setAvailable(false)
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">

      <h1 className="text-3xl mb-6">Claim your username</h1>

      <div className="flex gap-2">
        <span className="text-gray-400">softcard.cc/</span>

        <input
          className="bg-zinc-900 px-3 py-2 rounded"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />
      </div>

      <button
        onClick={checkUsername}
        className="mt-4 px-6 py-2 bg-purple-600 rounded"
      >
        Check
      </button>

      {available === true && <p className="text-green-400 mt-3">Available ✔</p>}
      {available === false && <p className="text-red-400 mt-3">Taken ✖</p>}

    </div>
  )
}