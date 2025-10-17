interface LoadingSpinnerProps {
  loading: boolean;
}

export default function LoadingSpinner({ loading }: LoadingSpinnerProps) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-white">Chargement des rendez-vous...</span>
        </div>
      </div>
    </div>
  );
}
