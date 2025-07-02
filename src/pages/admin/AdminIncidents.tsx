
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, MapPin, Eye, CheckCircle, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type IncidentCategory = Database['public']['Enums']['incident_category'];

export default function AdminIncidents() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch incidents based on user role
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['admin-incidents', profile?.role, profile?.organization_id],
    queryFn: async () => {
      let query = supabase.from('incidents').select('*');
      
      // Organization admins only see incidents relevant to their organization
      if (profile?.role === 'moderator' && profile?.organization_id) {
        // Filter by category based on organization type
        const { data: orgData } = await supabase
          .from('organizations')
          .select('type')
          .eq('id', profile.organization_id)
          .single();
        
        if (orgData) {
          const categoryMap: Record<string, IncidentCategory[]> = {
            'police': ['accident', 'security'],
            'fire': ['fire'],
            'medical': ['medical']
          };
          
          const relevantCategories = categoryMap[orgData.type] || [];
          if (relevantCategories.length > 0) {
            query = query.in('category', relevantCategories);
          }
        }
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile
  });

  // Update incident status mutation
  const updateIncidentStatus = useMutation({
    mutationFn: async ({ incidentId, status, action }: { incidentId: string; status: string; action: string }) => {
      const updateData: any = { status };
      
      if (action === 'verify') {
        updateData.verified_by = profile?.id;
      } else if (action === 'resolve') {
        updateData.resolved_by = profile?.id;
      }
      
      const { error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', incidentId);
      
      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      toast.success(`Incident ${action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
    },
    onError: (error) => {
      toast.error('Failed to update incident: ' + error.message);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'verified': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fire': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medical': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'accident': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'security': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleVerify = (incidentId: string) => {
    updateIncidentStatus.mutate({ 
      incidentId, 
      status: 'verified', 
      action: 'verify' 
    });
  };

  const handleResolve = (incidentId: string) => {
    updateIncidentStatus.mutate({ 
      incidentId, 
      status: 'resolved', 
      action: 'resolve' 
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading incidents...
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
          <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {profile?.role === 'super_admin' ? 'All Incidents' : 'Organization Incidents'} ({incidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p>No incidents found</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-gray-100">Incident</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Category</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Location</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{incident.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{incident.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(incident.category)}>
                          {incident.category.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(incident.status)}>
                          {incident.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {incident.status === 'verified' && <Eye className="h-3 w-3 mr-1" />}
                          {incident.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {incident.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{incident.location_address || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {incident.created_at ? format(new Date(incident.created_at), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {incident.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600"
                              onClick={() => handleVerify(incident.id)}
                              disabled={updateIncidentStatus.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                          {incident.status === 'verified' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-green-100 dark:hover:bg-green-900 text-green-600"
                              onClick={() => handleResolve(incident.id)}
                              disabled={updateIncidentStatus.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
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
    </div>
  );
}
