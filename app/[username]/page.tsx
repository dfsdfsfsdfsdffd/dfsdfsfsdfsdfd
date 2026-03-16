import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({ subsets: ["latin"], weight: ["400", "700"] });

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  );

  // 1. Fetch the profile by username (case-insensitive)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username.toLowerCase())
    .single();

  // 2. If no user exists with that name, 404
  if (!profile) {
    notFound();
  }

  return (
    <main className={font.className} style={{ 
      minHeight: '100vh', 
      backgroundColor: '#020617', // Matching your new Dashboard navy
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="profile-card" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
        
        {/* Custom Avatar with Glow Effect */}
        <img 
          src={profile.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg"} 
          alt={profile.display_name}
          style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            objectFit: 'cover',
            boxShadow: `0 0 35px ${profile.accent_color || '#3b82f6'}`,
            marginBottom: '20px'
          }}
        />

        <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>
          {profile.display_name || profile.username}
        </h1>
        
        <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '24px' }}>
          @{profile.username}
        </h1>

        {/* The One Permanent Link */}
        {profile.link_url && (
          <a 
            href={profile.link_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: 'block',
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: '#0b1726',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: '0.2s',
              textAlign: 'center'
            }}
          >
            {profile.link_title || "Visit Link"}
          </a>
        )}

        {/* Bio / Description */}
        {profile.bio && (
          <p style={{ marginTop: '24px', opacity: 0.8, fontSize: '15px', lineHeight: '1.5' }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* Brand Footer */}
      <footer style={{ marginTop: '60px', opacity: 0.4, fontSize: '13px' }}>
        <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>♡ softcard.cc</a>
      </footer>
    </main>
  );
}
