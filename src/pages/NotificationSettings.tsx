
import { Navigation } from '@/components/Navigation';
import { NotificationSettings as NotificationSettingsComponent } from '@/components/NotificationSettings';

export default function NotificationSettings() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your push notification preferences</p>
        </div>
        
        <NotificationSettingsComponent />
      </div>
    </div>
  );
}
