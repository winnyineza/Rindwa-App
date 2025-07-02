
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationDialog({ open, onOpenChange }: CreateOrganizationDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });

  const createOrganization = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from('organizations')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Organization created successfully!');
      setFormData({
        name: '',
        type: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        address: ''
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: any) => {
      toast.error('Failed to create organization: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      toast.error('Please fill in required fields');
      return;
    }
    createOrganization.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Create New Organization</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Add a new organization to the system. You can invite administrators later.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Organization Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Rwanda National Police"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Organization Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700">
                <SelectItem value="police">Police</SelectItem>
                <SelectItem value="fire">Fire Department</SelectItem>
                <SelectItem value="medical">Medical Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the organization"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
                placeholder="contact@org.rw"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="text-gray-700 dark:text-gray-300">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="+250 788 123 456"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Organization headquarters address"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
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
              disabled={createOrganization.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {createOrganization.isPending ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
