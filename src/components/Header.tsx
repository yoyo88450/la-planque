'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-black to-gray-900 shadow-2xl border-b border-gray-800/50 backdrop-blur-sm">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="transition-all duration-300 transform hover:scale-105">
            <img src="/image1.png" alt="La Planque" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-10">
            <Link href="/reservation" className={`group relative transition-all duration-300 font-medium text-lg ${pathname === '/reservation' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <span className="relative z-10">Réservation</span>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/reservation' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/boutique" className={`group relative transition-all duration-300 font-medium text-lg ${pathname === '/boutique' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <span className="relative z-10">Boutique</span>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/boutique' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-110"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pb-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col space-y-6">
              <Link
                href="/reservation"
                className={`group relative transition-all duration-300 font-medium text-lg py-2 ${pathname === '/reservation' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="relative z-10">Réservation</span>
                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/reservation' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
              </Link>
              <Link
                href="/boutique"
                className={`group relative transition-all duration-300 font-medium text-lg py-2 ${pathname === '/boutique' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="relative z-10">Boutique</span>
                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/boutique' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
