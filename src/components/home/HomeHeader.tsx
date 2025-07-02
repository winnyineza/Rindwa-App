import { Shield } from 'lucide-react';

export function HomeHeader() {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center mb-3">
        <Shield className="h-6 w-6 text-red-600 mr-2" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rindwa App</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm">Community safety incident reporting</p>
    </div>
  );
}
