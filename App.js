import 'react-native-gesture-handler';
import * as React from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FirstScreen from './screens/FirstScreen';
import SecondScreen from './screens/SecondScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

// Enable screens for better performance
enableScreens();

const Stack = createStackNavigator(); 

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FirstScreen">
        <Stack.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SecondScreen" component={SecondScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
