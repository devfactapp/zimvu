import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { factureData, userId, userEmail } = await request.json()

    const isAdmin = userEmail === 'devfact.app@gmail.com'

    if (!isAdmin) {
      // Vérifier le plan
      const { data: profil } = await supabase
        .from('profils')
        .select('pro_trial_end')
        .eq('id', userId)
        .single()

      const isTrial = profil?.pro_trial_end && new Date(profil.pro_trial_end) > new Date()

      if (!isTrial) {
        // Vérifier la limite du mois
        const debutMois = new Date()
        debutMois.setDate(1)
        debutMois.setHours(0, 0, 0, 0)

        const { data: factures } = await supabase
          .from('factures')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', debutMois.toISOString())

        if (factures?.length >= 3) {
          return Response.json({ error: 'LIMITE_ATTEINTE' }, { status: 403 })
        }
      }
    }

    const { error } = await supabase.from('factures').insert([{
      ...factureData,
      user_id: userId,
    }])

    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}