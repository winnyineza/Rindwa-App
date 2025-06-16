import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import FlashMessage from 'react-native-flash-message';

import { store } from './src/store';
import MainNavigator from './src/navigation/MainNavigator';
import { checkAuthStatus } from './src/store/slices/authSlice';
import { initializeMonitoring, SentryErrorBoundary } from './src/services/monitoring';
import { analyticsService } from './src/services/analytics';
import { initializeNotifications } from './src/services/notifications';
import { initializeDeepLinking } from './src/services/deepLinking';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App(): React.JSX.Element {
  const navigationRef = useRef(null);

  useEffect(() => {
    // Initialize all services
    const initializeApp = async () => {
      try {
        // Initialize monitoring (Sentry)
        initializeMonitoring();

        // Initialize analytics
        analyticsService.trackAppOpen();

        // Initialize notifications
        await initializeNotifications();

        // Initialize deep linking
        initializeDeepLinking(navigationRef);

        // Check authentication status
        await store.dispatch(checkAuthStatus());

        // Track session start
        analyticsService.trackSessionStart();

        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      // Track session end
      analyticsService.trackSessionEnd(0); // You could track actual session duration
    };
  }, []);

  return (
    <SentryErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer ref={navigationRef}>
              <StatusBar style="light" backgroundColor="#e74c3c" />
              <MainNavigator />
              <FlashMessage position="top" />
            </NavigationContainer>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </Provider>
    </SentryErrorBoundary>
  );
}

export default App;