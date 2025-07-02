
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Users, Edit } from 'lucide-react';
import { CreateOrganizationDialog } from '@/components/admin/CreateOrganizationDialog';
import { EditOrganizationDialog } from '@/components/admin/EditOrganizationDialog';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminOrganizations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch organizations
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteOrganization = useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase
        .from('organizations')
        .update({ is_active: false })
        .eq('id', orgId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Organization deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => {
      toast.error('Failed to deactivate organization: ' + error.message);
    }
  });

  const getTypeColors = (types: string) => {
    const typeArray = types.split(',').map(t => t.trim());
    return typeArray.map(type => {
      switch (type) {
        case 'police': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'fire': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'medical': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading organizations...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Organization Management ({organizations.length})
            </CardTitle>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p>No organizations created yet</p>
              <p className="text-sm">Create your first organization to get started</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-gray-100">Organization</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Types</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Contact</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Created</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{org.name}</div>
                          {org.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{org.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {org.type.split(',').map((type: string, index: number) => (
                            <Badge key={index} variant="outline" className={getTypeColors(org.type)[index]}>
                              {type.trim().toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {org.contact_email && <div className="text-gray-700 dark:text-gray-300">{org.contact_email}</div>}
                          {org.contact_phone && <div className="text-gray-500 dark:text-gray-400">{org.contact_phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={org.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                          {org.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {org.created_at ? format(new Date(org.created_at), 'MMM dd, yyyy') : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setEditingOrganization(org)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateOrganizationDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />

      <EditOrganizationDialog
        open={!!editingOrganization}
        onOpenChange={(open) => !open && setEditingOrganization(null)}
        organization={editingOrganization}
      />
    </div>
  );
}
