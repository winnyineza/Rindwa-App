import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function NavigationLogo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
        <Shield className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">Rindwa App</span>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">Community Safety</p>
      </div>
    </Link>
  );
}
