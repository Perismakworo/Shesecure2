import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

export default function ResetPasswordScreen({ navigation }) {
  const [password, setPassword] = useState('');
  const route = useRoute();
  const { token } = route.params;

  const handleResetPassword = async () => {
    try {
      const response = await axios.post('http://172.20.10.3:5000/reset-password', { token, password });
      if (response.status === 200) {
        Alert.alert('Success', 'Password has been reset successfully.');
        navigation.navigate('LoginScreen'); // Navigate to LoginScreen
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error resetting your password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    width: '80%',
    height: 40,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
