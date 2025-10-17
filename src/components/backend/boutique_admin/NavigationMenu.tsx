import Link from 'next/link';

interface NavigationMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function NavigationMenu({ mobileMenuOpen, setMobileMenuOpen }: NavigationMenuProps) {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg md:text-xl font-bold text-white">Administration La Planque</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/admin"
              className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Tableau de bord
            </Link>
            <Link
              href="/admin/reservations"
              className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Réservations
            </Link>
            <Link
              href="/admin/artistes"
              className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Artistes
            </Link>

            <Link
              href="/admin/boutique"
              className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Boutique
            </Link>
            <Link
              href="/admin"
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
            >
              Retour
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-gray-300 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/admin"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tableau de bord
              </Link>
              <Link
                href="/admin/reservations"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Réservations
              </Link>
              <Link
                href="/admin/artistes"
                className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Artistes
              </Link>
              <Link
                href="/admin/boutique"
                className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Boutique
              </Link>
              <Link
                href="/admin"
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm text-left"
                onClick={() => setMobileMenuOpen(false)}
              >
                Retour
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
