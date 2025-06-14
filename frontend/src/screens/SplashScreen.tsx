import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/MainNavigator';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    console.log('SplashScreen: Component mounted');
    
    const timer = setTimeout(() => {
      console.log('SplashScreen: Navigating to Onboarding');
      try {
        navigation.replace('Onboarding');
      } catch (error) {
        console.error('SplashScreen: Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to navigate to onboarding');
      }
    }, 2000);

    return () => {
      console.log('SplashScreen: Component unmounting');
      clearTimeout(timer);
    };
  }, [navigation]);

  console.log('SplashScreen: Rendering component');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
      <Text style={styles.title}>Rindwa App</Text>
      <Text style={styles.subtitle}>Community Safety Platform</Text>
      <Text style={styles.debugText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    marginBottom: 20,
  },
  debugText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.6,
  },
});