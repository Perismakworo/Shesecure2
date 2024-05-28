import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform, ImageBackground } from 'react-native';
import { Feather } from '@expo/vector-icons'; // For the arrow icon
import axios from 'axios';

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

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://172.20.10.3:5000/login', { email, password });
      if (response.status === 200) {
        Alert.alert('Login Successful', 'Welcome back!');
        navigation.navigate('HomeScreen', { name: 'Peris' }); // Navigate to HomeScreen with a placeholder name
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response.data.error || 'Invalid email or password.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset your password.');
      return;
    }

    try {
      const response = await axios.post('http://172.20.10.3:5000/forgot-password', { email }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
      }
    } catch (error) {
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
