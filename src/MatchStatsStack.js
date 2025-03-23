import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MatchListScreen from './MatchListScreen';
import MatchStatsScreen from './MatchStatsScreen';
import PredictScoreScreen from './PredictScoreScreen';

const Stack = createNativeStackNavigator();

const MatchStatsStack = () => {
  return (
    <Stack.Navigator initialRouteName="MatchList">
      <Stack.Screen
        name="MatchList"
        component={MatchListScreen}
        options={{
          title: 'All Matches',
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="MatchStats"
        component={MatchStatsScreen}
        options={{
          title: 'Match Statistics',
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="PredictScore"
        component={PredictScoreScreen}
        options={{
          title: 'Predict Score',
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

export default MatchStatsStack;
