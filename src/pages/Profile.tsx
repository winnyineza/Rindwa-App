
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/home/BottomNavigation';

export default function Profile() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-white">
              <User className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {profile && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="h-16 w-16 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.full_name}</h3>
                  <Badge variant="outline" className="mt-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {profile.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Role</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{profile?.role.replace('_', ' ').toUpperCase()}</p>
                </CardContent>
              </Card>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  type="tel"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
