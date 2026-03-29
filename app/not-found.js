import Link from 'next/link'

export const metadata = {
  title: '404 - Page introuvable | Zimvu',
}

export default function NotFound() {
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
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#6366f1', margin: 0 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginTop: '1rem' }}>
        Page introuvable
      </h2>
      <p style={{ color: '#6b7280', marginTop: '0.5rem', maxWidth: '400px' }}>
        Cette page n'existe pas ou a été déplacée. Pas de panique, votre comptabilité est en sécurité !
      </p>
      <Link href="/dashboard" style={{
        marginTop: '2rem',
        backgroundColor: '#6366f1',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '500'
      }}>
        Retour au tableau de bord
      </Link>
      <Link href="/" style={{
        marginTop: '1rem',
        color: '#6366f1',
        textDecoration: 'none',
        fontSize: '0.9rem'
      }}>
        Aller à l'accueil
      </Link>
    </div>
  )
}