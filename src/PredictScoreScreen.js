import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {initializeApp} from 'firebase/app';
import {getFirestore, doc, getDoc, updateDoc} from 'firebase/firestore';
import {useRoute, useNavigation} from '@react-navigation/native';

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

const PredictScoreScreen = () => {
  const [homeScorePrediction, setHomeScorePrediction] = useState('');
  const [awayScorePrediction, setAwayScorePrediction] = useState('');
  const [actualScore, setActualScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation(); // Thêm useNavigation để điều hướng
  const {matchId} = route.params;

  useEffect(() => {
    const fetchActualScore = async () => {
      try {
        const matchRef = doc(db, 'matches', matchId);
        const matchDoc = await getDoc(matchRef);
        if (matchDoc.exists()) {
          const data = matchDoc.data();
          setActualScore({
            homeScore: data.homeScore,
            awayScore: data.awayScore,
            homeTeam: data.homeTeam,
            awayTeam: data.awayTeam,
          });
        } else {
          Alert.alert('Error', 'Match not found');
        }
      } catch (error) {
        console.error('Error fetching match data:', error);
        Alert.alert('Error', 'Failed to load match data');
      } finally {
        setLoading(false);
      }
    };

    fetchActualScore();
  }, [matchId]);

  const updateBalance = async reward => {
    const balanceRef = doc(db, 'userBalances', 'a57QvMbJL4kfEOu9Q0cb');
    const balanceSnap = await getDoc(balanceRef);
    const currentBalance = balanceSnap.exists()
      ? balanceSnap.data().balance
      : 0;
    const newBalance = currentBalance + reward;

    try {
      await updateDoc(balanceRef, {balance: newBalance});
      console.log(`Balance updated: ${newBalance}`);
    } catch (error) {
      console.error('Error updating balance:', error);
      Alert.alert('Error', 'Failed to update balance');
    }
  };

  const handlePrediction = () => {
    if (!homeScorePrediction || !awayScorePrediction) {
      Alert.alert('Error', 'Please enter both scores');
      return;
    }

    const predictedHome = parseInt(homeScorePrediction, 10);
    const predictedAway = parseInt(awayScorePrediction, 10);

    if (isNaN(predictedHome) || isNaN(predictedAway)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    if (actualScore) {
      if (
        predictedHome === actualScore.homeScore &&
        predictedAway === actualScore.awayScore
      ) {
        const reward = 100;
        Alert.alert(
          'Congratulations!',
          `You predicted correctly! ${actualScore.homeTeam} ${actualScore.homeScore} - ${actualScore.awayScore} ${actualScore.awayTeam}. You will earn ${reward} $ in 10 seconds!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  updateBalance(reward);
                }, 10000); // 10 giây
                navigation.navigate('MatchList'); // Chuyển về MatchListScreen
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Sorry!',
          `Wrong prediction. Actual score: ${actualScore.homeTeam} ${actualScore.homeScore} - ${actualScore.awayScore} ${actualScore.awayTeam}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MatchList'), // Chuyển về MatchListScreen
            },
          ],
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading match data...</Text>
      </View>
    );
  }

  if (!actualScore) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Match data not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Predict the Score</Text>
      <Text style={styles.matchInfo}>
        {actualScore.homeTeam} vs {actualScore.awayTeam}
      </Text>
      <Text style={styles.label}>Your Prediction:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Home"
          keyboardType="numeric"
          value={homeScorePrediction}
          onChangeText={setHomeScorePrediction}
        />
        <Text style={styles.separator}> - </Text>
        <TextInput
          style={styles.input}
          placeholder="Away"
          keyboardType="numeric"
          value={awayScorePrediction}
          onChangeText={setAwayScorePrediction}
        />
      </View>
      <Button
        title="Submit Prediction"
        onPress={handlePrediction}
        color="#000"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E86C1',
    textAlign: 'center',
    marginBottom: 20,
  },
  matchInfo: {
    fontSize: 20,
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#34495E',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
    width: 100,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#FFFFFF',
  },
  separator: {
    fontSize: 24,
    color: '#34495E',
    marginHorizontal: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
  },
});

export default PredictScoreScreen;
