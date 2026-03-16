"use client"

import { supabase } from "@/lib/supabase"

export default function Dashboard(){

const publish = async () => {

await supabase
.from("users")
.update({ published: true })

}

return(

<div className="p-10 text-white bg-black min-h-screen">

<h1 className="text-3xl mb-6">Dashboard</h1>

<button
onClick={publish}
className="bg-green-600 px-5 py-2 rounded"
>
Publish Page
</button>

</div>

)

}