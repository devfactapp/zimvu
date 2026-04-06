import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // Vérifier l'auth via le token Bearer
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: 'Session invalide' }, { status: 401 })
    }

    const dateLimite = new Date()
    dateLimite.setDate(dateLimite.getDate() - 7)
    const dateLimiteStr = dateLimite.toISOString().split('T')[0]

    // Récupérer les factures en retard de cet utilisateur uniquement
    const { data: factures, error: facturesError } = await supabase
      .from('factures')
      .select('id, client, email, montant, date, numero, description')
      .eq('user_id', user.id)
      .eq('statut', 'En attente')
      .lte('date', dateLimiteStr)
      .eq('relance_envoyee', false)

    if (facturesError) {
      return Response.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    // Récupérer le profil de l'émetteur
    const { data: profil } = await supabase
      .from('profils')
      .select('prenom, nom, email, company_name')
      .eq('id', user.id)
      .single()

    const emetteur = profil?.company_name || `${profil?.prenom || ''} ${profil?.nom || ''}`.trim() || 'Votre prestataire'

    const resultats = []

    for (const facture of factures || []) {
      if (!facture.email) continue

      // Envoyer l'email de relance
      const { error: emailError } = await resend.emails.send({
        from: 'Zimvu <noreply@zimvu.app>',
        to: facture.email,
        subject: `Rappel de paiement — Facture ${facture.numero || facture.id}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: #1d4ed8; padding: 32px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0;">Zimvu</h1>
              <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">La facturation simple pour les auto-entrepreneurs</p>
            </div>
            <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 16px;">Rappel de paiement</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Bonjour ${facture.client},
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Sauf erreur de votre part, il semblerait que la facture suivante soit toujours en attente de reglement :
              </p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                <p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Facture :</strong> ${facture.numero || facture.id}</p>
                <p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Date :</strong> ${new Date(facture.date).toLocaleDateString('fr-FR')}</p>
                <p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Montant :</strong> ${Number(facture.montant).toFixed(2)} EUR</p>
                ${facture.description ? `<p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Objet :</strong> ${facture.description}</p>` : ''}
              </div>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Nous vous remercions de bien vouloir proceder au reglement dans les meilleurs delais.
              </p>
              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 28px 0;">
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                Cet email a ete envoye par ${emetteur} via Zimvu.<br>
                Des questions ? Contactez directement votre prestataire.
              </p>
            </div>
            <div style="padding: 20px 40px; text-align: center;">
              <p style="color: #d1d5db; font-size: 12px; margin: 0;">© 2026 Zimvu — zimvu.app</p>
            </div>
          </div>
        `,
      })

      if (!emailError) {
        // Marquer la facture comme relancée
        await supabase
          .from('factures')
          .update({ relance_envoyee: true, date_relance: new Date().toISOString() })
          .eq('id', facture.id)

        resultats.push({ client: facture.client, email: facture.email })
      }
    }

    return Response.json({
      message: resultats.length > 0
        ? `${resultats.length} relance(s) envoyee(s) avec succes`
        : 'Aucune relance envoyee',
      resultats
    })

  } catch (error) {
    console.error('Erreur relances:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}