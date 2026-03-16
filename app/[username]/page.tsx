"use client"
import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'

export default function SoftcardDashboard() {
  // 1. Hard check for ENV variables to prevent the 'auth' crash
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null; 
    return createBrowserClient(url, key);
  }, []);

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")

  useEffect(() => {
    async function initDashboard() {
      // If supabase is null, stop immediately to prevent "reading auth" error
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/login"; // Force redirect if no session
        return;
      }

      // Fetch the profile - focusing on the username "file/record"
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, setup_completed')
        .eq('id', user.id)
        .single()

      if (error || !profile?.username) {
        // If no username record exists, they must stay on the "Claim" screen
        console.log("No username found for this account.");
      } else {
        setUsername(profile.username);
      }
      setLoading(false)
    }
    initDashboard()
  }, [supabase])

  if (!supabase) return <div style={{color: 'white'}}>Error: Supabase Keys Missing in Vercel</div>
  if (loading) return <div style={{height: '100vh', background: '#020617'}} />

  return (
    <div className="scdb-dashboard">
      {/* If username exists, show dashboard. If not, show the Claim UI */}
      {!username ? (
        <div className="claim-container">
           <h1>Claim your URL</h1>
           {/* Your username claim input goes here */}
        </div>
      ) : (
        <div className="dashboard-main">
           <h1>Welcome, {username}</h1>
           {/* Your actual editor goes here */}
        </div>
      )}
    </div>
  )
}
