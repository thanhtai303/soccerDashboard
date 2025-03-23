import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HelpAndAboutScreen from './HelpAndAbout';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
const Stack = createNativeStackNavigator();

function HelpAndAboutScreenStack() {
  return (
    <NavigationContainer>
      <NavigationIndependentTree>
        <Stack.Navigator>
          <Stack.Screen
            name="HelpAndAbout"
            component={HelpAndAboutScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationIndependentTree>
    </NavigationContainer>
  );
}

export default HelpAndAboutScreenStack;
