// screens/FirstScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function FirstScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('SecondScreen');
    }, 3000); // Navigate after 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>SheSecure</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
});