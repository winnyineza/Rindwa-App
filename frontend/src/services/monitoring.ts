import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

// Initialize Sentry for error tracking and performance monitoring
export const initializeMonitoring = () => {
  if (__DEV__) {
    // Don't initialize Sentry in development
    console.log('Sentry disabled in development mode');
    return;
  }

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || 'your-sentry-dsn-here',
    debug: false,
    enableAutoSessionTracking: true,
    // Performance monitoring
    tracesSampleRate: 0.2,
    // Session tracking
    autoSessionTracking: true,
    // Environment
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'production',
    // Release tracking
    release: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    // Platform-specific settings
    integrations: [
      new Sentry.ReactNativeTracing({
        tracingOrigins: ['localhost', 'your-api-domain.com'],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],
    // Before send filter
    beforeSend(event) {
      // Filter out certain errors
      if (event.exception) {
        const exception = event.exception.values?.[0];
        if (exception?.value?.includes('Network request failed')) {
          return null; // Don't send network errors
        }
      }
      return event;
    },
  });
};

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring
export const startPerformanceMonitoring = (name: string) => {
  if (__DEV__) return null;
  
  return Sentry.startTransaction({
    name,
    op: 'navigation',
  });
};

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  if (__DEV__) {
    console.error('Error in development:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
};

// User identification
export const identifyUser = (userId: string, userData?: Record<string, any>) => {
  if (__DEV__) {
    console.log('User identified in development:', userId, userData);
    return;
  }

  Sentry.setUser({
    id: userId,
    ...userData,
  });
};

// Breadcrumb tracking
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  if (__DEV__) {
    console.log('Breadcrumb in development:', { message, category, data });
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

// API performance monitoring
export const monitorAPI = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> => {
  const transaction = startPerformanceMonitoring(`API: ${endpoint}`);
  
  try {
    const result = await apiCall();
    
    if (transaction) {
      transaction.setStatus('ok');
      transaction.finish();
    }
    
    return result;
  } catch (error) {
    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }
    
    reportError(error as Error, { endpoint });
    throw error;
  }
};

// Screen performance monitoring
export const monitorScreen = (screenName: string) => {
  const transaction = startPerformanceMonitoring(`Screen: ${screenName}`);
  
  return {
    finish: () => {
      if (transaction) {
        transaction.setStatus('ok');
        transaction.finish();
      }
    },
    setError: (error: Error) => {
      if (transaction) {
        transaction.setStatus('internal_error');
        transaction.finish();
      }
      reportError(error, { screen: screenName });
    },
  };
};

// Custom metrics
export const setMetric = (key: string, value: number) => {
  if (__DEV__) {
    console.log('Metric in development:', { key, value });
    return;
  }

  Sentry.metrics.increment(key, value);
};

export const setGauge = (key: string, value: number) => {
  if (__DEV__) {
    console.log('Gauge in development:', { key, value });
    return;
  }

  Sentry.metrics.gauge(key, value);
}; 