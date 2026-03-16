export default function BlossomTheme({ profile }: { profile: any }) {
  return (
    <div className="blossom-container">
      <style jsx>{`
        .blossom-container { /* Scoped theme CSS here */ }
        .card { background: pink; border-radius: 40px; }
      `}</style>
      
      <div className="card">
        <img src={profile.avatar_url} alt="pfp" />
        <h1>{profile.display_name}</h1>
        {/* Render tags and links using the same loops */}
      </div>
    </div>
  )
}