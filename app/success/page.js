import Link from 'next/link'

export const metadata = {
  title: 'Paiement confirmé | Zimvu',
}

export default function SuccessPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      backgroundColor: '#f9fafb',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: '#white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '480px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          backgroundColor: '#d1fae5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem'
        }}>
          ✓
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', margin: '0 0 0.75rem' }}>
          Bienvenue sur Zimvu !
        </h1>
        <p style={{ color: '#6b7280', lineHeight: '1.6', margin: '0 0 2rem' }}>
          Votre abonnement est actif. Vous pouvez maintenant créer vos factures et gérer vos clients en toute simplicité.
        </p>
        <Link href="/dashboard" style={{
          display: 'block',
          backgroundColor: '#6366f1',
          color: 'white',
          padding: '0.875rem 1.5rem',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '1rem'
        }}>
          Accéder à mon tableau de bord
        </Link>
        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
          Un email de confirmation vous a été envoyé par Stripe.
        </p>
      </div>
    </div>
  )
}