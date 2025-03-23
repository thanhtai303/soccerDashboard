import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MatchListScreen from './MatchListScreen';
import MatchStatsScreen from './MatchStatsScreen';
import PredictScoreScreen from './PredictScoreScreen';
import UserProfileScreen from './UserProfileScreen';
import BalanceTrackingScreen from './BalanceTrackingScreen';

const Stack = createNativeStackNavigator();

const UserProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
          title: 'Profile',
          headerStyle: {backgroundColor: '#000'},
          headerShown: false,
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="BalanceTracking"
        component={BalanceTrackingScreen}
        options={{
          title: 'Balance Tracking',
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

export default UserProfileStack;
