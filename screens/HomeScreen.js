import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const backendURL = 'http://172.20.10.3:5000';

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params;
  const [profile, setProfile] = useState({ name: '', profilePhotoUrl: null });
  const [location, setLocation] = useState(null);
  const [circleLocations, setCircleLocations] = useState([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        console.error('Token is missing');
        navigation.navigate('LoginScreen');
        return;
      }

      try {
        console.log('Fetching profile with token:', token);
        const response = await axios.get(`${backendURL}/getUserProfile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Profile fetched:', response.data);
        setProfile(response.data);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 403 || error.response.status === 401) {
            await AsyncStorage.removeItem('userToken');
            navigation.navigate('LoginScreen');
          } else {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
          }
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        console.error('Failed to fetch profile:', error.config);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Update location on the server
      try {
        await axios.post(`${backendURL}/updateLocation`, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Failed to update location:', error);
      }

      // Fetch circle locations
      fetchCircleLocations();
    })();
  }, []);

  const fetchCircleLocations = async () => {
    try {
      const response = await axios.get(`${backendURL}/getCircleLocations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCircleLocations(response.data);
    } catch (error) {
      console.error('Failed to fetch circle locations:', error);
    }
  };

  useEffect(() => {
    console.log('Profile state updated:', profile);
  }, [profile]);

  return (
    <View style={styles.container}>
      {location && (
        <MapView style={styles.map} region={mapRegion}>
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
          {circleLocations.map((loc, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: loc.latitude,
                longitude: loc.longitude,
              }}
              title={loc.email}
              description={loc.circle_name} // Show circle name
            />
          ))}
        </MapView>
      )}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => navigation.navigate('ProfileScreen', { token, profilePhotoUrl: profile.profilePhotoUrl })}
          >
            {profile.profilePhotoUrl ? (
              <Image source={{ uri: backendURL + profile.profilePhotoUrl }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle" size={30} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.headerText}>Welcome, {profile.name}</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ChatScreen', { token, circleId: 1 })}>
            <Ionicons name="chatbubbles" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="shield" size={24} color="#000" onPress={() => navigation.navigate('SafetyScreen', { token })} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('LocationHistoryScreen', { token, circleId: 1 })}>
            <Ionicons name="map" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => navigation.navigate('SOSInitialScreen', { token })}
      >
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={false} // Modal visibility managed internally
        onRequestClose={() => {}}
      >
        {/* Modal content here */}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 10,
  },
  profileIcon: {
    marginLeft: 10,
    padding: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  iconContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconButton: {
    marginBottom: 10,
  },
  sosButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#ff3366',
    borderRadius: 50,
    padding: 20,
    elevation: 8,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
