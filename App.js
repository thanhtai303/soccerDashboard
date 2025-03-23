// Practice Assignment 7 - Single File Solution
// Eastern International University, CSE 434, Quarter 2, 2024-2025
// Student Name: [Your Name]
// Student ID: [Your ID]

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
  Alert,
  Modal,
} from 'react-native';
import {initializeApp, getApps} from '@react-native-firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  setDoc,
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
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import DateTimePicker from '@react-native-community/datetimepicker';

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

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE', // Replace with your Firebase Google Web Client ID
});

// Configure local notifications
PushNotification.configure({
  onNotification: notification => {
    console.log('Local Notification:', notification);
    if (notification.data && notification.data.type === 'reminder') {
      Alert.alert(
        'Reminder',
        notification.message || notification.data.message,
      );
    }
  },
  requestPermissions: Platform.OS === 'ios',
});

const App = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [isSeeded, setIsSeeded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [selectedNote, setSelectedNote] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      setUser(user);
      if (user) {
        const setupMessagingAndNotes = async currentUser => {
          const messaging = getMessaging();
          await requestNotificationPermission(messaging, currentUser);

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

          const unsubscribeForeground = onMessage(
            messaging,
            async remoteMessage => {
              showLocalNotification(
                remoteMessage.notification?.title || 'Reminder',
                remoteMessage.notification?.body || remoteMessage.data.message,
                remoteMessage.data,
              );
            },
          );

          onNotificationOpenedApp(messaging, remoteMessage => {
            console.log('Notification opened:', remoteMessage);
          });

          getInitialNotification(messaging).then(remoteMessage => {
            if (remoteMessage)
              console.log('App opened from quit state:', remoteMessage);
          });

          const notesQuery = query(
            collection(db, 'Notes'),
            where('userId', '==', currentUser.uid),
          );
          const unsubscribeFirestore = onSnapshot(notesQuery, snapshot => {
            const notesList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setNotes(notesList);

            snapshot.docChanges().forEach(change => {
              if (change.type === 'added' && !change.doc.data().reminderTime) {
                const newNote = change.doc.data();
                showLocalNotification('New Note Added', newNote.text, {
                  type: 'note',
                });
              }
            });

            if (notesList.length === 0 && !isSeeded) {
              seedData(currentUser).then(() => setIsSeeded(true));
            }
          });

          // Simulated "Cloud Function" - Check reminders every 60 seconds
          const checkReminders = async () => {
            const now = new Date();
            const dueNotes = notes.filter(
              note => note.reminderTime && note.reminderTime.toDate() <= now,
            );

            for (const note of dueNotes) {
              const tokenSnapshot = await collection(db, 'Tokens')
                .where('userId', '==', currentUser.uid)
                .get();

              if (!tokenSnapshot.empty) {
                const token = tokenSnapshot.docs[0].data().token;
                showLocalNotification(
                  'Reminder',
                  `Your note "${note.text}" is due!`,
                  {type: 'reminder'},
                );
                await setDoc(
                  doc(db, 'Notes', note.id),
                  {reminderTime: null},
                  {merge: true},
                );
              }
            }
          };

          const intervalId = setInterval(checkReminders, 60000); // Check every minute

          return () => {
            unsubscribeForeground();
            unsubscribeFirestore();
            clearInterval(intervalId);
          };
        };

        await setupMessagingAndNotes(user);
      }
    });

    return unsubscribeAuth;
  }, [auth, isSeeded]);

  const requestNotificationPermission = async (messaging, currentUser) => {
    const authStatus = await requestPermission();
    const enabled = authStatus === 1 || authStatus === 2;
    if (enabled) {
      const token = await getToken(messaging);
      console.log('FCM Token:', token);
      await addDoc(collection(db, 'Tokens'), {token, userId: currentUser.uid});
    }
  };

  const showLocalNotification = (title, message, data = {}) => {
    PushNotification.localNotification({
      channelId: 'default-channel-id',
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: 4,
      priority: 4,
      data,
    });
  };

  const seedData = async currentUser => {
    const sampleNotes = [
      {
        text: 'Buy groceries',
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
      },
      {
        text: 'Finish assignment',
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
      },
      {text: 'Call mom', createdAt: serverTimestamp(), userId: currentUser.uid},
    ];
    for (const note of sampleNotes) {
      await addDoc(collection(db, 'Notes'), note);
    }
  };

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Registration Error', error.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const {idToken} = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Google Sign-In was cancelled');
      } else {
        Alert.alert('Google Sign-In Error', error.message);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setNotes([]);
      setIsSeeded(false);
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const addNote = async () => {
    if (note.trim() && user) {
      try {
        await addDoc(collection(db, 'Notes'), {
          text: note,
          createdAt: serverTimestamp(),
          userId: user.uid,
          reminderTime: reminderTime
            ? serverTimestamp.fromDate(reminderTime)
            : null,
        });
        setNote('');
        setReminderTime(new Date());
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const setReminder = async noteId => {
    if (user && noteId) {
      try {
        await setDoc(
          doc(db, 'Notes', noteId),
          {reminderTime: serverTimestamp.fromDate(reminderTime)},
          {merge: true},
        );
        setShowPicker(false);
        setSelectedNote(null);
      } catch (error) {
        console.error('Error setting reminder:', error);
      }
    }
  };

  const deleteNote = async id => {
    try {
      await deleteDoc(doc(db, 'Notes', id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedNote(item);
        setReminderTime(
          item.reminderTime ? item.reminderTime.toDate() : new Date(),
        );
        setShowPicker(true);
      }}>
      <Text style={styles.noteItem}>
        {item.text}{' '}
        {item.reminderTime
          ? `- Reminder: ${item.reminderTime.toDate().toLocaleString()}`
          : ''}
      </Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login / Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Register" onPress={register} color="#007AFF" />
        <Button title="Login" onPress={login} color="#007AFF" />
        <Button
          title="Sign In with Google"
          onPress={googleSignIn}
          color="#DB4437"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Note-Taking App</Text>
      <Text style={styles.subtitle}>Welcome, {user.email}</Text>
      <Button title="Logout" onPress={logout} color="#FF3B30" />
      <TextInput
        style={styles.input}
        placeholder="Enter your note"
        value={note}
        onChangeText={setNote}
      />
      <Button
        title="Pick Reminder Time"
        onPress={() => setShowPicker(true)}
        color="#007AFF"
      />
      <Button title="Save Note" onPress={addNote} color="#007AFF" />
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <DateTimePicker
              value={reminderTime}
              mode="datetime"
              display="default"
              onChange={(event, date) => date && setReminderTime(date)}
            />
            <Button
              title="Set Reminder"
              onPress={() =>
                selectedNote
                  ? setReminder(selectedNote.id)
                  : setShowPicker(false)
              }
              color="#007AFF"
            />
            <Button
              title="Cancel"
              onPress={() => setShowPicker(false)}
              color="#FF3B30"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f5f5f5'},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  list: {marginTop: 20},
  noteItem: {
    padding: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default App;
