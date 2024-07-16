import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const backendURL = 'http://172.20.10.3:5000';

const LocationHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { memberEmail, token } = route.params;
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationHistory = async () => {
      try {
        const response = await axios.get(`${backendURL}/getLocationHistory`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            memberEmail: memberEmail,
          },
        });
        setLocationHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch location history:', error);
        Alert.alert('Error', 'Failed to fetch location history');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationHistory();
  }, [memberEmail, token]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.text}>Latitude: {item.latitude}</Text>
      <Text style={styles.text}>Longitude: {item.longitude}</Text>
      <Text style={styles.text}>Timestamp: {new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={locationHistory}
        keyExtractor={(item) => item.timestamp.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No location history available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationHistoryScreen;
