export async function getUserPlan(supabase, userId) {
  const { data: profil } = await supabase
    .from('profils')
    .select('pro_trial_end')
    .eq('id', userId)
    .single()

  const now = new Date()

  if (profil?.pro_trial_end && new Date(profil.pro_trial_end) > now) {
    const joursRestants = Math.floor((new Date(profil.pro_trial_end) - now) / (1000 * 60 * 60 * 24))
    return { plan: 'trial', joursRestants }
  }

  return { plan: 'gratuit', joursRestants: 0 }
}