"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Pencil, BarChart3, LogOut } from "lucide-react"

/* SOCIAL ICON MAP */

const iconMap:any={
tiktok:"https://cdn.simpleicons.org/tiktok/ffffff",
instagram:"https://cdn.simpleicons.org/instagram/ffffff",
x:"https://cdn.simpleicons.org/x/ffffff",
youtube:"https://cdn.simpleicons.org/youtube/ffffff",
twitch:"https://cdn.simpleicons.org/twitch/ffffff",
spotify:"https://cdn.simpleicons.org/spotify/ffffff",
discord:"https://cdn.simpleicons.org/discord/ffffff",
github:"https://cdn.simpleicons.org/github/ffffff"
}

function getIcon(url:string){
const u=url.toLowerCase()
if(u.includes("tiktok"))return iconMap.tiktok
if(u.includes("instagram"))return iconMap.instagram
if(u.includes("twitter")||u.includes("x.com"))return iconMap.x
if(u.includes("youtube"))return iconMap.youtube
if(u.includes("twitch"))return iconMap.twitch
if(u.includes("spotify"))return iconMap.spotify
if(u.includes("discord"))return iconMap.discord
if(u.includes("github"))return iconMap.github
return "https://cdn.simpleicons.org/pwa/ffffff"
}

export default function SoftcardDashboard(){

const supabase=useMemo(()=>{
const url=process.env.NEXT_PUBLIC_SUPABASE_URL
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if(!url||!key)return null
return createBrowserClient(url,key)
},[])

/* VIEW */

const[view,setView]=useState<"hub"|"editor">("hub")
const[tab,setTab]=useState("profile")

/* PROFILE */

const[avatar,setAvatar]=useState("")
const[name,setName]=useState("")
const[username,setUsername]=useState("")
const[bio,setBio]=useState("")
const[links,setLinks]=useState<any[]>([])
const[badges,setBadges]=useState<any>({user:true})

/* APPEARANCE */

const[accent,setAccent]=useState("#ec4899")
const[nameColor,setNameColor]=useState("#ffffff")
const[bioColor,setBioColor]=useState("#9ca3af")

const[font,setFont]=useState("Inter")

const[layout,setLayout]=useState("list")
const[avatarShape,setAvatarShape]=useState("circle")
const[buttonStyle,setButtonStyle]=useState("filled")

const[accentGlow,setAccentGlow]=useState(true)

const[bgType,setBgType]=useState("gradient")
const[gradient,setGradient]=useState("linear-gradient(135deg,#020617,#1e293b)")
const[bgVideo,setBgVideo]=useState("")
const[bgImage,setBgImage]=useState("")
const[bgAudio,setBgAudio]=useState("")

const[loading,setLoading]=useState(true)
const[saving,setSaving]=useState(false)

/* LOAD PROFILE */

useEffect(()=>{
async function load(){

if(!supabase)return

const{data:{user}}=await supabase.auth.getUser()
if(!user)return

const{data}=await supabase
.from("profiles")
.select("*")
.eq("id",user.id)
.single()

if(data){

setAvatar(data.avatar_url||"")
setName(data.display_name||"")
setUsername(data.username||"")
setBio(data.bio||"")

setLinks(data.links||[])
setAccent(data.accent_color||"#ec4899")

setNameColor(data.name_color||"#fff")
setBioColor(data.bio_color||"#9ca3af")

setFont(data.font_family||"Inter")

setLayout(data.layout||"list")
setAvatarShape(data.avatar_shape||"circle")

setButtonStyle(data.button_style||"filled")
setAccentGlow(data.accent_glow??true)

setBgType(data.background_type||"gradient")

const val=data.background_value||""

if(data.background_type==="gradient")setGradient(val)
if(data.background_type==="video")setBgVideo(val)
if(data.background_type==="image")setBgImage(val)

setBgAudio(data.audio_url||"")
}

setLoading(false)
}

load()
},[supabase])

/* SAVE */

async function saveChanges(){

if(!supabase)return

setSaving(true)

const{data:{user}}=await supabase.auth.getUser()
if(!user)return

await supabase
.from("profiles")
.update({

display_name:name,
avatar_url:avatar,
bio:bio,
links:links,

accent_color:accent,
name_color:nameColor,
bio_color:bioColor,

font_family:font,

layout:layout,
avatar_shape:avatarShape,

button_style:buttonStyle,
accent_glow:accentGlow,

background_type:bgType,
background_value:bgType==="gradient"?gradient:(bgType==="video"?bgVideo:bgImage),

audio_url:bgAudio,

setup_completed:true

})
.eq("id",user.id)

setSaving(false)
alert("Saved")
}

/* LINKS */

function addLink(){
setLinks([...links,{id:Date.now(),url:""}])
}

function updateLink(i:number,val:string){
const copy=[...links]
copy[i].url=val
setLinks(copy)
}

/* LOADING */

if(loading)return null

/* HUB VIEW */

if(view==="hub"){

return(

<div className="softcard-root">

<div className="hub-logout" onClick={()=>supabase?.auth.signOut()}>
<LogOut size={20}/>
</div>

<div className="softcard-container">

<div className="softcard-header">
<p className="softcard-status">LOGGED INTO SOFTCARD.CC</p>
<h1 className="softcard-title">
Welcome back <span className="softcard-brand">{username}</span>
</h1>
</div>

<div className="softcard-hub-wrapper">

<div className="softcard-hub">
<div className="softcard-avatar">
<img src={avatar}/>
</div>
</div>

<button className="softcard-btn softcard-btn-left"
onClick={()=>setView("editor")}>
<Pencil size={16}/> Edit
</button>

<button className="softcard-btn softcard-btn-right">
<BarChart3 size={16}/> Stats
</button>

</div>

<div className="softcard-profile-bar">
<span className="softcard-profile-url">
softcard.cc/{username}
</span>
</div>

</div>
</div>

)
}

/* EDITOR VIEW */

return(

<div className="scdb-dashboard">

<div className="scdb-sidebar">

<div className="editor-back-link"
onClick={()=>setView("hub")}>
← Back
</div>

<div className="scdb-back"
onClick={saveChanges}>
{saving?"Saving...":"Save & Publish"}
</div>

<div className="scdb-tabs">

<div
className={`scdb-tab ${tab==="profile"?"scdb-tab-active":""}`}
onClick={()=>setTab("profile")}
>
Profile
</div>

<div
className={`scdb-tab ${tab==="appearance"?"scdb-tab-active":""}`}
onClick={()=>setTab("appearance")}
>
Appearance
</div>

</div>

{/* PROFILE TAB */}

{tab==="profile"&&(

<div className="scdb-card">

<label className="scdb-label">Avatar</label>
<input
className="scdb-input"
value={avatar}
onChange={e=>setAvatar(e.target.value)}
/>

<label className="scdb-label">Name</label>
<input
className="scdb-input"
value={name}
onChange={e=>setName(e.target.value)}
/>

<label className="scdb-label">Bio</label>
<input
className="scdb-input"
value={bio}
onChange={e=>setBio(e.target.value)}
/>

<button className="scdb-btn"
onClick={addLink}>
Add Link
</button>

{links.map((l,i)=>(

<input
key={l.id}
className="scdb-input"
placeholder="URL"
value={l.url}
onChange={e=>updateLink(i,e.target.value)}
/>

))}

</div>

)}

{/* APPEARANCE TAB */}

{tab==="appearance"&&(

<div className="scdb-card">

<label className="scdb-label">Accent</label>
<input
type="color"
className="scdb-input"
value={accent}
onChange={e=>setAccent(e.target.value)}
/>

<label className="scdb-label">Name Color</label>
<input
type="color"
className="scdb-input"
value={nameColor}
onChange={e=>setNameColor(e.target.value)}
/>

<label className="scdb-label">Bio Color</label>
<input
type="color"
className="scdb-input"
value={bioColor}
onChange={e=>setBioColor(e.target.value)}
/>

<label className="scdb-label">Avatar Shape</label>

<select
className="scdb-input"
value={avatarShape}
onChange={e=>setAvatarShape(e.target.value)}
>

<option value="circle">Circle</option>
<option value="rounded">Rounded</option>

</select>

<label className="scdb-label">Background</label>

<select
className="scdb-input"
value={bgType}
onChange={e=>setBgType(e.target.value)}
>

<option value="gradient">Gradient</option>
<option value="video">Video</option>
<option value="image">Image</option>

</select>

{bgType==="gradient"&&(
<input
className="scdb-input"
value={gradient}
onChange={e=>setGradient(e.target.value)}
/>
)}

{bgType==="video"&&(
<input
className="scdb-input"
value={bgVideo}
onChange={e=>setBgVideo(e.target.value)}
/>
)}

{bgType==="image"&&(
<input
className="scdb-input"
value={bgImage}
onChange={e=>setBgImage(e.target.value)}
/>
)}

</div>

)}

</div>

{/* PREVIEW */}

<div className="scdb-preview">

{bgType==="gradient"&&
<div className="scdb-bg"
style={{background:gradient}}/>}

{bgType==="video"&&bgVideo&&
<video
className="scdb-video"
src={bgVideo}
autoPlay
loop
muted/>}

{bgType==="image"&&bgImage&&
<img
className="scdb-image"
src={bgImage}/>}

{bgAudio&&
<audio
src={bgAudio}
autoPlay
loop/>}

<div className="scdb-profile">

<img
src={avatar}
className={`scdb-pfp ${avatarShape}`}
style={{boxShadow:`0 0 40px ${accent}`}}
/>

<div
className="scdb-name"
style={{color:nameColor}}>
{name}
</div>

<div
className="scdb-bio"
style={{color:bioColor}}>
{bio}
</div>

<div className="scdb-links">

{links.map(l=>{

if(!l.url)return null

const icon=getIcon(l.url)

return(

<a
key={l.id}
href={l.url}
target="_blank"
className="scdb-iconButton">

<img src={icon}/>

</a>

)

})}

</div>

</div>

</div>

</div>

)
}
