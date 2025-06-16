import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

// Analytics service for tracking user behavior and app performance
export class AnalyticsService {
  private static instance: AnalyticsService;
  private isEnabled: boolean = true;

  private constructor() {
    // Initialize analytics
    this.setAnalyticsCollectionEnabled(true);
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Enable/disable analytics
  public setAnalyticsCollectionEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!__DEV__) {
      analytics().setAnalyticsCollectionEnabled(enabled);
    }
  }

  // Track screen views
  public trackScreen(screenName: string, screenClass?: string): void {
    if (!this.isEnabled || __DEV__) {
      console.log('Analytics - Screen:', screenName);
      return;
    }

    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  // Track user actions
  public trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isEnabled || __DEV__) {
      console.log('Analytics - Event:', eventName, parameters);
      return;
    }

    analytics().logEvent(eventName, parameters);
  }

  // Track user properties
  public setUserProperty(name: string, value: string): void {
    if (!this.isEnabled || __DEV__) {
      console.log('Analytics - User Property:', name, value);
      return;
    }

    analytics().setUserProperty(name, value);
  }

  // Track user ID
  public setUserId(userId: string): void {
    if (!this.isEnabled || __DEV__) {
      console.log('Analytics - User ID:', userId);
      return;
    }

    analytics().setUserId(userId);
  }

  // Track custom events for the app
  public trackLogin(method: string): void {
    this.trackEvent('login', { method });
  }

  public trackSignUp(method: string): void {
    this.trackEvent('sign_up', { method });
  }

  public trackIncidentReport(priority: string, type: string): void {
    this.trackEvent('incident_reported', {
      priority,
      type,
      platform: Platform.OS,
    });
  }

  public trackIncidentVerification(incidentId: string): void {
    this.trackEvent('incident_verified', {
      incident_id: incidentId,
      platform: Platform.OS,
    });
  }

  public trackEmergencyContactAdded(): void {
    this.trackEvent('emergency_contact_added', {
      platform: Platform.OS,
    });
  }

  public trackAppOpen(): void {
    this.trackEvent('app_open', {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
  }

  public trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent('app_error', {
      error_message: error.message,
      error_stack: error.stack,
      platform: Platform.OS,
      ...context,
    });
  }

  public trackPerformance(metric: string, value: number): void {
    this.trackEvent('performance_metric', {
      metric,
      value,
      platform: Platform.OS,
    });
  }

  // Track user engagement
  public trackEngagement(action: string, duration?: number): void {
    this.trackEvent('user_engagement', {
      action,
      duration,
      platform: Platform.OS,
    });
  }

  // Track feature usage
  public trackFeatureUsage(feature: string): void {
    this.trackEvent('feature_used', {
      feature,
      platform: Platform.OS,
    });
  }

  // Track onboarding completion
  public trackOnboardingComplete(stepsCompleted: number): void {
    this.trackEvent('onboarding_complete', {
      steps_completed: stepsCompleted,
      platform: Platform.OS,
    });
  }

  // Track settings changes
  public trackSettingChange(setting: string, value: any): void {
    this.trackEvent('setting_changed', {
      setting,
      value: String(value),
      platform: Platform.OS,
    });
  }

  // Track location permissions
  public trackLocationPermission(granted: boolean): void {
    this.trackEvent('location_permission', {
      granted,
      platform: Platform.OS,
    });
  }

  // Track notification permissions
  public trackNotificationPermission(granted: boolean): void {
    this.trackEvent('notification_permission', {
      granted,
      platform: Platform.OS,
    });
  }

  // Track app crashes
  public trackCrash(error: Error): void {
    this.trackEvent('app_crash', {
      error_message: error.message,
      error_stack: error.stack,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
  }

  // Track API performance
  public trackAPIPerformance(endpoint: string, duration: number, success: boolean): void {
    this.trackEvent('api_performance', {
      endpoint,
      duration,
      success,
      platform: Platform.OS,
    });
  }

  // Track user session
  public trackSessionStart(): void {
    this.trackEvent('session_start', {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
  }

  public trackSessionEnd(duration: number): void {
    this.trackEvent('session_end', {
      duration,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Convenience functions
export const trackScreen = (screenName: string, screenClass?: string) => {
  analyticsService.trackScreen(screenName, screenClass);
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  analyticsService.trackEvent(eventName, parameters);
};

export const setUserProperty = (name: string, value: string) => {
  analyticsService.setUserProperty(name, value);
};

export const setUserId = (userId: string) => {
  analyticsService.setUserId(userId);
}; 