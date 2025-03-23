import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native'; // Không cần NavigationIndependentTree trừ khi bạn có lý do đặc biệt
import MatchStatsStack from './MatchStatsStack';
import UserProfileScreen from './UserProfileScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HelpAndAboutScreenStack from './HelpAndAboutStack';
import Dashboard from './Dashboard';
import UserProfileStack from './UserProfileStack';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <NavigationContainer>
      <NavigationIndependentTree>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName;
              if (route.name === 'News') {
                iconName = focused ? 'newspaper' : 'newspaper-variant-outline'; // Icon cho News
              } else if (route.name === 'Matches') {
                iconName = focused ? 'soccer' : 'soccer-field'; // Đã có
              } else if (route.name === 'Profile') {
                iconName = focused ? 'account' : 'account-outline'; // Đã có
              } else if (route.name === 'Help') {
                iconName = focused ? 'help-circle' : 'help-circle-outline'; // Icon cho Help
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#FF6B6B', // Màu khi tab được chọn
            tabBarInactiveTintColor: '#7F8C8D', // Màu khi tab không được chọn
            tabBarStyle: {
              backgroundColor: '#FFFFFF', // Màu nền tab bar
              borderTopColor: '#E8F0FE',
              borderTopWidth: 2,
              height: 60,
              paddingBottom: 5,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: 'bold',
            },
          })}>
          <Tab.Screen
            name="News"
            component={Dashboard}
            options={{headerShown: false}}
          />
          <Tab.Screen
            name="Matches"
            component={MatchStatsStack}
            options={{headerShown: false}} // Ẩn header mặc định của tab để dùng header của stack
          />
          <Tab.Screen
            name="Profile"
            component={UserProfileStack}
            options={{
              title: 'Profile',
              headerStyle: {backgroundColor: '#000'},
              headerTintColor: '#fff',
            }}
          />
          <Tab.Screen
            name="Help"
            component={HelpAndAboutScreenStack}
            options={{headerShown: false}}
          />
        </Tab.Navigator>
      </NavigationIndependentTree>
    </NavigationContainer>
  );
};

export default MainTabs;
