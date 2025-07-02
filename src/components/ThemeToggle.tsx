
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-700 dark:text-gray-300" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-700 dark:text-gray-300" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg dark:shadow-xl z-50"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-100">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-100">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-100">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
