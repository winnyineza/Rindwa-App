import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Activity, CheckCircle, Clock, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type IncidentCategory = Database['public']['Enums']['incident_category'];
type IncidentStatus = Database['public']['Enums']['incident_status'];

interface IncidentWithProfile {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  profiles: { full_name: string } | null;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['dashboard-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          id,
          title,
          description,
          category,
          status,
          location_address,
          latitude,
          longitude,
          created_at,
          profiles!reporter_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return (data || []).map(incident => ({
        ...incident,
        profiles: incident.profiles && typeof incident.profiles === 'object' && 'full_name' in incident.profiles 
          ? { full_name: (incident.profiles as { full_name: string }).full_name } 
          : null
      })) as IncidentWithProfile[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [pendingRes, verifiedRes, resolvedRes, totalRes] = await Promise.all([
        supabase.from('incidents').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('incidents').select('*', { count: 'exact' }).eq('status', 'verified'),
        supabase.from('incidents').select('*', { count: 'exact' }).eq('status', 'resolved'),
        supabase.from('incidents').select('*', { count: 'exact' })
      ]);

      return {
        pending: pendingRes.count || 0,
        verified: verifiedRes.count || 0,
        resolved: resolvedRes.count || 0,
        total: totalRes.count || 0
      };
    },
  });

  const getCategoryColor = (category: IncidentCategory): string => {
    switch (category) {
      case 'fire': return 'bg-red-600';
      case 'medical': return 'bg-blue-600';
      case 'accident': return 'bg-orange-600';
      case 'security': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Monitor and manage emergency incidents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.verified || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.resolved || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Latest emergency reports</CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {getTimeAgo(incident.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {incident.location_address || 'Location not specified'}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`${getCategoryColor(incident.category)} text-white text-xs`}>
                      {incident.category.toUpperCase()}
                    </Badge>
                    <Badge variant={incident.status === 'resolved' ? 'default' : incident.status === 'verified' ? 'secondary' : 'outline'}>
                      {incident.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {incident.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Reported by: {incident.profiles?.full_name || 'Anonymous'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/incident/${incident.id}`)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No incidents found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
