
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface InviteOrganizationAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: UserRole;
  organizationId?: string | null;
}

export function InviteOrganizationAdminDialog({ 
  open, 
  onOpenChange, 
  userRole,
  organizationId 
}: InviteOrganizationAdminDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    organization_id: '',
    role: 'moderator' as UserRole
  });

  // Fetch organizations for super admin
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
    },
    enabled: userRole === 'super_admin'
  });

  const inviteUser = useMutation({
    mutationFn: async (data: typeof formData) => {
      // For organization admins, use their organization
      const targetOrgId = userRole === 'super_admin' ? data.organization_id : organizationId;
      
      if (!targetOrgId) {
        throw new Error('Organization ID is required');
      }

      // Create a temporary user entry
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          full_name: data.full_name,
          phone: data.phone,
          role: userRole === 'super_admin' ? 'moderator' : data.role,
          organization_id: targetOrgId,
          is_active: false
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully!');
      onOpenChange(false);
      setFormData({
        email: '',
        full_name: '',
        phone: '',
        organization_id: '',
        role: 'moderator'
      });
      queryClient.invalidateQueries({ queryKey: ['organization-admins'] });
      queryClient.invalidateQueries({ queryKey: ['organization-staff'] });
    },
    onError: (error: any) => {
      toast.error('Failed to send invitation: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      toast.error('Full name and email are required');
      return;
    }

    if (userRole === 'super_admin' && !formData.organization_id) {
      toast.error('Please select an organization');
      return;
    }

    inviteUser.mutate(formData);
  };

  const getDialogTitle = () => {
    return userRole === 'super_admin' 
      ? 'Invite Organization Administrator' 
      : 'Add Staff Member';
  };

  const getDialogDescription = () => {
    return userRole === 'super_admin'
      ? 'Invite a new organization administrator to manage their organization.'
      : 'Add a new staff member to your organization.';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-gray-700 dark:text-gray-300">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+250 788 123 456"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          </div>
          
          {userRole === 'super_admin' && (
            <div className="space-y-2">
              <Label htmlFor="organization" className="text-gray-700 dark:text-gray-300">Organization *</Label>
              <Select value={formData.organization_id} onValueChange={(value) => setFormData(prev => ({ ...prev, organization_id: value }))}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {userRole === 'moderator' && (
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
                  <SelectItem value="police">Police</SelectItem>
                  <SelectItem value="fire_dept">Fire Department</SelectItem>
                  <SelectItem value="medical_staff">Medical Staff</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={inviteUser.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {inviteUser.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
