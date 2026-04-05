import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { email, prenom } = await request.json()
  const prenomAffiche = prenom ? prenom : 'là'

  try {
    await resend.emails.send({
      from: 'Zimvu <noreply@zimvu.app>',
      to: email,
      subject: `Bienvenue sur Zimvu, ${prenom || ''} ! Votre essai Pro de 14 jours commence maintenant`.trim(),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">

          <!-- Header -->
          <div style="background: #1d4ed8; padding: 32px 40px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Zimvu</h1>
            <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">La facturation simple pour les auto-entrepreneurs</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">

            <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px;">
              Bienvenue ${prenomAffiche} ! 👋
            </h2>
            <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
              Votre compte est prêt. Vous bénéficiez dès maintenant d'un <strong style="color: #1d4ed8;">essai Pro gratuit de 14 jours</strong> — profitez de toutes les fonctionnalités sans limite.
            </p>

            <!-- Trial banner -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
              <p style="color: #1d4ed8; font-weight: 700; font-size: 15px; margin: 0 0 12px;">⭐ Essai Pro actif — 14 jours</p>
              <p style="color: #374151; font-size: 14px; margin: 6px 0;">Factures et devis illimites</p>
              <p style="color: #374151; font-size: 14px; margin: 6px 0;">Notes de frais et export PDF + Excel</p>
              <p style="color: #374151; font-size: 14px; margin: 6px 0;">Agenda et relances automatiques</p>
              <p style="color: #374151; font-size: 14px; margin: 6px 0;">Tableau de bord et suivi du CA</p>
            </div>

            <!-- CTA -->
            <a href="https://zimvu.app/dashboard"
               style="display: inline-block; background: #1d4ed8; color: #ffffff; padding: 16px 32px;
                      border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 28px;">
              Acceder a mon tableau de bord
            </a>

            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 28px 0;">

            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
              Apres les 14 jours, votre compte basculera automatiquement sur le plan gratuit (3 factures/mois).<br>
              Vous pouvez passer au Pro a tout moment depuis votre profil pour 9 euros/mois sans engagement.<br><br>
              Des questions ? Repondez directement a cet email, on vous repond rapidement.
            </p>

          </div>

          <!-- Footer -->
          <div style="padding: 20px 40px; text-align: center;">
            <p style="color: #d1d5db; font-size: 12px; margin: 0;">
              © 2026 Zimvu — zimvu.app
            </p>
          </div>

        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return Response.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}