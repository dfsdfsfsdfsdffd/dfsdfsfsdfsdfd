"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"

const iconMap:any={
tiktok:"https://cdn.simpleicons.org/tiktok/ffffff",
instagram:"https://cdn.simpleicons.org/instagram/ffffff",
x:"https://cdn.simpleicons.org/x/ffffff",
youtube:"https://cdn.simpleicons.org/youtube/ffffff",
twitch:"https://cdn.simpleicons.org/twitch/ffffff",
spotify:"https://cdn.simpleicons.org/spotify/ffffff",
discord:"https://cdn.simpleicons.org/discord/ffffff",
github:"https://cdn.simpleicons.org/github/ffffff",
threads:"https://cdn.simpleicons.org/threads/ffffff",
linkedin:"https://cdn.simpleicons.org/linkedin/ffffff"
}

function getIcon(url:string){

if(url.includes("tiktok")) return iconMap.tiktok
if(url.includes("instagram")) return iconMap.instagram
if(url.includes("twitter")||url.includes("x.com")) return iconMap.x
if(url.includes("youtube")) return iconMap.youtube
if(url.includes("twitch")) return iconMap.twitch
if(url.includes("spotify")) return iconMap.spotify
if(url.includes("discord")) return iconMap.discord
if(url.includes("github")) return iconMap.github
if(url.includes("threads")) return iconMap.threads
if(url.includes("linkedin")) return iconMap.linkedin

return "https://cdn.simpleicons.org/link/ffffff"
}

export default function SoftcardDashboard(){

const supabase=useMemo(()=>{
const url=process.env.NEXT_PUBLIC_SUPABASE_URL
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if(!url||!key) return null
return createBrowserClient(url,key)
},[])

const[loading,setLoading]=useState(true)
const[saving,setSaving]=useState(false)
const[tab,setTab]=useState("profile")

const[avatar,setAvatar]=useState("https://i.imgur.com/1X6g1YH.jpeg")
const[name,setName]=useState("akuryō")
const[bio,setBio]=useState("")
const[username,setUsername]=useState("")

const[links,setLinks]=useState<any[]>([])

const[accent,setAccent]=useState("#3b82f6")

const[badges,setBadges]=useState<any>({
user:true,
dev:false
})

const[devPassword,setDevPassword]=useState("")

useEffect(()=>{

async function load(){

if(!supabase) return

const{data:{user}}=await supabase.auth.getUser()
if(!user) return

const{data}=await supabase
.from("profiles")
.select("*")
.eq("id",user.id)
.single()

if(data){

setUsername(data.username||"")
setAvatar(data.avatar_url||avatar)
setName(data.display_name||name)
setBio(data.bio||"")
setLinks(data.links||[])
setAccent(data.accent_color||accent)

setBadges(data.badges||{user:true})

}

setLoading(false)

}

load()

},[supabase])

async function save(){

if(!supabase) return

setSaving(true)

const{data:{user}}=await supabase.auth.getUser()

await supabase.from("profiles").update({

display_name:name,
avatar_url:avatar,
bio:bio,
links:links,
accent_color:accent,
badges:badges

}).eq("id",user?.id)

setSaving(false)

alert("Saved")

}

function addLink(){

setLinks([
...links,
{
id:Date.now(),
title:"Link",
url:""
}
])

}

function updateLink(i:number,key:string,val:string){

const copy=[...links]
copy[i][key]=val
setLinks(copy)

}

function unlockDev(){

if(devPassword==="12345"){

setBadges({...badges,dev:true})
alert("Dev badge unlocked")

}else{

alert("Wrong password")

}

}

if(loading) return null

return(

<div className="scdb-dashboard">

`}</style>

<div className="scdb-sidebar">

<div onClick={save} style={{marginBottom:20,cursor:"pointer"}}>
{saving?"Saving...":"Save & Publish"}
</div>

<div className="scdb-tabs">

<div
className={`scdb-tab ${tab==="profile"?"scdb-active":""}`}
onClick={()=>setTab("profile")}
>
Profile
</div>

<div
className={`scdb-tab ${tab==="badges"?"scdb-active":""}`}
onClick={()=>setTab("badges")}
>
Badges
</div>

</div>

{tab==="profile"&&(

<div className="scdb-card">

<label>Avatar</label>
<input className="scdb-input" value={avatar} onChange={e=>setAvatar(e.target.value)}/>

<label>Name</label>
<input className="scdb-input" value={name} onChange={e=>setName(e.target.value)}/>

<label>Bio</label>
<input className="scdb-input" value={bio} onChange={e=>setBio(e.target.value)}/>

<div style={{marginTop:20}}>Links</div>

<button className="scdb-btn" onClick={addLink}>Add Link</button>

{links.map((l,i)=>(

<div key={l.id} style={{marginTop:10}}>

<input
className="scdb-input"
value={l.title}
onChange={e=>updateLink(i,"title",e.target.value)}
placeholder="Title"
/>

<input
className="scdb-input"
value={l.url}
onChange={e=>updateLink(i,"url",e.target.value)}
placeholder="URL"
/>

</div>

))}

</div>

)}

{tab==="badges"&&(

<div className="scdb-card">

<div>User badge enabled</div>

<label style={{display:"flex",gap:10,marginTop:10}}>

<input
type="checkbox"
checked={badges.user}
onChange={()=>setBadges({...badges,user:!badges.user})}
/>

User Badge

</label>

<div style={{marginTop:20}}>Unlock Dev Badge</div>

<input
className="scdb-input"
placeholder="Password"
value={devPassword}
onChange={e=>setDevPassword(e.target.value)}
/>

<button className="scdb-btn" onClick={unlockDev}>
Unlock Dev
</button>

{badges.dev&&(

<label style={{display:"flex",gap:10,marginTop:10}}>

<input
type="checkbox"
checked={badges.dev}
onChange={()=>setBadges({...badges,dev:!badges.dev})}
/>

Dev Badge

</label>

)}

</div>

)}

</div>

<div className="scdb-preview">

<div className="scdb-profile">

<img src={avatar} className="scdb-pfp"/>

<div className="scdb-name">{name}</div>

<div className="scdb-bio">{bio}</div>

<div className="scdb-badges">

{badges.user&&<div className="badge">User</div>}
{badges.dev&&<div className="badge dev">Dev</div>}

</div>

<div className="scdb-links">

{links.map(l=>(

<div key={l.id} className="scdb-link">

<img src={getIcon(l.url)}/>

<span>{l.title}</span>

</div>

))}

</div>

</div>

</div>

</div>

)

}
