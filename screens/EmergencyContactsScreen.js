import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import axios from 'axios';
import * as Contacts from 'expo-contacts';
import { useNavigation } from '@react-navigation/native';

const backendURL = 'http://172.20.10.3:5000';

export default function EmergencyContactsScreen({ route }) {
  const { token } = route.params;
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [phoneContacts, setPhoneContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${backendURL}/getEmergencyContacts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setContacts(response.data);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    };

    fetchContacts();
  }, [token]);

  useEffect(() => {
    const getPhoneContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        setPhoneContacts(data);
      }
    };

    getPhoneContacts();
  }, []);

  const handleAddContact = async () => {
    try {
      const response = await axios.post(`${backendURL}/addEmergencyContact`, {
        contactName,
        contactNumber
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Emergency contact added successfully');
        setContacts([...contacts, { contactName, contactNumber }]);
        setModalVisible(false);
        setContactName('');
        setContactNumber('');
      }
    } catch (error) {
      console.error('Failed to add contact:', error);
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      const response = await axios.delete(`${backendURL}/deleteEmergencyContact/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Emergency contact deleted successfully');
        setContacts(contacts.filter(contact => contact.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
      Alert.alert('Error', 'Failed to delete contact');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.contactContainer}>
            <Text>{item.contactName} - {item.contactNumber}</Text>
            <TouchableOpacity onPress={() => handleDeleteContact(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Contact</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            <FlatList
              data={phoneContacts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                item.phoneNumbers && item.phoneNumbers.length > 0 && (
                  <TouchableOpacity onPress={() => {
                    setContactName(item.name);
                    setContactNumber(item.phoneNumbers[0].number);
                    setModalVisible(false);
                  }}>
                    <Text style={styles.contactListItem}>{item.name} - {item.phoneNumbers[0].number}</Text>
                  </TouchableOpacity>
                )
              )}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              value={contactName}
              onChangeText={setContactName}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddContact}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deleteText: {
    color: 'red',
  },
  addButton: {
    backgroundColor: '#ff69b4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactListItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#ff69b4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
  },
});
