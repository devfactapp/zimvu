// app/api/relances/route.js
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { userId } = await request.json()

    // Date limite : aujourd'hui - 7 jours
    const dateLimite = new Date()
    dateLimite.setDate(dateLimite.getDate() - 7)
    const dateLimiteStr = dateLimite.toISOString().split('T')[0]

    // Récupérer les factures en attente depuis plus de 7 jours
    const { data: factures, error } = await supabase
      .from('factures')
      .select('*')
      .eq('user_id', userId)
      .eq('statut', 'En attente')
      .lte('date', dateLimiteStr)

    if (error) throw error
    if (!factures || factures.length === 0) {
      return Response.json({ message: 'Aucune facture en retard', count: 0 })
    }

    // Envoyer un email de relance pour chaque facture
    const resultats = []
    for (const facture of factures) {
      if (!facture.email) continue

      const { data, error: emailError } = await resend.emails.send({
        from: 'Zimvu <noreply@zimvu.fr>',
        to: facture.email,
        subject: `Rappel de paiement — Facture ${facture.client}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1d4ed8; font-size: 28px; margin: 0;">Zimvu</h1>
              <p style="color: #6b7280; margin: 5px 0;">Rappel de paiement</p>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #374151; margin: 0 0 16px;">Bonjour <strong>${facture.client}</strong>,</p>
              <p style="color: #374151; margin: 0 0 16px;">
                Nous vous contactons concernant une facture en attente de règlement.
              </p>

              <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #6b7280; padding: 8px 0; font-size: 14px;">Description</td>
                    <td style="color: #111827; font-weight: bold; padding: 8px 0; font-size: 14px; text-align: right;">${facture.description || 'Prestation'}</td>
                  </tr>
                  <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="color: #6b7280; padding: 8px 0; font-size: 14px;">Date de facturation</td>
                    <td style="color: #111827; font-weight: bold; padding: 8px 0; font-size: 14px; text-align: right;">${facture.date}</td>
                  </tr>
                  <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="color: #6b7280; padding: 8px 0; font-size: 14px;">Montant dû</td>
                    <td style="color: #1d4ed8; font-weight: bold; padding: 8px 0; font-size: 18px; text-align: right;">${facture.montant} €</td>
                  </tr>
                </table>
              </div>

              <p style="color: #374151; margin: 16px 0 0;">
                Si vous avez déjà effectué ce règlement, merci de ne pas tenir compte de ce message.
              </p>
            </div>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              Ce message a été envoyé automatiquement via Zimvu
            </p>
          </div>
        `,
      })

      if (!emailError) {
        // Marquer la relance dans Supabase
        await supabase
          .from('factures')
          .update({ relance_envoyee: true, date_relance: new Date().toISOString() })
          .eq('id', facture.id)

        resultats.push({ client: facture.client, statut: 'envoyé' })
      }
    }

    return Response.json({
      message: `${resultats.length} relance(s) envoyée(s)`,
      count: resultats.length,
      resultats
    })

  } catch (error) {
    console.error('Erreur relances:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}