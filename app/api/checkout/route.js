import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export async function POST(request) {
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
              description: 'Accès complet à Zimvu — Factures illimitées, clients illimités, export PDF',
            },
            unit_amount: 499,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: 'https://zimvu.vercel.app/dashboard?success=true',
      cancel_url: 'https://zimvu.vercel.app/profil',
    })

    return Response.json({ url: session.url })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}