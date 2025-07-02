
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pushNotificationService } from '@/services/pushNotifications';

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!user) return;

      const isSupported = await pushNotificationService.initialize();
      
      if (isSupported && 'Notification' in window && Notification.permission === 'granted') {
        // Auto-subscribe if user previously granted permission
        const token = await pushNotificationService.subscribeToPush();
        if (token) {
          await pushNotificationService.saveFCMToken(token, user.id);
        }
      }
    };

    initializeNotifications();
  }, [user]);
}
