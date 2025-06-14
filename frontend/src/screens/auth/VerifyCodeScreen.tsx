import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/MainNavigator';

type VerifyCodeNavigationProp = StackNavigationProp<RootStackParamList, 'VerifyCode'>;
type VerifyCodeRouteProp = RouteProp<RootStackParamList, 'VerifyCode'>;

export default function VerifyCodeScreen() {
  const navigation = useNavigation<VerifyCodeNavigationProp>();
  const route = useRoute<VerifyCodeRouteProp>();
  const [code, setCode] = useState('');

  const handleVerifyCode = () => {
    if (!code || code.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }
    navigation.navigate('ResetPassword', {email: route.params.email, code});
  };

  const handleResendCode = () => {
    Alert.alert('Code Sent', 'A new verification code has been sent to your email');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {route.params.email}
        </Text>

        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          textAlign="center"
        />

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
          <Text style={styles.verifyButtonText}>Verify Code</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendCode}>
          <Text style={styles.resendText}>Didn't receive code? Resend</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendText: {
    textAlign: 'center',
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 20,
  },
  backText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});