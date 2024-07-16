import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function SOSInitialScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params;

  const navigateToCountdown = () => {
    navigation.navigate('SOSCountdownScreen', { token });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#6e6e6e" />
        </TouchableOpacity>
        <Text style={styles.title}>SOS</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#6e6e6e" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.sosButton} onPress={navigateToCountdown}>
        <View style={styles.sosInnerCircle}>
          <Text style={styles.sosButtonText}>Tap to send SOS</Text>
          <Text style={styles.sosSubText}>(or press and hold)</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.infoText}>Your SOS will be sent to your circle members</Text>
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
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {},
  infoButton: {},
  title: {
    fontSize: 18,
    color: '#6e6e6e',
  },
  sosButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ff77a9', // Light pink for the outer circle
    marginBottom: 20,
  },
  sosInnerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ff589e', // Darker pink for the inner circle
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  sosSubText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#6e6e6e',
    marginTop: 20,
  },
});
