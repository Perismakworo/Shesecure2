import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function InviteCodeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { inviteCode } = route.params;

  const handleCopyToClipboard = () => {
    // Copy the invite code to the clipboard
    // Implement the copy functionality using Clipboard API or a package like react-native-clipboard
    // Clipboard.setString(inviteCode);
    Alert.alert('Copied to Clipboard', 'The invite code has been copied to your clipboard.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite Code</Text>
      <Text style={styles.inviteCodeText}>Invite Code: {inviteCode}</Text>
      <Text style={styles.infoText}>This code will be active for 2 days</Text>
      <TouchableOpacity onPress={handleCopyToClipboard} style={styles.copyButton}>
        <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CircleManagementScreen')} style={styles.button}>
        <Text style={styles.buttonText}>Go to Circle Management</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inviteCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 16,
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
