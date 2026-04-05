import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const maintenant = new Date()

    // Demain (J-1 : trial expire dans moins de 24h)
    const demain = new Date()
    demain.setDate(demain.getDate() + 1)
    const demainDebut = new Date(demain.getFullYear(), demain.getMonth(), demain.getDate(), 0, 0, 0).toISOString()
    const demainFin = new Date(demain.getFullYear(), demain.getMonth(), demain.getDate(), 23, 59, 59).toISOString()

    // Aujourd'hui (J0 : trial expiré depuis moins de 24h)
    const hierDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - 1, 0, 0, 0).toISOString()
    const hierFin = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - 1, 23, 59, 59).toISOString()

    // Récupérer les profils avec email auth
    const { data: profilsJ1 } = await supabase
      .from('profils')
      .select('id, prenom, pro_trial_end')
      .gte('pro_trial_end', demainDebut)
      .lte('pro_trial_end', demainFin)

    const { data: profilsJ0 } = await supabase
      .from('profils')
      .select('id, prenom, pro_trial_end')
      .gte('pro_trial_end', hierDebut)
      .lte('pro_trial_end', hierFin)

    const resultats = []

    // Email J-1 : dernière chance
    for (const profil of profilsJ1 || []) {
      const { data: userAuth } = await supabase.auth.admin.getUserById(profil.id)
      const email = userAuth?.user?.email
      if (!email) continue

      const prenom = profil.prenom || ''

      await resend.emails.send({
        from: 'Zimvu <noreply@zimvu.app>',
        to: email,
        subject: 'Votre essai Pro Zimvu se termine demain',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">

            <div style="background: #1d4ed8; padding: 32px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0;">Zimvu</h1>
              <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">La facturation simple pour les auto-entrepreneurs</p>
            </div>

            <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">

              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px;">
                ${prenom ? `${prenom}, votre` : 'Votre'} essai Pro se termine demain
              </h2>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Votre essai gratuit de 14 jours arrive a son terme demain. Apres cela, votre compte basculera automatiquement sur le plan Gratuit (3 factures/mois).
              </p>

              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                <p style="color: #1d4ed8; font-weight: 700; font-size: 15px; margin: 0 0 12px;">Ce que vous perdrez avec le plan Gratuit</p>
                <p style="color: #374151; font-size: 14px; margin: 6px 0;">Limite de 3 factures et 3 devis par mois</p>
                <p style="color: #374151; font-size: 14px; margin: 6px 0;">Plus d'acces aux notes de frais</p>
                <p style="color: #374151; font-size: 14px; margin: 6px 0;">Plus d'export PDF et Excel</p>
                <p style="color: #374151; font-size: 14px; margin: 6px 0;">Plus d'agenda ni de relances automatiques</p>
              </div>

              <a href="https://zimvu.app/profil"
                 style="display: inline-block; background: #1d4ed8; color: #ffffff; padding: 16px 32px;
                        border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 28px;">
                Continuer avec le Pro — 9 euros/mois
              </a>

              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 28px 0;">

              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                Sans engagement, annulable a tout moment.<br>
                Des questions ? Repondez directement a cet email.
              </p>

            </div>

            <div style="padding: 20px 40px; text-align: center;">
              <p style="color: #d1d5db; font-size: 12px; margin: 0;">© 2026 Zimvu — zimvu.app</p>
            </div>

          </div>
        `,
      })

      resultats.push({ email, type: 'J-1' })
    }

    // Email J0 : trial expiré
    for (const profil of profilsJ0 || []) {
      const { data: userAuth } = await supabase.auth.admin.getUserById(profil.id)
      const email = userAuth?.user?.email
      if (!email) continue

      const prenom = profil.prenom || ''

      await resend.emails.send({
        from: 'Zimvu <noreply@zimvu.app>',
        to: email,
        subject: 'Votre essai Pro Zimvu est termine',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">

            <div style="background: #1d4ed8; padding: 32px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0;">Zimvu</h1>
              <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">La facturation simple pour les auto-entrepreneurs</p>
            </div>

            <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">

              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px;">
                ${prenom ? `${prenom}, votre` : 'Votre'} essai Pro est termine
              </h2>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Votre essai gratuit de 14 jours est arrive a son terme. Votre compte est maintenant sur le plan Gratuit.
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                <p style="color: #374151; font-weight: 700; font-size: 15px; margin: 0 0 12px;">Plan Gratuit actif</p>
                <p style="color: #6b7280; font-size: 14px; margin: 6px 0;">3 factures par mois</p>
                <p style="color: #6b7280; font-size: 14px; margin: 6px 0;">3 devis par mois</p>
                <p style="color: #6b7280; font-size: 14px; margin: 6px 0;">Gestion clients illimitee</p>
              </div>

              <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
                Pour continuer a profiter de toutes les fonctionnalites, passez au Pro pour seulement 9 euros/mois sans engagement.
              </p>

              <a href="https://zimvu.app/profil"
                 style="display: inline-block; background: #1d4ed8; color: #ffffff; padding: 16px 32px;
                        border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 28px;">
                Passer au Pro — 9 euros/mois
              </a>

              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 28px 0;">

              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                Sans engagement, annulable a tout moment.<br>
                Des questions ? Repondez directement a cet email.
              </p>

            </div>

            <div style="padding: 20px 40px; text-align: center;">
              <p style="color: #d1d5db; font-size: 12px; margin: 0;">© 2026 Zimvu — zimvu.app</p>
            </div>

          </div>
        `,
      })

      resultats.push({ email, type: 'J0' })
    }

    return Response.json({
      message: `${resultats.length} email(s) envoye(s)`,
      resultats
    })

  } catch (error) {
    console.error('Erreur trial expiration:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}