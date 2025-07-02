import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rindwa.app',
  appName: 'Rindwa App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#dc2626',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#dc2626'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Geolocation: {
      permissions: {
        location: "always"
      }
    }
  }
};

export default config;
