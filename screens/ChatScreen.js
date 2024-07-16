import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const backendURL = 'http://172.20.10.3:5000';

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, circleId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [circleName, setCircleName] = useState('');

  const fetchCircleName = async () => {
    try {
      const response = await axios.get(`${backendURL}/getCircle`, {
        params: { circleId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCircleName(response.data.name);
    } catch (error) {
      console.error('Error fetching circle name:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${backendURL}/getMessages`, {
        params: { circleId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchCircleName();
    fetchMessages();
  }, [token, circleId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !receiverEmail.trim()) {
      console.error('Validation Error: Missing message or receiver email');
      return;
    }

    try {
      const requestBody = {
        circleId,
        message: newMessage,
        receiver_email: receiverEmail
      };
      console.log('Request Body:', requestBody); // Log request body for debugging

      await axios.post(`${backendURL}/saveMessage`, requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNewMessage('');
      fetchMessages(); // Call fetchMessages to refresh the message list
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender_email === receiverEmail ? styles.receivedMessage : styles.sentMessage
    ]}>
      <Text style={styles.senderName}>{item.sender_name}</Text>
      <Text>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.circleName}>{circleName}</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderMessage}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TextInput
          style={styles.input}
          placeholder="Receiver email..."
          value={receiverEmail}
          onChangeText={setReceiverEmail}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  circleName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#ff69b4',
    color: '#fff'
  },
  messageContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffb6c1',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffe4e1',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginRight: 5,
  },
  sendButton: {
    backgroundColor: '#ff69b4',
    borderRadius: 25,
    padding: 10,
  },
});
