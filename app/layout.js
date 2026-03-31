import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Zimvu — Logiciel de facturation pour auto-entrepreneurs",
  description: "Zimvu est le logiciel de facturation simple et pas cher pour les auto-entrepreneurs français. Créez des factures professionnelles, gérez vos clients et suivez votre chiffre d'affaires. 4,99€/mois.",
  keywords: "facturation auto-entrepreneur, logiciel facturation, facture PDF, auto-entrepreneur France, facturation électronique",
  authors: [{ name: "Zimvu" }],
  creator: "Zimvu",
  metadataBase: new URL("https://zimvu-avlk.vercel.app"),
  openGraph: {
    title: "Zimvu — Facturation simple pour auto-entrepreneurs",
    description: "Créez des factures professionnelles en quelques secondes. 4,99€/mois, sans engagement.",
    url: "https://zimvu-avlk.vercel.app",
    siteName: "Zimvu",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zimvu — Facturation simple pour auto-entrepreneurs",
    description: "Créez des factures professionnelles en quelques secondes. 4,99€/mois, sans engagement.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}