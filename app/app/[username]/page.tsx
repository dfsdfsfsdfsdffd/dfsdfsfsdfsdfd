import { supabase } from "@/lib/supabase"

export default async function Page({ params }) {

const { data } = await supabase
.from("users")
.select("*")
.eq("username", params.username)
.single()

if(!data) return <div>User not found</div>

return (

<div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">

<img src={data.avatar} className="w-24 h-24 rounded-full"/>

<h1 className="text-3xl mt-3">@{data.username}</h1>

<p className="text-gray-400">{data.bio}</p>

</div>

)

}