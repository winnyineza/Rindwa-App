
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building, Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function NavigationItems() {
  const { profile } = useAuth();

  const canAccessDashboard = () => {
    return profile && profile.role === 'moderator';
  };

  const canAccessAdmin = () => {
    return profile && profile.role === 'super_admin';
  };

  const canAccessUserManagement = () => {
    return profile && (profile.role === 'super_admin' || profile.role === 'moderator');
  };

  return (
    <div className="hidden md:flex items-center space-x-4">
      {canAccessDashboard() && (
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
            <Building className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      )}

      {canAccessAdmin() && (
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
            <Shield className="h-4 w-4 mr-2" />
            Super Admin
          </Button>
        </Link>
      )}

      {canAccessUserManagement() && (
        <Link to="/users">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20">
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
        </Link>
      )}
    </div>
  );
}
