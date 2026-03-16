type Props = {
profile:any
setProfile:any
}

export default function ProfilePanel({profile,setProfile}:Props){

return(

<div className="profilePanel">

<label>AVATAR IMAGE URL</label>

<input
value={profile.avatar}
onChange={(e)=>
setProfile({...profile,avatar:e.target.value})
}
placeholder="https://image-url.com/avatar.png"
/>

<div className="avatarPreview">

<img src={profile.avatar}/>

</div>

<label>DISPLAY NAME</label>

<input
value={profile.displayName}
onChange={(e)=>
setProfile({...profile,displayName:e.target.value})
}
/>

<label>USERNAME</label>

<div className="usernameRow">
<span>frost.rip/</span>

<input
value={profile.username}
onChange={(e)=>
setProfile({...profile,username:e.target.value})
}
/>

</div>

<label>BIO</label>

<textarea
value={profile.bio}
onChange={(e)=>
setProfile({...profile,bio:e.target.value})
}
placeholder="Tell people about yourself"
/>

</div>

);
}