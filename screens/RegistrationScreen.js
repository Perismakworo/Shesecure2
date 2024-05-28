import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform, ImageBackground } from 'react-native';
import { Feather } from '@expo/vector-icons'; // For the arrow icon
import axios from 'axios';
import zxcvbn from 'zxcvbn';
import { HeaderBackButton } from '@react-navigation/elements';

export default function RegistrationScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('SecondScreen')}>
          <Feather name="arrow-left" size={24} color="pink" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    setIsFormComplete(name && email && password && confirmPassword);
  }, [name, email, password, confirmPassword]);

  const handleEmailVerification = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
  };

  const handlePasswordChange = (password) => {
    setPassword(password);
    const strength = zxcvbn(password).score;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const handleRegister = async () => {
    handleEmailVerification();
    if (passwordStrength < 3) {
      Alert.alert('Weak Password', 'Please enter a stronger password.');
    } else if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
    } else {
      try {
        const response = await axios.post('http://172.20.10.3:5000/register', { name, email, password });
        if (response.status === 201) {
          Alert.alert('Registration Successful', 'A verification email has been sent to your account.');
          navigation.navigate('LoginScreen'); // Redirect to login screen after registration
        } else {
          Alert.alert('Registration Failed', response.data.error || 'An error occurred');
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          Alert.alert('Registration Failed', error.response.data.error);
        } else {
          Alert.alert('Registration Failed', error.message || 'An error occurred');
        }
      }
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
          <Text style={styles.text}>Register</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onBlur={handleEmailVerification}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <Text style={styles.guidelineText}>
            Password should be at least 8 characters long and include a mix of letters, numbers, and special characters.
          </Text>
          <Text style={styles.strengthText}>Password Strength: {getPasswordStrengthLabel()}</Text>
          <TouchableOpacity
            style={[styles.continueButton, isFormComplete ? styles.activeButton : styles.inactiveButton]}
            onPress={handleRegister}
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
  passwordContainer: {
    flexDirection: 'row',
    width: '80%',
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
  },
  guidelineText: {
    width: '80%',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  strengthText: {
    fontSize: 18,
    color: '#fff',
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
