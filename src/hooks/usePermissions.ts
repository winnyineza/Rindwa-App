
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Permission {
  role: string;
  permission: string;
  resource_type: string | null;
}

export function usePermissions() {
  const { profile } = useAuth();

  const { data: permissions = [] } = useQuery({
    queryKey: ['user-permissions', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', profile.role);
      
      if (error) throw error;
      return data as Permission[];
    },
    enabled: !!profile
  });

  const hasPermission = (permission: string, resourceType?: string): boolean => {
    if (!profile || !permissions.length) return false;
    
    // Super admin has full access
    if (profile.role === 'super_admin') return true;
    
    return permissions.some(p => 
      (p.permission === permission || p.permission === 'full_access') &&
      (!resourceType || p.resource_type === resourceType || p.resource_type === 'all')
    );
  };

  const canAccessIncidentCategory = (category: string): boolean => {
    if (!profile) return false;
    
    switch (profile.role) {
      case 'super_admin':
      case 'moderator':
      case 'user':
        return true;
      case 'police':
        return ['accident', 'security'].includes(category);
      case 'fire_dept':
        return category === 'fire';
      case 'medical_staff':
        return category === 'medical';
      default:
        return false;
    }
  };

  const canAccessAdminDashboard = (): boolean => {
    if (!profile) return false;
    return ['super_admin', 'moderator', 'police', 'fire_dept', 'medical_staff'].includes(profile.role);
  };

  const canManageUsers = (): boolean => {
    return hasPermission('manage_users', 'user');
  };

  const canVerifyIncidents = (): boolean => {
    return hasPermission('verify_incident', 'incident');
  };

  const canResolveIncidents = (): boolean => {
    return hasPermission('resolve_incident', 'incident');
  };

  const canViewAnalytics = (): boolean => {
    return hasPermission('view_analytics', 'analytics') || hasPermission('view_basic_analytics', 'analytics');
  };

  return {
    permissions,
    hasPermission,
    canAccessIncidentCategory,
    canAccessAdminDashboard,
    canManageUsers,
    canVerifyIncidents,
    canResolveIncidents,
    canViewAnalytics,
    userRole: profile?.role || 'user'
  };
}
