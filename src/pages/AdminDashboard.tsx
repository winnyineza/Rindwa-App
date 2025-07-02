import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, Lock, CheckCircle, TrendingUp, Clock, Plus, UserPlus, Download
} from 'lucide-react';
import AdminOrganizations from './admin/AdminOrganizations';
import AdminUserManagement from './admin/AdminUserManagement';
import AdminCommunications from './admin/AdminCommunications';
import AdminAnalytics from './admin/AdminAnalytics';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { canAccessAdminDashboard, userRole } = usePermissions();

  // Redirect if user doesn't have admin access
  if (!canAccessAdminDashboard() || userRole !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <CardTitle className="text-gray-900 dark:text-gray-100">Super Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-400">
              This control panel is restricted to Super Admin accounts only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch comprehensive dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const [
        incidentsRes,
        pendingRes,
        verifiedRes,
        resolvedRes,
        usersRes,
        adminsRes
      ] = await Promise.all([
        supabase.from('incidents').select('id, category, created_at', { count: 'exact' }),
        supabase.from('incidents').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('incidents').select('id', { count: 'exact' }).eq('status', 'verified'),
        supabase.from('incidents').select('id', { count: 'exact' }).eq('status', 'resolved'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
        supabase.from('profiles').select('id', { count: 'exact' }).neq('role', 'user')
      ]);

      // Calculate category distribution
      const categoryDistribution = incidentsRes.data?.reduce((acc, incident) => {
        acc[incident.category] = (acc[incident.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        totalIncidents: incidentsRes.count || 0,
        pendingIncidents: pendingRes.count || 0,
        verifiedIncidents: verifiedRes.count || 0,
        resolvedIncidents: resolvedRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalAdmins: adminsRes.count || 0,
        categoryDistribution,
        incidentTrends: incidentsRes.data || []
      };
    },
    enabled: !!profile
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">Dashboard Home</TabsTrigger>
            <TabsTrigger value="organizations" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">Organizations</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">User Management</TabsTrigger>
            <TabsTrigger value="communications" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">Communications</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Incidents</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardStats?.totalIncidents || 0}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">All reported incidents</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dashboardStats?.pendingIncidents || 0}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">Awaiting verification</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Reports</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboardStats?.verifiedIncidents || 0}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">Verified incidents</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Resolved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardStats?.resolvedIncidents || 0}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">Completed cases</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Incident Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(dashboardStats?.categoryDistribution || {}).map(([category, count]) => (
                    <div key={category} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">System Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Citizens</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{dashboardStats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Staff & Admins</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{dashboardStats?.totalAdmins || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Organization
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Organization Admin
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Incident Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Organizations Management */}
          <TabsContent value="organizations">
            <AdminOrganizations />
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          {/* Communications */}
          <TabsContent value="communications">
            <AdminCommunications />
          </TabsContent>

          {/* Analytics & Reports */}
          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
