"use client";
import { useState } from "react";

export default function UsernameSetup({ onComplete, supabase, userId }: any) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function claimUsername() {
    setLoading(true);
    setError("");

    // 1. Check if the username is already taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existing) {
      setError("That username is already taken! ♡");
      setLoading(false);
      return;
    }

    // 2. Claim it and lock the account
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        username: username.toLowerCase(),
        setup_completed: true 
      })
      .eq('id', userId);

    if (updateError) {
      setError("Invalid username. Use only letters and numbers.");
    } else {
      onComplete();
    }
    setLoading(false);
  }

  return (
    <div className="setup-overlay" style={{
      position: 'fixed', inset: 0, background: '#020617', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Claim your URL</h1>
        <p style={{ opacity: 0.6, marginBottom: '30px' }}>This cannot be changed later.</p>
        
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '15px', top: '12px', opacity: 0.5 }}>softcard.cc/</span>
          <input 
            style={{ 
              width: '100%', padding: '12px 12px 12px 105px', borderRadius: '10px', 
              background: '#0b1726', border: '1px solid rgba(255,255,255,0.1)', color: 'white' 
            }}
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
          />
        </div>
        
        {error && <p style={{ color: '#ff4f4f', marginTop: '10px', fontSize: '14px' }}>{error}</p>}
        
        <button 
          onClick={claimUsername}
          disabled={loading || username.length < 3}
          style={{ 
            marginTop: '20px', width: '100%', padding: '12px', borderRadius: '10px',
            background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer',
            opacity: (loading || username.length < 3) ? 0.5 : 1
          }}
        >
          {loading ? "Checking..." : "Claim Username →"}
        </button>
      </div>
    </div>
  );
}
