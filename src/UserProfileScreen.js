import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {initializeApp} from 'firebase/app';
import {getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import {getFirestore, doc, onSnapshot} from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

const UserProfileScreen = ({navigation}) => {
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      console.log(
        'Auth state:',
        user ? `Logged in as ${user.email}` : 'Not logged in',
      );
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userRef, userSnap => {
          if (userSnap.exists()) {
            setUserData({
              uid: user.uid,
              email: user.email,
              ...userSnap.data(),
            });
          } else {
            console.log('User document does not exist for UID:', user.uid);
          }
        });

        const balanceRef = doc(db, 'userBalances', 'a57QvMbJL4kfEOu9Q0cb');
        const unsubscribeBalance = onSnapshot(balanceRef, balanceSnap => {
          console.log(
            'Balance snapshot:',
            balanceSnap.exists(),
            balanceSnap.data(),
          );
          if (balanceSnap.exists()) {
            const newBalance = balanceSnap.data().balance || 0;
            setBalance(newBalance);
            console.log('Balance updated to:', newBalance);
          } else {
            setBalance(0);
            console.log('Balance document does not exist');
          }
          setLoading(false);
        });

        return () => {
          unsubscribeUser();
          unsubscribeBalance();
        };
      } else {
        console.log('No user logged in, skipping data fetch');
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      // Đặt lại stack navigation về WelcomeScreen
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          style={styles.profileImage}
          source={{
            uri:
              userData?.photoURL ||
              'https://avatars.githubusercontent.com/u/24732708?v=4',
          }}
        />
        <Text style={styles.name}>Tai Nguyen</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>
            {userData?.phoneNumber || '0939 999 999'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Joined:</Text>
          <Text style={styles.value}>
            {userData?.createdAt
              ? new Date(userData.createdAt).toLocaleDateString()
              : '01/01/2021'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Balance:</Text>
          <Text style={styles.value}>{balance} $</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => navigation.navigate('BalanceTracking')}>
        <Text style={styles.trackButtonText}>Track Balance</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
    width: 80,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  signOutButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#2E86C1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfileScreen;
