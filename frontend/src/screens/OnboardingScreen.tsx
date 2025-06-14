import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();

  useEffect(() => {
    console.log('OnboardingScreen: Component mounted');
    return () => {
      console.log('OnboardingScreen: Component unmounting');
    };
  }, []);

  const handleGetStarted = () => {
    console.log('OnboardingScreen: Get Started pressed');
    try {
      navigation.navigate('Login');
    } catch (error) {
      console.error('OnboardingScreen: Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to login');
    }
  };

  console.log('OnboardingScreen: Rendering component');

  const features = [
    {
      icon: 'report-problem',
      title: 'Report Incidents',
      description: 'Quickly report safety incidents in your community',
    },
    {
      icon: 'people',
      title: 'Community Verification',
      description: 'Help verify incidents reported by others',
    },
    {
      icon: 'contacts',
      title: 'Emergency Contacts',
      description: 'Manage your emergency contacts for quick access',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Rindwa App</Text>
        <Text style={styles.subtitle}>
          Empowering communities through shared safety awareness
        </Text>

        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <Icon name={feature.icon} size={40} color="#e74c3c" />
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  getStartedButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  getStartedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});