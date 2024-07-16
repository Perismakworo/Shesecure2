import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const backendURL = 'http://172.20.10.3:5000'; // Replace this with your actual backend URL

export default function AddProfilePhotoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params; // Ensure token is passed from the previous screen
  const [image, setImage] = useState(null);

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

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access camera is required!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleDone = async () => {
    if (image) {
      try {
        const formData = new FormData();
        formData.append('photo', {
          uri: image,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        console.log('Uploading image with data:', formData);
        console.log('Using token:', token);

        const response = await axios.post(`${backendURL}/uploadProfilePhoto`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.status === 200) {
          console.log('Upload successful:', response.data);
          navigation.navigate('HomeScreen', { token, profilePhotoUrl: response.data.fileUrl }); // Pass the token and photo URL to the next screen
        } else {
          console.error('Upload failed with status:', response.status);
          Alert.alert('Upload Failed', response.data.error || 'An error occurred');
        }
      } catch (error) {
        console.error('Upload error:', error);
        if (error.response) {
          console.log('Error response data:', error.response.data);
          Alert.alert('Upload Failed', error.response.data.error || 'An error occurred');
        } else {
          Alert.alert('Upload Failed', error.message || 'An error occurred');
        }
      }
    } else {
      Alert.alert('No Image', 'Please upload an image before continuing.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('HomeScreen', { token })}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add a Profile Photo</Text>
      <View style={styles.imageContainer}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
      </View>
      <View style={styles.listContainer}>
        <TouchableOpacity style={styles.listItem} onPress={pickImage}>
          <Text style={styles.listItemText}>Choose from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={takePhoto}>
          <Text style={styles.listItemText}>Take a Photo</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.continueButton, !image && styles.disabledButton]} onPress={handleDone} disabled={!image}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  skipText: {
    color: 'blue',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  listContainer: {
    width: '80%',
    marginBottom: 20,
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listItemText: {
    fontSize: 18,
    color: '#000',
  },
  continueButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: 'green',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
