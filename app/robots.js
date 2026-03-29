export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/factures', '/clients', '/profil'],
    },
    sitemap: 'https://zimvu-avlk.vercel.app/sitemap.xml',
  }
}