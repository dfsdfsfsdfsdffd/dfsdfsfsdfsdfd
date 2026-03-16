const saveProfile = async () => {
  setSaving(true)
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase.from('profiles').update({ 
    links, 
    bio, 
    is_published: true 
  }).eq('id', user?.id)
  
  setSaving(false)
  
  if (!error) {
    // This gives them a clickable link immediately
    alert(`Published! View at softcard.cc/${username}`)
  } else {
    alert("Error saving: " + error.message)
  }
}
