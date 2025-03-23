import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {initializeApp} from 'firebase/app';
import {getFirestore, doc, onSnapshot} from 'firebase/firestore';
import {LineChart} from 'react-native-chart-kit';

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

const screenWidth = Dimensions.get('window').width;

const BalanceTrackingScreen = () => {
  const [balanceData, setBalanceData] = useState([0]);
  const [labels, setLabels] = useState(['0s']);

  useEffect(() => {
    const balanceRef = doc(db, 'userBalances', 'a57QvMbJL4kfEOu9Q0cb');
    let seconds = 0;

    const unsubscribe = onSnapshot(balanceRef, balanceSnap => {
      const currentBalance = balanceSnap.exists()
        ? balanceSnap.data().balance
        : 0;
      setBalanceData(prev => [...prev.slice(-9), currentBalance]);
      setLabels(prev => [...prev.slice(-9), `${seconds}s`]);
    });

    const interval = setInterval(() => {
      seconds += 1;
      const balanceSnap = balanceData[balanceData.length - 1];
      setBalanceData(prev => [...prev.slice(-9), balanceSnap]);
      setLabels(prev => [...prev.slice(-9), `${seconds}s`]);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: balanceData,
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance Tracking</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" $"
        chartConfig={{
          backgroundColor: '#E8F0FE',
          backgroundGradientFrom: '#E8F0FE',
          backgroundGradientTo: '#E8F0FE',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(46, 134, 193, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#FF6B6B',
          },
        }}
        bezier
        style={styles.chart}
      />
      <Text style={styles.currentBalance}>
        Current Balance: {balanceData[balanceData.length - 1]} coins
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E86C1',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  currentBalance: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
  },
});

export default BalanceTrackingScreen;
