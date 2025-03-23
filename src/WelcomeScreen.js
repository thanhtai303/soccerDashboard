import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const handleLoginPress = () => {
    navigation.navigate('Login'); // Điều hướng đến màn hình Login
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={{
          uri: 'https://static.vecteezy.com/system/resources/previews/012/903/914/non_2x/football-illustration-file-sports-design-logo-free-png.png',
        }} // Thay bằng URL logo của bạn
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Tiêu đề chào mừng */}
      <Text style={styles.welcomeText}>Welcome to Tai Xiu Football</Text>

      {/* Nút điều hướng đến Login */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
        <Text style={styles.loginButtonText}>Enter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Nền trắng
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 400, // Điều chỉnh kích thước logo
    height: 400,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#eeee', // Màu xanh giống Track Balance button
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
