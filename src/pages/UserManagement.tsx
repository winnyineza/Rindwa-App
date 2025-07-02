
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Shield, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

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

export default function UserManagement() {
  const { profile, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'user' as UserRole,
    organizationId: ''
  });

  // Fetch organizations for dropdown
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch users based on current user's role
  const { data: users = [] } = useQuery({
    queryKey: ['users', profile?.role],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          organizations (
            name,
            type
          )
        `)
        .order('created_at', { ascending: false });

      // Super admin can see all users
      if (profile?.role === 'super_admin') {
        // No additional filters
      } else if (profile?.role === 'moderator') {
        // Moderators can only see users in their organization
        query = query.eq('organization_id', profile.organization_id);
      } else {
        // Regular users shouldn't access this page
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!profile && (hasRole('super_admin') || hasRole('moderator'))
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserData) => {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          full_name: userData.fullName,
          phone: userData.phone,
          role: userData.role,
          organization_id: userData.organizationId || null
        }
      });

      if (authError) throw authError;

      // Then update the profile with additional data
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: userData.role,
            organization_id: userData.organizationId || null,
            phone: userData.phone
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      return authData;
    },
    onSuccess: () => {
      toast.success('User created successfully!');
      setIsAddUserOpen(false);
      setNewUserData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'user',
        organizationId: ''
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error('Failed to create user: ' + error.message);
    }
  });

  const handleCreateUser = () => {
    createUserMutation.mutate(newUserData);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'police': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'fire_dept': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medical_staff': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getAvailableRoles = (): UserRole[] => {
    if (profile?.role === 'super_admin') {
      return ['moderator', 'police', 'fire_dept', 'medical_staff', 'user'];
    } else if (profile?.role === 'moderator') {
      // Moderators can create users based on their organization type
      const userOrg = organizations.find(org => org.id === profile.organization_id);
      if (userOrg) {
        switch (userOrg.type) {
          case 'police': return ['police'];
          case 'fire': return ['fire_dept'];
          case 'medical': return ['medical_staff'];
          default: return ['user'];
        }
      }
      return ['user'];
    }
    return ['user'];
  };

  if (!profile || (!hasRole('super_admin') && !hasRole('moderator'))) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p>You don't have permission to access user management.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {profile.role === 'super_admin' ? 'Manage all system users' : 'Manage organization users'}
            </p>
          </div>
          
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Add New User</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Create a new user account for your {profile.role === 'super_admin' ? 'organization' : 'organization'}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="fullName"
                      value={newUserData.fullName}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
                    <Select value={newUserData.role} onValueChange={(value: UserRole) => setNewUserData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700">
                        {getAvailableRoles().map((role) => (
                          <SelectItem key={role} value={role} className="text-gray-900 dark:text-white">
                            {role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="text-gray-700 dark:text-gray-300">Organization</Label>
                    <Select value={newUserData.organizationId} onValueChange={(value) => setNewUserData(prev => ({ ...prev, organizationId: value }))}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700">
                        <SelectItem value="" className="text-gray-900 dark:text-white">No Organization</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id} className="text-gray-900 dark:text-white">
                            {org.name} ({org.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreateUser} 
                  disabled={createUserMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                      <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.full_name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{user.phone}</p>
                      {user.organizations && (
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {user.organizations.name} ({user.organizations.type})
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                    {user.is_active ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
