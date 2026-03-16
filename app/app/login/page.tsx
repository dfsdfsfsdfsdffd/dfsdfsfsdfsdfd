"use client"

import { supabase } from "@/lib/supabase"
import { useState } from "react"

export default function Login() {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const login = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password
    })
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">

      <div className="space-y-3 w-80">

        <input
          placeholder="Email"
          className="w-full p-2 bg-zinc-900 rounded"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-2 bg-zinc-900 rounded"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-purple-600 p-2 rounded"
        >
          Login
        </button>

      </div>

    </div>
  )
}