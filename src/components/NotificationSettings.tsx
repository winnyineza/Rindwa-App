
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pushNotificationService } from '@/services/pushNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationSettings() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState({
    incident_created: true,
    incident_verified: true,
    incident_resolved: true,
    nearby_incidents: true
  });

  useEffect(() => {
    checkNotificationSupport();
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const checkNotificationSupport = async () => {
    const supported = await pushNotificationService.initialize();
    setIsSupported(supported);
    
    if (supported && 'Notification' in window) {
      setIsSubscribed(Notification.permission === 'granted');
    }
  };

  const loadPreferences = async () => {
    if (!user) return;
    
    const prefs = await pushNotificationService.getNotificationPreferences(user.id);
    if (prefs) {
      setPreferences(prefs);
    }
  };

  const handleSubscribeToNotifications = async () => {
    if (!user) return;

    try {
      const permission = await pushNotificationService.requestPermission();
      if (!permission) {
        toast.error('Permission denied for notifications');
        return;
      }

      const token = await pushNotificationService.subscribeToPush();
      if (token) {
        await pushNotificationService.saveFCMToken(token, user.id);
        setIsSubscribed(true);
        toast.success('Successfully subscribed to notifications!');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('Failed to subscribe to notifications');
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!user) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      await pushNotificationService.updateNotificationPreferences(user.id, newPreferences);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <BellOff className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-500 dark:text-gray-400">Push notifications are not supported in this browser.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <Bell className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {!isSubscribed ? (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enable push notifications to receive real-time updates about incidents in your area.
            </p>
            <Button 
              onClick={handleSubscribeToNotifications}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
            >
              Enable Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600 dark:text-green-400 font-medium">✓ Push notifications are enabled</p>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Notification Preferences</h4>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <Label htmlFor="incident_created" className="text-gray-700 dark:text-gray-300">New Incidents Created</Label>
                <Switch
                  id="incident_created"
                  checked={preferences.incident_created}
                  onCheckedChange={(value) => handlePreferenceChange('incident_created', value)}
                  className="data-[state=checked]:bg-red-600 dark:data-[state=checked]:bg-red-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <Label htmlFor="incident_verified" className="text-gray-700 dark:text-gray-300">Incidents Verified</Label>
                <Switch
                  id="incident_verified"
                  checked={preferences.incident_verified}
                  onCheckedChange={(value) => handlePreferenceChange('incident_verified', value)}
                  className="data-[state=checked]:bg-red-600 dark:data-[state=checked]:bg-red-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <Label htmlFor="incident_resolved" className="text-gray-700 dark:text-gray-300">Incidents Resolved</Label>
                <Switch
                  id="incident_resolved"
                  checked={preferences.incident_resolved}
                  onCheckedChange={(value) => handlePreferenceChange('incident_resolved', value)}
                  className="data-[state=checked]:bg-red-600 dark:data-[state=checked]:bg-red-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <Label htmlFor="nearby_incidents" className="text-gray-700 dark:text-gray-300">Nearby Incidents</Label>
                <Switch
                  id="nearby_incidents"
                  checked={preferences.nearby_incidents}
                  onCheckedChange={(value) => handlePreferenceChange('nearby_incidents', value)}
                  className="data-[state=checked]:bg-red-600 dark:data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
