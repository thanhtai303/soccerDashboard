import PushNotification from 'react-native-push-notification';

// Cấu hình Push Notification chỉ cho Android
const configurePushNotification = navigation => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);

      // Khi nhấn vào thông báo
      if (notification.userInteraction) {
        navigation.navigate('Matches'); // Điều hướng đến MatchStatsStack (MatchListScreen)
      }
    },
    onAction: function (notification) {
      console.log('ACTION:', notification.action);
    },
    onRegistrationError: function (err) {
      console.error(err.message, err);
    },
    // Chỉ yêu cầu quyền cơ bản cho Android
    permissions: {
      alert: true,
      badge: false, // Không cần badge trên Android
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: true, // Yêu cầu quyền trên Android
  });

  // Tạo channel cho Android
  PushNotification.createChannel(
    {
      channelId: 'default-channel-id',
      channelName: 'Default Channel',
      channelDescription: 'A default channel for match updates',
      soundName: 'default',
      importance: 4, // Importance.HIGH
      vibrate: true,
    },
    created => console.log(`Channel created: ${created}`),
  );
};

// Hàm gửi thông báo sau 10 giây với dữ liệu giả
const scheduleFakeNotification = navigation => {
  setTimeout(() => {
    PushNotification.localNotification({
      channelId: 'default-channel-id', // Cần cho Android
      title: 'Match Update',
      message: 'New match stats available: Team A 2 - 1 Team B',
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      userInfo: {screen: 'MatchListScreen'}, // Dữ liệu tùy chỉnh
    });
  }, 10000); // 10 giây
};

export {configurePushNotification, scheduleFakeNotification};
