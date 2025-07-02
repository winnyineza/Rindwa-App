
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ReportButton() {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md">
      <Button 
        className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl transition-all duration-200 border-0 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-red-400 dark:focus:ring-offset-gray-900"
        onClick={() => window.location.href = '/report'}
      >
        <AlertTriangle className="h-6 w-6 mr-2" />
        Report Incident
      </Button>
    </div>
  );
}
