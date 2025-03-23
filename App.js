import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {initializeApp} from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [isSeeded, setIsSeeded] = useState(false); // Flag to seed data once

  // Seed sample data (runs only once)
  const seedData = async () => {
    const sampleNotes = [
      {text: 'Buy groceries', createdAt: new Date()},
      {text: 'Finish assignment', createdAt: new Date()},
      {text: 'Call mom', createdAt: new Date()},
    ];
    for (const note of sampleNotes) {
      await addDoc(collection(db, 'Notes'), note);
    }
  };

  // Fetch notes in real-time from Firestore and seed data if empty
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'Notes'),
      snapshot => {
        const notesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotes(notesList);

        // Seed data if the collection is empty and not yet seeded
        if (notesList.length === 0 && !isSeeded) {
          seedData().then(() => setIsSeeded(true));
        }
      },
      error => {
        console.error('Error fetching notes:', error);
      },
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isSeeded]);

  // Add a new note to Firestore
  const addNote = async () => {
    if (note.trim()) {
      try {
        await addDoc(collection(db, 'Notes'), {
          text: note,
          createdAt: new Date(),
        });
        setNote(''); // Clear input after saving
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  // Delete a note from Firestore
  const deleteNote = async id => {
    try {
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
