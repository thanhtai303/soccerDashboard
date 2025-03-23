import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
} from 'react-native';
import {initializeApp} from 'firebase/app';
import {getFirestore, collection, getDocs} from 'firebase/firestore';
import {useNavigation} from '@react-navigation/native';

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

const MatchListScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesRef = collection(db, 'matches');
        const snapshot = await getDocs(matchesRef);

        const matchList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        }));

        setMatches(matchList);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEEAD',
      '#D4A5A5',
      '#9B59B6',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderMatchItem = ({item}) => (
    <TouchableOpacity
      style={[styles.matchItem, {backgroundColor: getRandomColor()}]}
      onPress={() => navigation.navigate('MatchStats', {matchId: item.id})}>
      <Text style={styles.matchText}>
        {item.homeTeam} <Text style={styles.scoreText}>{item.homeScore}</Text> -{' '}
        <Text style={styles.scoreText}>{item.awayScore}</Text> {item.awayTeam}
      </Text>
      <Text style={styles.dateText}>{item.date.toLocaleDateString()}</Text>
      <Button
        title="Predict"
        color="#000"
        onPress={() => navigation.navigate('PredictScore', {matchId: item.id})}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Matches</Text>
      {matches.length === 0 ? (
        <Text style={styles.noMatchesText}>No matches available</Text>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#000',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  matchItem: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  matchText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
  },
  dateText: {
    fontSize: 14,
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  list: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
  },
  loadingText: {
    fontSize: 18,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  noMatchesText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MatchListScreen;
