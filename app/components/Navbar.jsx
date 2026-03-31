// app/components/Navbar.jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Navbar({ pageCourante }) {
  const router = useRouter()
  const [menuOuvert, setMenuOuvert] = useState(false)

 const liens = [
    { label: 'Tableau de bord', href: '/dashboard' },
    { label: 'Clients', href: '/clients' },
    { label: 'Factures', href: '/factures' },
    { label: 'Devis', href: '/devis' },
    { label: 'Frais', href: '/frais' },
{ label: 'Export', href: '/export' },
    { label: 'Calculateur', href: '/dashboard/calculateur' },
    { label: 'Mon profil', href: '/profil' },
  ]

  return (
    <nav className="bg-white shadow-sm px-4 py-4">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-blue-700 cursor-pointer"
          onClick={() => router.push('/dashboard')}
        >
          Zimvu
        </h1>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-6">
          {liens.map((lien) => (
            <span
              key={lien.href}
              onClick={() => router.push(lien.href)}
              className={`cursor-pointer hover:text-blue-600 text-sm ${
                pageCourante === lien.href
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600'
              }`}
            >
              {lien.label}
            </span>
          ))}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Déconnexion
          </button>
        </div>

        {/* Bouton hamburger mobile */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOuvert(!menuOuvert)}
        >
          <span className="block w-6 h-0.5 bg-gray-700"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOuvert && (
        <div className="md:hidden flex flex-col gap-3 mt-4 pb-2 border-t border-gray-100 pt-4">
          {liens.map((lien) => (
            <span
              key={lien.href}
              onClick={() => { router.push(lien.href); setMenuOuvert(false) }}
              className={`cursor-pointer text-sm ${
                pageCourante === lien.href
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600'
              }`}
            >
              {lien.label}
            </span>
          ))}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm w-full"
          >
            Déconnexion
          </button>
        </div>
      )}
    </nav>
  )
}