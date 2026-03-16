"use client"
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

// 1. Create a separate component for the form logic
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState(searchParams.get('username') || '')
  const [isSignUp, setIsSignUp] = useState(!!searchParams.get('username'))
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      })

      if (error) {
        setMessage(error.message)
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user?.id, username: username.toLowerCase() }])
        
        if (profileError) setMessage("Username might be taken.")
        else router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md">
      <h1 className="text-3xl font-bold mb-2 text-center">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className="text-zinc-500 text-center mb-8 text-sm">
        {isSignUp ? `Securing softcard.cc/${username}` : 'Enter your details to login'}
      </p>

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <input
            type="text"
            placeholder="Username"
            className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-white outline-none transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-white outline-none transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-white outline-none transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : isSignUp ? 'Claim My Link' : 'Sign In'}
        </button>
      </form>

      {message && <p className="text-red-500 text-xs mt-4 text-center">{message}</p>}

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full mt-6 text-zinc-500 text-sm hover:text-white transition"
      >
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  )
}

// 2. The main page component that wraps everything in Suspense
export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
