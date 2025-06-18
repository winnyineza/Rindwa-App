import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/MainNavigator';
// @ts-nocheck - Disable TypeScript checking for this file temporarily
// Use our typed hooks instead of the regular ones
import {useAppDispatch} from '../store/types';
import {checkAuthStatus} from '../store/slices/authSlice';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    console.log('SplashScreen: Component mounted');
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Check auth status and navigate accordingly
    const checkAuth = async () => {
      try {
        // @ts-ignore (dispatch returns Promise from async thunk)
        const result = await dispatch(checkAuthStatus());
        
        setTimeout(() => {
          console.log('SplashScreen: Auth check complete, navigating...');
          try {
            // If user is authenticated, go to MainTabs, otherwise Onboarding
            if (result.payload && result.payload.token && result.payload.user) {
              navigation.replace('MainTabs');
            } else {
              navigation.replace('Onboarding');
            }
          } catch (error) {
            console.error('SplashScreen: Navigation error:', error);
            Alert.alert('Navigation Error', 'Failed to navigate');
          }
        }, 2000); // Still maintain a minimum 2 second splash
      } catch (error) {
        console.error('SplashScreen: Auth check error:', error);
        // Default to Onboarding on error
        setTimeout(() => {
          navigation.replace('Onboarding');
        }, 2000);
      }
    };

    checkAuth();

    return () => {
      console.log('SplashScreen: Component unmounting');
    };
  }, [navigation, dispatch, fadeAnim, scaleAnim]);

  console.log('SplashScreen: Rendering component');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#283593" />
      <Animated.View 
        style={[
          styles.logoContainer, 
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}]
          }
        ]}
      >
        {/* You can replace this with an actual logo image */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>R</Text>
        </View>
      </Animated.View>
      <Animated.Text 
        style={[
          styles.title,
          {opacity: fadeAnim}
        ]}
      >
        Rindwa App
      </Animated.Text>
      <Animated.Text 
        style={[
          styles.subtitle,
          {opacity: fadeAnim}
        ]}
      >
        Community Safety Platform
      </Animated.Text>
      <Text style={styles.versionText}>v{process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#283593',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoText: {
    fontSize: 70,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.8,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  versionText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 14,
    color: 'white',
    opacity: 0.6,
  },
});
