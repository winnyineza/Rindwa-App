import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { analyticsService } from './analytics';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  type: 'incident' | 'verification' | 'emergency' | 'general';
  incidentId?: string;
  priority?: 'low' | 'medium' | 'high';
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        analyticsService.trackNotificationPermission(false);
        return;
      }

      analyticsService.trackNotificationPermission(true);

      // Get push token
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PROJECT_ID,
        });
        this.expoPushToken = token.data;
        console.log('Expo push token:', this.expoPushToken);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      analyticsService.trackError(error as Error, { context: 'notification_init' });
    }
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { data } = notification.request.content;
    
    // Track notification received
    analyticsService.trackEvent('notification_received', {
      type: data?.type || 'unknown',
      incident_id: data?.incidentId,
      priority: data?.priority,
    });

    // Handle different notification types
    switch (data?.type) {
      case 'incident':
        this.handleIncidentNotification(data);
        break;
      case 'verification':
        this.handleVerificationNotification(data);
        break;
      case 'emergency':
        this.handleEmergencyNotification(data);
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  // Handle notification response (user interaction)
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    
    // Track notification interaction
    analyticsService.trackEvent('notification_interaction', {
      type: data?.type || 'unknown',
      incident_id: data?.incidentId,
      action: response.actionIdentifier,
    });

    // Navigate based on notification type
    this.navigateFromNotification(data);
  }

  // Handle incident notifications
  private handleIncidentNotification(data: any): void {
    console.log('New incident reported:', data);
    // You can trigger UI updates here
  }

  // Handle verification notifications
  private handleVerificationNotification(data: any): void {
    console.log('Incident verification requested:', data);
    // You can trigger UI updates here
  }

  // Handle emergency notifications
  private handleEmergencyNotification(data: any): void {
    console.log('Emergency notification:', data);
    // Play emergency sound, vibrate, etc.
    this.playEmergencyAlert();
  }

  // Navigate based on notification data
  private navigateFromNotification(data: any): void {
    // This would integrate with your navigation system
    // For now, we'll just log the intended navigation
    console.log('Navigate to:', data);
    
    switch (data?.type) {
      case 'incident':
        // Navigate to incident details
        console.log('Navigate to incident:', data.incidentId);
        break;
      case 'verification':
        // Navigate to verification screen
        console.log('Navigate to verification for incident:', data.incidentId);
        break;
      case 'emergency':
        // Navigate to emergency screen
        console.log('Navigate to emergency screen');
        break;
    }
  }

  // Play emergency alert
  private playEmergencyAlert(): void {
    // This would play a distinctive emergency sound
    console.log('Playing emergency alert sound');
  }

  // Schedule local notification
  public async scheduleLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            type: notification.type,
            incidentId: notification.incidentId,
            priority: notification.priority,
            ...notification.data,
          },
          sound: notification.type === 'emergency' ? 'emergency.wav' : 'default',
          priority: notification.priority === 'high' ? 'high' : 'default',
        },
        trigger: null, // Send immediately
      });

      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      analyticsService.trackError(error as Error, { context: 'schedule_notification' });
      throw error;
    }
  }

  // Cancel notification
  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  // Cancel all notifications
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Get push token
  public getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Send test notification
  public async sendTestNotification(): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'general',
      title: 'Test Notification',
      body: 'This is a test notification from Rindwa App',
    });
  }

  // Send incident notification
  public async sendIncidentNotification(
    incidentId: string,
    priority: 'low' | 'medium' | 'high',
    title: string,
    description: string
  ): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'incident',
      incidentId,
      priority,
      title,
      body: description,
      data: {
        incidentId,
        priority,
      },
    });
  }

  // Send verification request
  public async sendVerificationRequest(
    incidentId: string,
    title: string,
    description: string
  ): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'verification',
      incidentId,
      title,
      body: description,
      data: {
        incidentId,
        action: 'verify',
      },
    });
  }

  // Send emergency notification
  public async sendEmergencyNotification(
    title: string,
    description: string,
    data?: Record<string, any>
  ): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'emergency',
      priority: 'high',
      title,
      body: description,
      data,
    });
  }

  // Set badge count
  public async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  // Get notification permissions status
  public async getPermissionsStatus(): Promise<Notifications.PermissionStatus> {
    return await Notifications.getPermissionsAsync();
  }

  // Request permissions
  public async requestPermissions(): Promise<Notifications.PermissionStatus> {
    return await Notifications.requestPermissionsAsync();
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Convenience functions
export const initializeNotifications = () => {
  notificationService.initialize();
};

export const sendTestNotification = () => {
  notificationService.sendTestNotification();
};

export const sendIncidentNotification = (
  incidentId: string,
  priority: 'low' | 'medium' | 'high',
  title: string,
  description: string
) => {
  notificationService.sendIncidentNotification(incidentId, priority, title, description);
};

export const sendVerificationRequest = (
  incidentId: string,
  title: string,
  description: string
) => {
  notificationService.sendVerificationRequest(incidentId, title, description);
};

export const sendEmergencyNotification = (
  title: string,
  description: string,
  data?: Record<string, any>
) => {
  notificationService.sendEmergencyNotification(title, description, data);
}; 