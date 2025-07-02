
import { supabase } from '@/integrations/supabase/client';

// Firebase configuration for push notifications
const firebaseConfig = {
  apiKey: "AIzaSyBht9L-XuGygrQSZSfx39INbKy_EAwRE-w",
  authDomain: "rindwa-app-c7a01.firebaseapp.com",
  projectId: "rindwa-app-c7a01",
  storageBucket: "rindwa-app-c7a01.firebasestorage.app",
  messagingSenderId: "203402256033",
  appId: "1:203402256033:web:d2d596a925b7f8f4659ae0",
  measurementId: "G-VHMZ149KQY"
};

class PushNotificationService {
  private vapidKey = 'BMZhdTzBhGnsRj6BCCzaPxLXYE_PbB-M5JZGu942feIBc9cMi_94Bhc-2FW-RsTKl3xW70DRnMwdUUvPPOdGPuQ';
  private registration: ServiceWorkerRegistration | null = null;

  async initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(): Promise<string | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey)
      });

      const token = btoa(JSON.stringify(subscription));
      return token;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async saveFCMToken(token: string, userId: string) {
    try {
      const { error } = await supabase
        .from('fcm_tokens')
        .upsert({
          user_id: userId,
          token: token,
          device_type: 'web'
        }, {
          onConflict: 'token'
        });

      if (error) throw error;
      console.log('FCM token saved successfully');
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  async getNotificationPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      console.log('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotificationService = new PushNotificationService();
