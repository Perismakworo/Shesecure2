import 'react-native-gesture-handler';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import { Platform } from 'react-native';

import FirstScreen from './screens/FirstScreen';
import SecondScreen from './screens/SecondScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import AddProfilePhotoScreen from './screens/AddProfilePhotoScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditNameScreen from './screens/EditNameScreen';
import EditEmailScreen from './screens/EditEmailScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import SafetyScreen from './screens/SafetyScreen';
import EmergencyContactsScreen from './screens/EmergencyContactsScreen';
import CircleManagementScreen from './screens/CircleManagementScreen';
import CreateCircleScreen from './screens/CreateCircleScreen';
import InviteCodeScreen from './screens/InviteCodeScreen';
import JoinCircleScreen from './screens/JoinCircleScreen';
import SOSInitialScreen from './screens/SOSInitialScreen';
import SOSCountdownScreen from './screens/SOSCountdownScreen';
import ChatScreen from './screens/ChatScreen';
import LocationHistoryScreen from './screens/LocationHistoryScreen'; // Ensure this import

enableScreens();

const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState('FirstScreen');
  const [token, setToken] = useState(null);

  const linking = {
    prefixes: ['myapp://'],
    config: {
      screens: {
        ResetPasswordScreen: 'reset-password/:token',
      },
    },
  };

  const retrieveToken = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        setToken(userToken);
        setInitialRoute('HomeScreen');
      } else {
        setInitialRoute('LoginScreen');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
      setInitialRoute('LoginScreen');
    }
  };

  useEffect(() => {
    retrieveToken();
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
      // Send the token to your backend
      axios.post('http://172.20.10.3:5000/savePushToken', { token });
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SecondScreen" component={SecondScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddProfilePhotoScreen" component={AddProfilePhotoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} initialParams={{ token }} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditNameScreen" component={EditNameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditEmailScreen" component={EditEmailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SafetyScreen" component={SafetyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EmergencyContactsScreen" component={EmergencyContactsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CircleManagementScreen" component={CircleManagementScreen} options={{ headerShown: false }} initialParams={{ token }} />
        <Stack.Screen name="CreateCircleScreen" component={CreateCircleScreen} options={{ headerShown: false }} initialParams={{ token }} />
        <Stack.Screen name="InviteCodeScreen" component={InviteCodeScreen} options={{ headerShown: false }} initialParams={{ token }} />
        <Stack.Screen name="JoinCircleScreen" component={JoinCircleScreen} options={{ headerShown: false }} initialParams={{ token }} />
        <Stack.Screen name="SOSInitialScreen" component={SOSInitialScreen} options={{ headerShown: false }} initialParams={{ token }} />
        <Stack.Screen name="SOSCountdownScreen" component={SOSCountdownScreen} options={{ headerShown: false }} initialParams={{ token }} />
        <Stack.Screen 
          name="ChatScreen" 
          component={ChatScreen} 
          options={{ headerShown: false }} 
          initialParams={({ route }) => ({
            token,
            circleName: route.params.circleName, // Pass circle name
            receiverEmail: route.params.receiverEmail, // Pass receiver email
          })}
        />
        <Stack.Screen name="LocationHistoryScreen" component={LocationHistoryScreen} options={{ headerShown: false }} initialParams={{ token }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
