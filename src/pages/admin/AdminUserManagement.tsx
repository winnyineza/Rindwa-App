
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Edit, Building } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { InviteOrganizationAdminDialog } from '@/components/admin/InviteOrganizationAdminDialog';

type UserRole = Database['public']['Enums']['user_role'];

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  organization_id: string | null;
  is_active: boolean | null;
  created_at: string | null;
  organizations?: {
    name: string;
    type: string;
  } | null;
}

export default function AdminUserManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Fetch organization admins only for super admin
  const { data: organizationAdmins = [] } = useQuery({
    queryKey: ['organization-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations (
            name,
            type
          )
        `)
        .eq('role', 'moderator')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!profile && profile.role === 'super_admin'
  });

  // Fetch organization staff for organization admins
  const { data: organizationStaff = [] } = useQuery({
    queryKey: ['organization-staff', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations (
            name,
            type
          )
        `)
        .eq('organization_id', profile.organization_id)
        .neq('role', 'moderator')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!profile && profile.role === 'moderator' && !!profile.organization_id
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moderator': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'police': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fire_dept': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medical_staff': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const renderSuperAdminView = () => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Organization Administrators ({organizationAdmins.length})
          </CardTitle>
          <Button 
            onClick={() => setShowInviteDialog(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Organization Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-gray-900 dark:text-gray-100">Administrator</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Organization</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizationAdmins.map((admin) => (
                <TableRow key={admin.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{admin.full_name}</div>
                      {admin.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{admin.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-700 dark:text-gray-300">
                      {admin.organizations ? (
                        <div>
                          <div className="font-medium">{admin.organizations.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {admin.organizations.type}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No Organization</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={admin.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setEditingUser(admin)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderOrganizationAdminView = () => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Organization Staff ({organizationStaff.length})
          </CardTitle>
          <Button 
            onClick={() => setShowInviteDialog(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-gray-900 dark:text-gray-100">Name</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Role</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizationStaff.map((staff) => (
                <TableRow key={staff.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{staff.full_name}</div>
                      {staff.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{staff.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeColor(staff.role)}>
                      {staff.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={staff.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                      {staff.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setEditingUser(staff)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {profile?.role === 'super_admin' ? renderSuperAdminView() : renderOrganizationAdminView()}

      <EditUserDialog 
        open={!!editingUser} 
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
      />

      <InviteOrganizationAdminDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog}
        userRole={profile?.role || 'user'}
        organizationId={profile?.organization_id}
      />
    </div>
  );
}
