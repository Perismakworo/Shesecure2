import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const backendURL = 'http://172.20.10.3:5000';

export default function JoinCircleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params;
  const [inviteCode, setInviteCode] = useState('');

  const joinCircle = async () => {
    try {
      const response = await axios.post(`${backendURL}/joinCircle`, { inviteCode }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        Alert.alert('Joined Successfully');
        navigation.navigate('CircleManagementScreen'); // Navigate to the Circle Management screen
      }
    } catch (error) {
      console.error('Failed to join circle:', error);
      Alert.alert('Failed to join circle', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Circle</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Invite Code"
        value={inviteCode}
        onChangeText={setInviteCode}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity onPress={joinCircle} style={styles.button}>
        <Text style={styles.buttonText}>Join</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#ff69b4',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
