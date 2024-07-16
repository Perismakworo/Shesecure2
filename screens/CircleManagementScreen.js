import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const backendURL = 'http://172.20.10.3:5000';

export default function CircleManagementScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params;
  const [circles, setCircles] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(null);

  useEffect(() => {
    // Fetch user's circles
    const fetchCircles = async () => {
      try {
        const response = await axios.get(`${backendURL}/getUserCircles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCircles(response.data);
      } catch (error) {
        console.error('Failed to fetch circles:', error);
      }
    };

    fetchCircles();
  }, [token]);

  const fetchCircleMembers = async (circleId) => {
    try {
      const response = await axios.get(`${backendURL}/getCircleMembers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: { circleId }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch circle members:', error);
    }
  };

  const handleCirclePress = (circle) => {
    setSelectedCircle(circle);
    fetchCircleMembers(circle.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Circle Management</Text>
      
      <TouchableOpacity onPress={() => navigation.navigate('CreateCircleScreen', { token })} style={styles.button}>
        <Text style={styles.buttonText}>Create Circle</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('JoinCircleScreen', { token })} style={styles.button}>
        <Text style={styles.buttonText}>Join Circle</Text>
      </TouchableOpacity>

      <FlatList
        data={circles}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCirclePress(item)} style={styles.circleButton}>
            <Text style={styles.circleButtonText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedCircle && (
        <View style={styles.membersContainer}>
          <Text style={styles.title}>Members of {selectedCircle.name}</Text>
          <FlatList
            data={members}
            keyExtractor={(item, index) => `${item.email}-${index}`}
            renderItem={({ item }) => (
              <Text style={styles.memberText}>{item.name}</Text>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ff69b4',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  circleButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  circleButtonText: {
    fontWeight: 'bold',
  },
  membersContainer: {
    marginTop: 16,
  },
  memberText: {
    fontSize: 16,
    marginBottom: 4,
  },
});
