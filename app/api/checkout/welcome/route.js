import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { email } = await request.json()

  try {
    await resend.emails.send({
      from: 'Zimvu <onboarding@resend.dev>',
      to: email,
      subject: 'Bienvenue sur Zimvu ! 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <h1 style="color: #1d4ed8; font-size: 28px; margin-bottom: 8px;">Zimvu</h1>
          <p style="color: #6b7280; margin-top: 0;">Votre outil de facturation intelligent</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <h2 style="color: #111827; font-size: 22px;">Bienvenue ! 👋</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Votre compte Zimvu est prêt. Vous pouvez dès maintenant créer vos premières factures 
            et gérer vos clients en toute simplicité.
          </p>

          <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="color: #1d4ed8; font-weight: 600; margin: 0 0 12px;">Ce que vous pouvez faire :</p>
            <p style="color: #374151; margin: 6px 0;">✅ Créer des factures professionnelles en PDF</p>
            <p style="color: #374151; margin: 6px 0;">✅ Gérer vos clients</p>
            <p style="color: #374151; margin: 6px 0;">✅ Suivre votre chiffre d'affaires</p>
            <p style="color: #374151; margin: 6px 0;">✅ Numérotation automatique des factures</p>
          </div>

          <a href="https://zimvu-avlk.vercel.app/dashboard" 
             style="display: inline-block; background: #1d4ed8; color: white; padding: 14px 28px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600; margin: 8px 0;">
            Accéder à mon tableau de bord
          </a>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
          
          <p style="color: #9ca3af; font-size: 13px;">
            Zimvu — La facturation simple pour les auto-entrepreneurs français.<br>
            Des questions ? Répondez directement à cet email.
          </p>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return Response.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}