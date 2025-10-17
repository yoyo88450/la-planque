export default function InfoSection() {
  return (
    <div className="mt-12 bg-gray-800 border border-gray-600 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Informations livraison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
        <div>
          <h4 className="font-medium mb-2">Livraison</h4>
          <ul className="space-y-1 text-sm">
            <li>• Livraison gratuite dès 50€ d'achat</li>
            <li>• Livraison sous 3-5 jours ouvrés</li>
            <li>• Suivi de commande par email</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Retours</h4>
          <ul className="space-y-1 text-sm">
            <li>• Retour gratuit sous 30 jours</li>
            <li>• Produits neufs uniquement</li>
            <li>• Remboursement sous 7 jours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
