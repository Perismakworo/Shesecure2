import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const backendURL = 'http://172.20.10.3:5000';

export default function SOSCountdownScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params;
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          sendSOS();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sendSOS = async () => {
    try {
      const response = await axios.post(`${backendURL}/sendSOS`, {
        // Include necessary data
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      Alert.alert('SOS sent successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to send SOS:', error);
      Alert.alert('Failed to send SOS');
    }
  };

  const cancelSOS = () => {
    setCountdown(null); // Clear countdown
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Slide to cancel</Text>
      <Text style={styles.infoText}>
        After 10 seconds, your SOS and location will be sent to your Circle and emergency contacts.
      </Text>
      <View style={styles.countdownContainer}>
        <Text style={styles.countdownText}>{countdown}</Text>
      </View>
      <TouchableOpacity style={styles.cancelButton} onPress={cancelSOS}>
        <Text style={styles.cancelButtonText}>Slide to cancel SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  titleText: {
    fontSize: 24,
    color: '#000',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  countdownContainer: {
    marginVertical: 20,
  },
  countdownText: {
    fontSize: 48,
    color: '#ff3366',
  },
  cancelButton: {
    backgroundColor: '#ff3366',
    borderRadius: 50,
    padding: 20,
    position: 'absolute',
    bottom: 50,
    left: '25%',
    right: '25%',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
