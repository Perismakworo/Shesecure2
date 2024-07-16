import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const backendURL = 'http://172.20.10.3:5000';

export default function CreateCircleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params;
  const [circleName, setCircleName] = useState('');

  const generateInviteCode = async () => {
    if (!circleName.trim()) {
      Alert.alert('Circle Name is required');
      return;
    }

    try {
      const response = await axios.post(`${backendURL}/generateInviteCode`, { circleName }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        navigation.navigate('InviteCodeScreen', { inviteCode: response.data.code });
      }
    } catch (error) {
      console.error('Failed to generate invite code:', error);
      Alert.alert('Failed to generate invite code', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Circle</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Circle Name"
        value={circleName}
        onChangeText={setCircleName}
      />
      <TouchableOpacity onPress={generateInviteCode} style={styles.button}>
        <Text style={styles.buttonText}>Generate Invite Code</Text>
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
