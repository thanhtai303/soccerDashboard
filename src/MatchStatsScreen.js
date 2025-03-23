import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import {initializeApp} from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  query,
} from 'firebase/firestore';
import {LineChart, BarChart, PieChart} from 'react-native-chart-kit';
import {useRoute} from '@react-navigation/native';

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

const MatchStatsScreen = () => {
  const [matchData, setMatchData] = useState(null);
  const [playerData, setPlayerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const {matchId} = route.params;

  const fetchData = useCallback(async () => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      const match = {
        id: matchDoc.id,
        ...matchDoc.data(),
        date: matchDoc.data().date.toDate(),
      };

      const playerStatsRef = collection(db, 'playerStats');
      const playerQuery = query(
        playerStatsRef,
        where('matchId', '==', match.id),
      );
      const playerSnapshot = await getDocs(playerQuery);

      const players = playerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMatchData(match);
      setPlayerData(players);

      setMatchData(prevData => ({
        ...prevData,
        homeShots: prevData.homeShots + Math.floor(Math.random() * 3) - 1,
        awayShots: prevData.awayShots + Math.floor(Math.random() * 3) - 1,
        homePossession: Math.min(
          100,
          Math.max(
            0,
            prevData.homePossession + Math.floor(Math.random() * 5) - 2,
          ),
        ),
        awayPossession: Math.min(
          100,
          Math.max(
            0,
            prevData.awayPossession + Math.floor(Math.random() * 5) - 2,
          ),
        ),
        homeCorners: prevData.homeCorners + Math.floor(Math.random() * 2) - 1,
        awayCorners: prevData.awayCorners + Math.floor(Math.random() * 2) - 1,
        homeFouls: prevData.homeFouls + Math.floor(Math.random() * 3) - 1,
        awayFouls: prevData.awayFouls + Math.floor(Math.random() * 3) - 1,
        homeYellowCards: Math.min(
          prevData.homeYellowCards + Math.floor(Math.random() * 2) - 1,
          5,
        ),
        awayYellowCards: Math.min(
          prevData.awayYellowCards + Math.floor(Math.random() * 2) - 1,
          5,
        ),
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading || !matchData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Dữ liệu cho các biểu đồ
  const possessionData = [
    {
      name: matchData.homeTeam,
      possession: matchData.homePossession,
      color: '#FF6B6B',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
    {
      name: matchData.awayTeam,
      possession: matchData.awayPossession,
      color: '#4ECDC4',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
  ];

  const shotsData = {
    labels: ['Home Shots', 'Away Shots'],
    datasets: [
      {
        data: [matchData.homeShots, matchData.awayShots],
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
      },
    ],
  };

  const cornersData = {
    labels: ['Home Corners', 'Away Corners'],
    datasets: [
      {
        data: [matchData.homeCorners, matchData.awayCorners],
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
      },
    ],
  };

  const foulsData = {
    labels: ['Home Fouls', 'Away Fouls'],
    datasets: [
      {
        data: [matchData.homeFouls, matchData.awayFouls],
        color: (opacity = 1) => `rgba(255, 69, 0, ${opacity})`,
      },
    ],
  };

  const yellowCardsData = {
    labels: ['Home Yellow Cards', 'Away Yellow Cards'],
    datasets: [
      {
        data: [matchData.homeYellowCards, matchData.awayYellowCards],
        color: (opacity = 1) => `rgba(255, 255, 0, ${opacity})`,
      },
    ],
  };

  const distanceData = {
    labels: playerData
      .slice(0, 5)
      .map(player => player.playerName.split(' ')[0]),
    datasets: [
      {
        data: playerData.slice(0, 5).map(player => player.distanceCovered),
        color: (opacity = 1) => `rgba(142, 68, 173, ${opacity})`, // Tím
        strokeWidth: 3,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {matchData.homeTeam} vs {matchData.awayTeam}
      </Text>
      <Text style={styles.score}>
        {matchData.homeScore} - {matchData.awayScore}
      </Text>

      {/* Possession Pie Chart */}
      <Text style={styles.chartTitle}>Possession (%)</Text>
      <PieChart
        data={possessionData}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#FF9F43', // Cam
          backgroundGradientTo: '#FF6B6B', // Đỏ nhạt
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="possession"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />

      {/* Shots Bar Chart */}
      <Text style={styles.chartTitle}>Shots</Text>
      <BarChart
        data={shotsData}
        width={screenWidth - 20}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundGradientFrom: '#E74C3C', // Đỏ đậm
          backgroundGradientTo: '#F1948A', // Đỏ nhạt
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForBars: {
            barRadius: 5,
          },
        }}
        style={styles.chart}
      />

      {/* Corners Bar Chart */}
      <Text style={styles.chartTitle}>Corners</Text>
      <BarChart
        data={cornersData}
        width={screenWidth - 20}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundGradientFrom: '#F1C40F', // Vàng đậm
          backgroundGradientTo: '#F9E79F', // Vàng nhạt
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForBars: {
            barRadius: 5,
          },
        }}
        style={styles.chart}
      />

      {/* Fouls Bar Chart */}
      <Text style={styles.chartTitle}>Fouls</Text>
      <BarChart
        data={foulsData}
        width={screenWidth - 20}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundGradientFrom: '#E67E22', // Cam đậm
          backgroundGradientTo: '#F8C471', // Cam nhạt
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForBars: {
            barRadius: 5,
          },
        }}
        style={styles.chart}
      />

      {/* Yellow Cards Bar Chart */}
      <Text style={styles.chartTitle}>Yellow Cards</Text>
      <BarChart
        data={yellowCardsData}
        width={screenWidth - 20}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundGradientFrom: '#F4D03F', // Vàng sáng đậm
          backgroundGradientTo: '#FEF9E7', // Vàng rất nhạt
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForBars: {
            barRadius: 5,
          },
        }}
        style={styles.chart}
      />

      {/* Player Distance Line Chart */}
      <Text style={styles.chartTitle}>Player Distance Covered (km)</Text>
      <LineChart
        data={distanceData}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#8E44AD', // Tím đậm
          backgroundGradientTo: '#D7BDE2', // Tím nhạt
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#FFFFFF',
          },
        }}
        style={styles.chart}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#E8F0FE', // Nền xanh nhạt
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#2E86C1', // Xanh dương đậm
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFD700', // Vàng sáng
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#34495E', // Xám xanh đậm
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF', // Viền trắng
  },
  loadingText: {
    fontSize: 18,
    color: '#E74C3C', // Đỏ nhạt
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MatchStatsScreen;
