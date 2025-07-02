
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface EditOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: any;
}

const organizationTypes = [
  { id: 'police', label: 'Police' },
  { id: 'fire', label: 'Fire Department' },
  { id: 'medical', label: 'Medical Services' },
  { id: 'other', label: 'Other' }
];

export function EditOrganizationDialog({ open, onOpenChange, organization }: EditOrganizationDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    types: [] as string[],
    is_active: true
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        contact_email: organization.contact_email || '',
        contact_phone: organization.contact_phone || '',
        address: organization.address || '',
        types: organization.type ? organization.type.split(',').map((t: string) => t.trim()) : [],
        is_active: organization.is_active !== false
      });
    }
  }, [organization]);

  const updateOrganization = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!organization?.id) throw new Error('Organization ID is required');

      const { error } = await supabase
        .from('organizations')
        .update({
          name: data.name,
          type: data.types.join(', '),
          description: data.description,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          address: data.address,
          is_active: data.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Organization updated successfully!');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update organization: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.types.length === 0) {
      toast.error('Name and at least one type are required');
      return;
    }

    updateOrganization.mutate(formData);
  };

  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        types: [...prev.types, typeId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        types: prev.types.filter(t => t !== typeId)
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Edit Organization</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Modify the organization details and settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Organization Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Organization Types *</Label>
            <div className="grid grid-cols-2 gap-2">
              {organizationTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={formData.types.includes(type.id)}
                    onCheckedChange={(checked) => handleTypeChange(type.id, checked as boolean)}
                  />
                  <Label htmlFor={type.id} className="text-sm text-gray-700 dark:text-gray-300">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-gray-700 dark:text-gray-300">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="text-gray-700 dark:text-gray-300">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked as boolean }))}
            />
            <Label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
              Organization is active
            </Label>
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
              disabled={updateOrganization.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {updateOrganization.isPending ? 'Updating...' : 'Update Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
