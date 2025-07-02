
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export function NotificationsDropdown() {
  const { user } = useAuth();

  const { data: notificationCount = 0 } = useQuery({
    queryKey: ['notification-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      // For now, return 0 since there's no notifications table
      // When you implement notifications, you can query the actual count here
      return 0;
    },
    enabled: !!user?.id,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-xs rounded-full h-5 w-5 flex items-center justify-center text-white font-medium">
              {notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg dark:shadow-xl z-50"
      >
        <div className="p-2">
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Recent Notifications</h4>
          <div className="space-y-2">
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
