"use client"
import { useState, useEffect } from "react"

export default function UsernameSetup({ supabase, onComplete }: any) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({data}: any) => setUserId(data.user?.id))
  }, [supabase])

  async function claim() {
    if (username.length < 3) return
    setLoading(true)
    
    // Check if username is already taken
    const { data } = await supabase.from('profiles').select('username').eq('username', username.toLowerCase()).single()
    
    if (data) {
      alert("This username is already taken! ♡")
      setLoading(false)
      return
    }

    // Update existing profile row (don't insert, update the trigger-created row)
    const { error } = await supabase.from('profiles').update({
      username: username.toLowerCase(),
      setup_completed: true,
      display_name: username
    }).eq('id', userId)

    if (error) {
      alert("Error claiming username. Try alphanumeric characters only.")
    } else {
      onComplete()
    }
    setLoading(false)
  }

  return (
    <div style={{height:'100vh', background:'#020617', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontFamily:'Inter, sans-serif'}}>
      <div style={{width:'400px', textAlign:'center', padding: '40px', background: '#071321', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)'}}>
        <h1 style={{fontSize: '32px', marginBottom: '10px', fontWeight: '700'}}>Claim your link</h1>
        <p style={{opacity:0.5, marginBottom: '30px', fontSize: '15px'}}>This will be your permanent Softcard URL</p>
        
        <div style={{position: 'relative'}}>
            <span style={{position: 'absolute', left: '15px', top: '14px', opacity: 0.3, fontSize: '14px'}}>softcard.cc/</span>
            <input 
              style={{width:'100%', padding:'14px 14px 14px 95px', background:'#020617', border:'1px solid rgba(255,255,255,0.1)', color:'white', borderRadius:'12px', fontSize: '14px', outline: 'none'}}
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            />
        </div>

        <button 
          onClick={claim} 
          disabled={loading || username.length < 3}
          style={{width:'100%', marginTop:'25px', padding:'14px', background:'#3b82f6', border:'none', borderRadius:'12px', color:'white', fontWeight:'600', cursor:'pointer', opacity: (loading || username.length < 3) ? 0.5 : 1}}
        >
          {loading ? "Saving..." : "Claim My URL →"}
        </button>
      </div>
    </div>
  )
}
