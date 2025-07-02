
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavigationLogo } from '@/components/navigation/NavigationLogo';
import { NavigationItems } from '@/components/navigation/NavigationItems';
import { NotificationsDropdown } from '@/components/navigation/NotificationsDropdown';
import { UserMenu } from '@/components/navigation/UserMenu';

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavigationLogo />
          
          <div className="hidden md:flex items-center space-x-4">
            <NavigationItems />
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <NotificationsDropdown />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
