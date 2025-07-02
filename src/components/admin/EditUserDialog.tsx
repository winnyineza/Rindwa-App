
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    role: 'user' as UserRole,
    organization_id: '',
    is_active: true
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

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        role: user.role,
        organization_id: user.organization_id || '',
        is_active: user.is_active ?? true
      });
    }
  }, [user]);

  const updateUser = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('No user selected');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
          organization_id: data.organization_id || null,
          is_active: data.is_active
        })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('User updated successfully!');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update user: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) {
      toast.error('Full name is required');
      return;
    }
    updateUser.mutate(formData);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Edit User</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Update user information and permissions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
            <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700">
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="police">Police</SelectItem>
                <SelectItem value="fire_dept">Fire Department</SelectItem>
                <SelectItem value="medical_staff">Medical Staff</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organization" className="text-gray-700 dark:text-gray-300">Organization</Label>
            <Select value={formData.organization_id} onValueChange={(value) => setFormData(prev => ({ ...prev, organization_id: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700">
                <SelectItem value="">No Organization</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} ({org.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active" className="text-gray-700 dark:text-gray-300">Active User</Label>
          </div>
          
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
              disabled={updateUser.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {updateUser.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
