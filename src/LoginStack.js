// App.js
import React from 'react';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UserProfileScreen from './UserProfileScreen';
import LoginScreen from './Login';
import MainTabs from './MainTabs';
import WelcomeScreen from './WelcomeScreen';

const Stack = createNativeStackNavigator();

const LoginStack = () => {
  return (
    <NavigationContainer>
      <NavigationIndependentTree>
        <Stack.Navigator>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Profile"
            component={MainTabs}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UserProfile"
            component={UserProfileScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationIndependentTree>
    </NavigationContainer>
  );
};

export default LoginStack;
