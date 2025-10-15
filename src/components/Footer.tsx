export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">La Planque</h3>
            <p className="text-gray-300">
              Votre studio d'enregistrement professionnel depuis plus de 10 ans.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liens utiles</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Accueil</a></li>
              <li><a href="/reservation" className="text-gray-300 hover:text-white transition-colors">Réservation</a></li>
              <li><a href="/boutique" className="text-gray-300 hover:text-white transition-colors">Boutique</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="text-gray-300 space-y-2">
              <p>📍 123 Rue de la Musique, Paris</p>
              <p>📞 01 23 45 67 89</p>
              <p>✉️ contact@laplanque.fr</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 La Planque. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
