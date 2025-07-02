
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Phone, Settings, LogOut, Bell, Building, Shield, Users } from 'lucide-react';

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const canAccessDashboard = () => {
    return profile && profile.role === 'moderator';
  };

  const canAccessAdmin = () => {
    return profile && profile.role === 'super_admin';
  };

  const canAccessUserManagement = () => {
    return profile && (profile.role === 'super_admin' || profile.role === 'moderator');
  };

  if (!profile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`text-white ${profile.role === 'super_admin' ? 'bg-red-600' : 'bg-red-100 text-red-700'}`}>
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{profile.full_name}</p>
          <p className={`text-xs leading-none ${profile.role === 'super_admin' ? 'text-red-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
            {profile.role === 'super_admin' ? 'SUPER ADMIN' : profile.role.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/emergency-contacts" className="flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
            <Phone className="mr-2 h-4 w-4" />
            Emergency Contacts
          </Link>
        </DropdownMenuItem>
        {canAccessDashboard() && (
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
              <Building className="mr-2 h-4 w-4" />
              Department Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        {canAccessAdmin() && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center text-red-700 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 font-medium">
              <Shield className="mr-2 h-4 w-4" />
              Super Admin Control Panel
            </Link>
          </DropdownMenuItem>
        )}
        {canAccessUserManagement() && (
          <DropdownMenuItem asChild>
            <Link to="/users" className="flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
