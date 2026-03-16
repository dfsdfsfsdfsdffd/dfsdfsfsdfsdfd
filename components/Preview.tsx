type Props = {
profile:any
}

export default function Preview({profile}:Props){

return(

<div className="preview">

<div className="previewCenter">

<img
src={profile.avatar}
className="avatar"
/>

<h2>{profile.displayName}</h2>

<p>{profile.bio}</p>

</div>

</div>

);
}