import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SafetyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.optionContainer} onPress={() => navigation.navigate('EmergencyContactsScreen', { token })}>
        <Text style={styles.optionText}>Emergency Contacts</Text>
        <Text style={styles.optionSubText}>1 contacts added</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionContainer} onPress={() => navigation.navigate('CircleManagementScreen', { token })}>
        <Text style={styles.optionText}>Circle Management</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  optionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  optionSubText: {
    fontSize: 14,
    color: '#888',
  },
});
