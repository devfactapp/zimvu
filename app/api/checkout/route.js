import Stripe from 'stripe'

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe non configuré' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const { email } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Zimvu Pro',
              description: 'Factures illimitees, devis illimites, export PDF + Excel, agenda, relances automatiques',
            },
            unit_amount: 900,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: 'https://zimvu.app/dashboard?success=true',
      cancel_url: 'https://zimvu.app/profil',
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return Response.json({ error: 'Erreur paiement' }, { status: 500 })
  }
}