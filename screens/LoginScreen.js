import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform, ImageBackground } from 'react-native';
import { Feather } from '@expo/vector-icons'; // For the arrow icon
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('RegistrationScreen')}>
          <Feather name="arrow-left" size={24} color="pink" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    setIsFormComplete(email && password);
  }, [email, password]);

  const storeToken = async (token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  const handleLogin = async () => {
    console.log('Attempting to log in with email:', email);
    try {
      const response = await axios.post('http://172.20.10.3:5000/login', { email, password });
      if (response.status === 200) {
        const { token, name, profilePhotoUrl } = response.data;
        await storeToken(token);
        console.log('Login successful, navigating to next screen');
        if (profilePhotoUrl) {
          navigation.navigate('HomeScreen', { token, name, profilePhotoUrl });
        } else {
          navigation.navigate('AddProfilePhotoScreen', { token, name });
        }
      }
    } catch (error) {
      console.error('Login error:', error.response?.data?.error || error.message);
      Alert.alert('Login Failed', error.response?.data?.error || 'Invalid email or password.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset your password.');
      return;
    }

    console.log('Attempting to send password reset email to:', email);
    try {
      const response = await axios.post('http://172.20.10.3:5000/forgot-password', { email }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        console.log('Password reset email sent successfully');
        Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
      }
    } catch (error) {
      console.error('Error sending password reset email:', error.response?.data?.error || error.message);
      Alert.alert('Error', 'There was an error sending the password reset email. Please try again.');
    }
  };

  return (
    <ImageBackground source={require('../assets/background1.jpg')} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.text}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueButton, isFormComplete ? styles.activeButton : styles.inactiveButton]}
            onPress={handleLogin}
            disabled={!isFormComplete}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  forgotPassword: {
    color: '#FF69B4',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  continueButton: {
    width: '80%',
    paddingVertical: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FF69B4',
  },
  inactiveButton: {
    backgroundColor: '#FFB6C1',
  },
  continueText: {
    fontSize: 20,
    color: '#fff',
  },
});
