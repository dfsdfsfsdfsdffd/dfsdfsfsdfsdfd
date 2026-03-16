const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const { data, error } = mode === "signin" 
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({ email, password });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  // After login, check if they have a username set up
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', data.user?.id)
    .single();

  if (!profile?.username) {
    router.push("/setup"); // Send to claim their link
  } else {
    router.push("/dashboard"); // Already has a link, go to editor
  }
  setLoading(false);
};
