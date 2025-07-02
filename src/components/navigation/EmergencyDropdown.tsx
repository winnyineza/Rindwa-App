
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PhoneCall, Phone } from 'lucide-react';

export function EmergencyDropdown() {
  const handleEmergencyCall = (number: string, service: string) => {
    if (confirm(`This will call ${service} (${number}). Continue?`)) {
      window.location.href = `tel:${number}`;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20">
          <PhoneCall className="h-4 w-4 mr-2" />
          Emergency
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <DropdownMenuItem 
          onClick={() => handleEmergencyCall('911', 'Emergency Services')}
          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Phone className="mr-2 h-4 w-4" />
          Emergency Services (911)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleEmergencyCall('101', 'Police')}
          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          <Phone className="mr-2 h-4 w-4" />
          Police (101)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
