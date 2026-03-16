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

  // Look up the user by the username in the URL
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username.toLowerCase())
    .single();

  // If the username isn't in our database, show 404
  if (!profile) {
    notFound();
  }

  return (
    <main className={font.className} style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '100px'
    }}>
      <div className="profileCard" style={{ textAlign: 'center' }}>
        {/* Profile Image */}
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          background: profile.accent_color,
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px'
        }}>
          {profile.display_name?.charAt(0).toUpperCase() || "♡"}
        </div>

        <h1 style={{ color: profile.accent_color, fontSize: '32px' }}>
          {profile.display_name}
        </h1>
        
        <p style={{ opacity: 0.8, marginTop: '10px', maxWidth: '400px' }}>
          {profile.bio}
        </p>

        <div className="links" style={{ marginTop: '40px' }}>
            {/* We'll add your links/socials here next */}
        </div>
      </div>

      <footer style={{ marginTop: 'auto', paddingBottom: '40px', opacity: 0.5 }}>
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>♡ softcard.cc</a>
      </footer>
    </main>
  );
}