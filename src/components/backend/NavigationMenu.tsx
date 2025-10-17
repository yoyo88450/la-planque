import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationMenuProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export default function NavigationMenu({ mobileMenuOpen, setMobileMenuOpen }: NavigationMenuProps) {
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isMobileMenuOpen = mobileMenuOpen !== undefined ? mobileMenuOpen : internalMobileMenuOpen;
  const setIsMobileMenuOpen = setMobileMenuOpen || setInternalMobileMenuOpen;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-black to-gray-900 shadow-2xl border-b border-gray-800/50 backdrop-blur-sm">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="transition-all duration-300 transform hover:scale-105">
            <img src="/image1.png" alt="La Planque" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-10">
            <Link href="/admin" className={`group relative transition-all duration-300 font-medium text-lg ${pathname === '/admin' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <span className="relative z-10">Tableau de bord</span>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/admin/reservations" className={`group relative transition-all duration-300 font-medium text-lg ${pathname === '/admin/reservations' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <span className="relative z-10">Réservations</span>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin/reservations' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/admin/artistes" className={`group relative transition-all duration-300 font-medium text-lg ${pathname === '/admin/artistes' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <span className="relative z-10">Artistes</span>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin/artistes' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/admin/boutique" className={`group relative transition-all duration-300 font-medium text-lg ${pathname === '/admin/boutique' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <span className="relative z-10">Boutique</span>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin/boutique' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/admin/reglage" className={`group relative transition-all duration-300 font-medium text-lg ${pathname === '/admin/reglage' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <span className="relative z-10">Réglages</span>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin/reglage' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link href="/" className={`group relative transition-all duration-300 font-medium text-lg text-gray-300 hover:text-white`}>
              <span className="relative z-10">Accueil</span>
              <div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 w-0 group-hover:w-full"></div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-110"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col space-y-6">
              <Link
                href="/admin"
                className={`group relative transition-all duration-300 font-medium text-lg py-2 ${pathname === '/admin' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative z-10">Tableau de bord</span>
                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
              </Link>
              <Link
                href="/admin/reservations"
                className={`group relative transition-all duration-300 font-medium text-lg py-2 ${pathname === '/admin/reservations' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative z-10">Réservations</span>
                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin/reservations' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
              </Link>
              <Link
                href="/admin/artistes"
                className={`group relative transition-all duration-300 font-medium text-lg py-2 ${pathname === '/admin/artistes' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative z-10">Artistes</span>
                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin/artistes' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
              </Link>
              <Link
                href="/admin/boutique"
                className={`group relative transition-all duration-300 font-medium text-lg py-2 ${pathname === '/admin/boutique' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative z-10">Boutique</span>
                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin/boutique' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
              </Link>
              <Link
                href="/admin/reglage"
                className={`group relative transition-all duration-300 font-medium text-lg py-2 ${pathname === '/admin/reglage' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative z-10">Réglages</span>
                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ${pathname === '/admin/reglage' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
              </Link>
              <Link
                href="/"
                className={`group relative transition-all duration-300 font-medium text-lg py-2 text-gray-300 hover:text-white`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative z-10">Accueil</span>
                <div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 w-0 group-hover:w-full"></div>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
