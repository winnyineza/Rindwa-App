import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { analyticsService } from './analytics';

export interface DeepLinkData {
  route: string;
  params?: Record<string, any>;
}

export class DeepLinkingService {
  private static instance: DeepLinkingService;
  private isInitialized: boolean = false;
  private navigationRef: any = null;

  private constructor() {}

  public static getInstance(): DeepLinkingService {
    if (!DeepLinkingService.instance) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }

  // Initialize deep linking
  public initialize(navigationRef: any): void {
    if (this.isInitialized) return;

    this.navigationRef = navigationRef;

    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleDeepLink(url);
      }
    });

    // Handle URL changes
    Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url);
    });

    this.isInitialized = true;
    console.log('Deep linking service initialized');
  }

  // Handle deep link URL
  private handleDeepLink(url: string): void {
    try {
      console.log('Handling deep link:', url);
      
      // Track deep link usage
      analyticsService.trackEvent('deep_link_opened', {
        url,
        platform: Platform.OS,
      });

      const parsedUrl = Linking.parse(url);
      const { hostname, path, queryParams } = parsedUrl;

      // Handle different deep link patterns
      if (hostname === 'incident') {
        this.handleIncidentLink(path, queryParams);
      } else if (hostname === 'verify') {
        this.handleVerificationLink(path, queryParams);
      } else if (hostname === 'emergency') {
        this.handleEmergencyLink(path, queryParams);
      } else if (hostname === 'profile') {
        this.handleProfileLink(path, queryParams);
      } else {
        console.log('Unknown deep link hostname:', hostname);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      analyticsService.trackError(error as Error, { context: 'deep_link_handling' });
    }
  }

  // Handle incident deep links
  private handleIncidentLink(path: string, params: Record<string, any>): void {
    const incidentId = params?.id || path?.split('/')[1];
    
    if (!incidentId) {
      console.error('No incident ID provided in deep link');
      return;
    }

    this.navigateToScreen('IncidentDetails', { incidentId });
  }

  // Handle verification deep links
  private handleVerificationLink(path: string, params: Record<string, any>): void {
    const incidentId = params?.id || path?.split('/')[1];
    
    if (!incidentId) {
      console.error('No incident ID provided in verification deep link');
      return;
    }

    this.navigateToScreen('Verification', { incidentId });
  }

  // Handle emergency deep links
  private handleEmergencyLink(path: string, params: Record<string, any>): void {
    this.navigateToScreen('Emergency', params);
  }

  // Handle profile deep links
  private handleProfileLink(path: string, params: Record<string, any>): void {
    this.navigateToScreen('Profile', params);
  }

  // Navigate to screen
  private navigateToScreen(screenName: string, params?: Record<string, any>): void {
    if (!this.navigationRef?.current) {
      console.error('Navigation ref not available');
      return;
    }

    try {
      this.navigationRef.current.navigate(screenName, params);
      
      // Track navigation
      analyticsService.trackEvent('deep_link_navigation', {
        screen: screenName,
        params: JSON.stringify(params),
      });
    } catch (error) {
      console.error('Navigation error:', error);
      analyticsService.trackError(error as Error, { 
        context: 'deep_link_navigation',
        screen: screenName,
      });
    }
  }

  // Create deep link URL
  public createDeepLink(data: DeepLinkData): string {
    const baseUrl = Linking.createURL('/');
    const url = `${baseUrl}${data.route}`;
    
    if (data.params) {
      const queryString = Object.entries(data.params)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      return `${url}?${queryString}`;
    }
    
    return url;
  }

  // Create incident deep link
  public createIncidentLink(incidentId: string): string {
    return this.createDeepLink({
      route: 'incident',
      params: { id: incidentId },
    });
  }

  // Create verification deep link
  public createVerificationLink(incidentId: string): string {
    return this.createDeepLink({
      route: 'verify',
      params: { id: incidentId },
    });
  }

  // Create emergency deep link
  public createEmergencyLink(params?: Record<string, any>): string {
    return this.createDeepLink({
      route: 'emergency',
      params,
    });
  }

  // Create profile deep link
  public createProfileLink(userId?: string): string {
    return this.createDeepLink({
      route: 'profile',
      params: userId ? { id: userId } : undefined,
    });
  }

  // Share deep link
  public async shareDeepLink(data: DeepLinkData, message?: string): Promise<void> {
    try {
      const url = this.createDeepLink(data);
      const shareMessage = message || 'Check out this incident on Rindwa App';
      
      await Linking.shareAsync(url, {
        message: `${shareMessage}\n\n${url}`,
        title: 'Rindwa App',
      });

      // Track sharing
      analyticsService.trackEvent('deep_link_shared', {
        route: data.route,
        params: JSON.stringify(data.params),
      });
    } catch (error) {
      console.error('Error sharing deep link:', error);
      analyticsService.trackError(error as Error, { context: 'deep_link_sharing' });
    }
  }

  // Share incident
  public async shareIncident(incidentId: string, title?: string): Promise<void> {
    await this.shareDeepLink(
      {
        route: 'incident',
        params: { id: incidentId },
      },
      title || 'Check out this incident'
    );
  }

  // Get app URL scheme
  public getAppUrlScheme(): string {
    return Linking.createURL('/');
  }

  // Check if URL is a deep link
  public isDeepLink(url: string): boolean {
    try {
      const parsedUrl = Linking.parse(url);
      return parsedUrl.hostname !== null;
    } catch {
      return false;
    }
  }

  // Handle notification deep links
  public handleNotificationDeepLink(data: any): void {
    if (data?.type === 'incident' && data?.incidentId) {
      this.navigateToScreen('IncidentDetails', { incidentId: data.incidentId });
    } else if (data?.type === 'verification' && data?.incidentId) {
      this.navigateToScreen('Verification', { incidentId: data.incidentId });
    } else if (data?.type === 'emergency') {
      this.navigateToScreen('Emergency', data);
    }
  }
}

// Export singleton instance
export const deepLinkingService = DeepLinkingService.getInstance();

// Convenience functions
export const initializeDeepLinking = (navigationRef: any) => {
  deepLinkingService.initialize(navigationRef);
};

export const createIncidentLink = (incidentId: string) => {
  return deepLinkingService.createIncidentLink(incidentId);
};

export const createVerificationLink = (incidentId: string) => {
  return deepLinkingService.createVerificationLink(incidentId);
};

export const shareIncident = (incidentId: string, title?: string) => {
  return deepLinkingService.shareIncident(incidentId, title);
};

export const handleNotificationDeepLink = (data: any) => {
  deepLinkingService.handleNotificationDeepLink(data);
}; 