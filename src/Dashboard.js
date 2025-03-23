// Dashboard.js
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {initializeApp} from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  where,
} from 'firebase/firestore';
import {BarChart} from 'react-native-chart-kit';

// Firebase configuration (unchanged)
const firebaseConfig = {
  apiKey: 'AIzaSyCOhr59y7CEelFIKSef-qvDONOuJyJ2qMo',
  authDomain: 'the-mujick.firebaseapp.com',
  projectId: 'the-mujick',
  storageBucket: 'the-mujick.firebasestorage.app',
  messagingSenderId: '1047099514697',
  appId: '1:1047099514697:web:b1a13f4cfdbb847a22c498',
  measurementId: 'G-RJF7C0VNXY',
};

// Initialize Firebase (unchanged)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const matchesRef = collection(db, 'matches');
        const matchesQuery = query(matchesRef, orderBy('date', 'desc'));
        const matchSnapshot = await getDocs(matchesQuery);

        const matchesData = matchSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        }));

        setMatches(matchesData);

        if (matchesData.length > 0) {
          setSelectedMatch(matchesData[0]);
          const playerStatsRef = collection(db, 'playerStats');
          const playerQuery = query(
            playerStatsRef,
            where('matchId', '==', matchesData[0].id),
          );
          const playerSnapshot = await getDocs(playerQuery);

          const playerData = playerSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setPlayerStats(playerData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMatchSelect = async match => {
    setSelectedMatch(match);
    try {
      const playerStatsRef = collection(db, 'playerStats');
      const playerQuery = query(
        playerStatsRef,
        where('matchId', '==', match.id),
      );
      const playerSnapshot = await getDocs(playerQuery);

      const playerData = playerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPlayerStats(playerData);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  const renderMatchCard = match => {
    const isSelected = selectedMatch && selectedMatch.id === match.id;

    return (
      <TouchableOpacity
        key={match.id}
        style={[styles.matchCard, isSelected && styles.selectedCard]}
        onPress={() => handleMatchSelect(match)}>
        <Text style={styles.dateText}>
          {match.date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        <View style={styles.teamsContainer}>
          <Text style={styles.teamName}>{match.homeTeam}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{match.homeScore}</Text>
            <Text style={styles.scoreText}>-</Text>
            <Text style={styles.scoreText}>{match.awayScore}</Text>
          </View>
          <Text style={styles.teamName}>{match.awayTeam}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMatchStats = () => {
    if (!selectedMatch) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Match Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.statValue}>{selectedMatch.homePossession}%</Text>
          <View style={styles.statBarContainer}>
            <View
              style={[
                styles.statBar,
                {
                  width: `${selectedMatch.homePossession}%`,
                  backgroundColor: '#00b894',
                },
              ]}
            />
            <View
              style={[
                styles.statBar,
                {
                  width: `${selectedMatch.awayPossession}%`,
                  backgroundColor: '#e84393',
                },
              ]}
            />
          </View>
          <Text style={styles.statValue}>{selectedMatch.awayPossession}%</Text>
          <Text style={styles.statLabel}>Possession</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statValue}>{selectedMatch.homeShots}</Text>
          <View style={styles.statBarContainer}>
            <View
              style={[
                styles.statBar,
                {
                  width: `${
                    (selectedMatch.homeShots /
                      (selectedMatch.homeShots + selectedMatch.awayShots)) *
                    100
                  }%`,
                  backgroundColor: '#00b894',
                },
              ]}
            />
            <View
              style={[
                styles.statBar,
                {
                  width: `${
                    (selectedMatch.awayShots /
                      (selectedMatch.homeShots + selectedMatch.awayShots)) *
                    100
                  }%`,
                  backgroundColor: '#e84393',
                },
              ]}
            />
          </View>
          <Text style={styles.statValue}>{selectedMatch.awayShots}</Text>
          <Text style={styles.statLabel}>Shots</Text>
        </View>
        {/* Other stat rows remain unchanged */}
      </View>
    );
  };

  const renderPlayerStats = () => {
    if (!selectedMatch || playerStats.length === 0) return null;

    const homeTeamPlayers = playerStats.filter(
      player => player.teamName === selectedMatch.homeTeam,
    );
    const awayTeamPlayers = playerStats.filter(
      player => player.teamName === selectedMatch.awayTeam,
    );

    return (
      <View style={styles.playerStatsContainer}>
        <Text style={styles.sectionTitle}>Player Performance</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'home' && styles.activeTab]}
            onPress={() => setActiveTab('home')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'home' && styles.activeTabText,
              ]}>
              {selectedMatch.homeTeam}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'away' && styles.activeTab]}
            onPress={() => setActiveTab('away')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'away' && styles.activeTabText,
              ]}>
              {selectedMatch.awayTeam}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.playersList}>
          {activeTab === 'home'
            ? homeTeamPlayers.map(player => renderPlayerCard(player))
            : awayTeamPlayers.map(player => renderPlayerCard(player))}
        </ScrollView>
      </View>
    );
  };

  const renderPlayerCard = player => {
    return (
      <View key={player.id} style={styles.playerCard}>
        <View style={styles.playerHeader}>
          <Text style={styles.playerName}>{player.playerName}</Text>
          <Text style={styles.playerPosition}>{player.position}</Text>
        </View>
        <View style={styles.playerStatsGrid}>
          <View style={styles.playerStatItem}>
            <Text style={[styles.playerStatValue, {color: '#00b894'}]}>
              {player.distanceCovered}
            </Text>
            <Text style={styles.playerStatLabel}>KM</Text>
          </View>
          <View style={styles.playerStatItem}>
            <Text style={[styles.playerStatValue, {color: '#e84393'}]}>
              {player.maxSpeed}
            </Text>
            <Text style={styles.playerStatLabel}>KM/H</Text>
          </View>
          {/* Other stats remain unchanged */}
        </View>
      </View>
    );
  };

  const renderTeamPerformanceChart = () => {
    if (matches.length === 0) return null;

    const teams = [
      ...new Set([
        ...matches.map(match => match.homeTeam),
        ...matches.map(match => match.awayTeam),
      ]),
    ];

    const teamPerformance = teams.map(team => {
      const teamMatches = matches.filter(
        match => match.homeTeam === team || match.awayTeam === team,
      );

      const goalsScored = teamMatches.reduce((sum, match) => {
        if (match.homeTeam === team) return sum + match.homeScore;
        if (match.awayTeam === team) return sum + match.awayScore;
        return sum;
      }, 0);

      const goalsConceded = teamMatches.reduce((sum, match) => {
        if (match.homeTeam === team) return sum + match.awayScore;
        if (match.awayTeam === team) return sum + match.homeScore;
        return sum;
      }, 0);

      return {
        team,
        avgScored: goalsScored / teamMatches.length,
        avgConceded: goalsConceded / teamMatches.length,
        totalMatches: teamMatches.length,
      };
    });

    // Changed from slice(0, 5) to slice(0, 3) to get top 3 teams
    const topTeams = teamPerformance
      .sort((a, b) => b.avgScored - a.avgScored)
      .slice(0, 3);

    const chartData = {
      labels: topTeams.map(t => t.team.split(' ')[0]), // First word of team name for brevity
      datasets: [
        {
          data: topTeams.map(t => t.avgScored),
          color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, // Vibrant red
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Top 3 Teams - Goals per Match</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 70}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#0000',
            backgroundGradientTo: 'grey',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#54a0ff" />
        <Text style={styles.loadingText}>Loading football data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>News</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
            onPress={() => setActiveTab('recent')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'recent' && styles.activeTabText,
              ]}>
              Recent Matches
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'stats' && styles.activeTabText,
              ]}>
              Team Stats
            </Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'recent' ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.matchesScrollView}>
              {matches.map(match => renderMatchCard(match))}
            </ScrollView>
            {renderMatchStats()}
            {renderPlayerStats()}
          </>
        ) : (
          renderTeamPerformanceChart()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f1f6',
  },
  loadingText: {
    marginTop: 86,
    fontSize: 16,
    color: '#2d3436',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    color: '0000',
  },
  scrollView: {
    flex: 1,
  },
  matchesScrollView: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  matchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    width: 220,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#000',
  },
  dateText: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 8,
  },
  teamsContainer: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 4,
    textAlign: 'center',
    color: '#2d3436',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    color: '#00d2d3',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ff9f43',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    width: 80,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
    color: '#2d3436',
  },
  statBarContainer: {
    flex: 1,
    height: 10,
    flexDirection: 'row',
    backgroundColor: '#dfe6e9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
  },
  playerStatsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#636e72',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#ffffff',
  },
  playersList: {
    maxHeight: 400,
  },
  playerCard: {
    backgroundColor: '#f7f8fc',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  playerPosition: {
    fontSize: 12,
    color: '#ffffff',
    backgroundColor: '#00b894',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playerStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playerStatItem: {
    width: '25%',
    marginBottom: 8,
  },
  playerStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
  playerStatLabel: {
    fontSize: 10,
    color: '#636e72',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Dashboard;
