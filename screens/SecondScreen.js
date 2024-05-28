import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

export default function SecondScreen({ navigation }) {
  return (
    <ImageBackground source={require('../assets/background1.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>SheSecure</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegistrationScreen')} style={styles.getStartedButton}>
          <Text style={styles.getStarted}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.loginText}>Already registered? Login</Text>
        </TouchableOpacity>
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 192, 203, 0.5)', // Semi-transparent pink overlay
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    position: 'absolute',
    top: 50,
  },
  getStartedButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25, // Pill-shaped corners
    marginBottom: 20,
  },
  getStarted: {
    fontSize: 20,
    color: '#fff',
  },
  loginText: {
    color: '#FF69B4',
    textDecorationLine: 'underline',
  },
});