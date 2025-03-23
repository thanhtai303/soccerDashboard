import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {initializeApp, getApps} from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  getInitialNotification,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCOhr59y7CEelFIKSef-qvDONOuJyJ2qMo',
  authDomain: 'the-mujick.firebaseapp.com',
  projectId: 'the-mujick',
  storageBucket: 'the-mujick.firebasestorage.app',
  messagingSenderId: '1047099514697',
  appId: '1:1047099514697:web:b1a13f4cfdbb847a22c498',
  measurementId: 'G-RJF7C0VNXY',
};

// Initialize Firebase only if no apps are initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Configure local notifications
PushNotification.configure({
  onNotification: function (notification) {
    console.log('Local Notification:', notification);
  },
  requestPermissions: Platform.OS === 'ios',
});

const App = () => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [isSeeded, setIsSeeded] = useState(false);

  // Request FCM permission and get token
  const requestNotificationPermission = async () => {
    const messaging = getMessaging(); // Get messaging instance
    const authStatus = await requestPermission();
    const enabled = authStatus === 1 || authStatus === 2;
    if (enabled) {
      const token = await getToken(messaging); // Pass messaging instance
      console.log('FCM Token:', token);
      const db = getFirestore();
      await addDoc(collection(db, 'Tokens'), {token});
    }
  };

  // Show local notification
  const showLocalNotification = (title, message) => {
    PushNotification.localNotification({
      channelId: 'default-channel-id',
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      importance: 4,
      priority: 4,
    });
  };

  useEffect(() => {
    requestNotificationPermission();

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel-id',
          channelName: 'Default Channel',
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        created => console.log(`Channel created: ${created}`),
      );
    }

    // Get messaging instance
    const messaging = getMessaging();

    // Handle foreground FCM messages
    const unsubscribeForeground = onMessage(messaging, async remoteMessage => {
      // Pass messaging instance
      showLocalNotification(
        remoteMessage.notification.title,
        remoteMessage.notification.body,
      );
    });

    // Handle notification tap when app is in background
    onNotificationOpenedApp(messaging, remoteMessage => {
      // Pass messaging instance
      console.log('Notification opened:', remoteMessage);
    });

    // Handle notification tap when app is quit
    getInitialNotification(messaging).then(remoteMessage => {
      // Pass messaging instance
      if (remoteMessage) {
        console.log('App opened from quit state:', remoteMessage);
      }
    });

    // Fetch notes in real-time and simulate Cloud Function notification
    const db = getFirestore();
    const unsubscribeFirestore = onSnapshot(
      collection(db, 'Notes'),
      snapshot => {
        const notesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotes(notesList);

        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const newNote = change.doc.data();
            showLocalNotification('New Note Added', newNote.text);
          }
        });

        if (notesList.length === 0 && !isSeeded) {
          seedData().then(() => setIsSeeded(true));
        }
      },
    );

    return () => {
      unsubscribeForeground();
      unsubscribeFirestore();
    };
  }, [isSeeded]);

  // Seed sample data
  const seedData = async () => {
    const db = getFirestore();
    const sampleNotes = [
      {text: 'Buy groceries', createdAt: serverTimestamp()},
      {text: 'Finish assignment', createdAt: serverTimestamp()},
      {text: 'Call mom', createdAt: serverTimestamp()},
    ];
    for (const note of sampleNotes) {
      await addDoc(collection(db, 'Notes'), note);
    }
  };

  // Add a new note to Firestore
  const addNote = async () => {
    if (note.trim()) {
      try {
        const db = getFirestore();
        await addDoc(collection(db, 'Notes'), {
          text: note,
          createdAt: serverTimestamp(),
        });
        setNote('');
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  // Delete a note from Firestore
  const deleteNote = async id => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'Notes', id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Render each note item
  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => deleteNote(item.id)}>
      <Text style={styles.noteItem}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Note-Taking App</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your note"
        value={note}
        onChangeText={setNote}
      />
      <Button title="Save Note" onPress={addNote} color="#007AFF" />
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  list: {
    marginTop: 20,
  },
  noteItem: {
    padding: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 5,
  },
});

export default App;
