import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const backendURL = 'http://172.20.10.3:5000';

export default function EditEmailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params;
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendURL}/getUserProfile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEmail(response.data.email);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    try {
      const response = await axios.put(`${backendURL}/updateEmail`, { email }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        Alert.alert('Email updated successfully');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to update email:', error);
      Alert.alert('Failed to update email', error.message || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="New Email Address"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
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
