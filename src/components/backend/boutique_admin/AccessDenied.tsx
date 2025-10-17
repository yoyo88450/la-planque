export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Accès refusé</h1>
        <p className="text-gray-400">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    </div>
  );
}
