import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backendURL = 'http://172.20.10.3:5000';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, profilePhotoUrl } = route.params;
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePhoto: profilePhotoUrl || null,
  });
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Fetching profile...');
      try {
        const response = await axios.get(`${backendURL}/getUserProfile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Fetched profile data:', response.data);
        setProfile({
          name: response.data.name,
          email: response.data.email,
          profilePhoto: response.data.profilePhotoUrl
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    console.log('Profile state updated:', profile);
  }, [profile]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log('Image picker result:', result); // Log the entire result object

    if (!result.canceled) {
      console.log('Image picked:', result.assets[0].uri); // Ensure correct property is accessed
      setImage(result.assets[0].uri);
      handleUploadImage(result.assets[0].uri);
    }
  };

  const handleUploadImage = async (uri) => {
    console.log('Uploading image...');
    const formData = new FormData();
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

    try {
      const response = await axios.post(`${backendURL}/uploadProfilePhoto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 200) {
        console.log('Uploaded image URL:', response.data.fileUrl);
        setProfile({ ...profile, profilePhoto: response.data.fileUrl });
        await AsyncStorage.setItem('userProfilePhotoUrl', response.data.fileUrl); // Update AsyncStorage
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'An error occurred');
    }
  };

  const handleLogout = async () => {
    setModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      console.log('Logging out...');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('userProfilePhotoUrl');
      setModalVisible(false);
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', error.message || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {profile.profilePhoto && (
          <Image source={{ uri: `${backendURL}${profile.profilePhoto}` }} style={styles.profileImage} />
        )}
        <Text style={styles.profileName}>{profile.name}</Text>
      </View>
      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>Change Profile Picture</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('EditNameScreen', { token })} style={styles.button}>
        <Text style={styles.buttonText}>Edit Name</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('EditEmailScreen', { token })} style={styles.button}>
        <Text style={styles.buttonText}>Edit Email Address</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ChangePasswordScreen', { token })} style={styles.button}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmLogout}
              >
                <Text style={styles.modalButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
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
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  profileName: {
    fontSize: 24,
  },
  imageButton: {
    backgroundColor: '#ff69b4', // Pink color
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#ff69b4', // Pink color
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff69b4', // Pink color
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#ff69b4', // Pink color
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
