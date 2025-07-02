
import { MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationSectionProps {
  currentLocation: string;
  onLocationRefresh: () => void;
}

export function LocationSection({ currentLocation, onLocationRefresh }: LocationSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 mb-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Your Current Location</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <MapPin className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{currentLocation}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLocationRefresh}
          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20 ml-2 flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Location updates automatically every 5 minutes
      </p>
    </div>
  );
}
