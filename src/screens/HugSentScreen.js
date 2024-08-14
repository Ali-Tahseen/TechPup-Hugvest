import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../functions/firebaseConfig';

const { width } = Dimensions.get('window');

const HugSentScreen = ({ navigation }) => {
  const [dogData, setDogData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDogData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const dogID = userDocSnap.data().dogID;
            if (dogID) {
              const dogDocRef = doc(db, 'users', user.uid, 'dogs', dogID);
              const dogDocSnap = await getDoc(dogDocRef);
              if (dogDocSnap.exists()) {
                setDogData(dogDocSnap.data());
              } else {
                Alert.alert('Error', 'Dog data not found.');
              }
            } else {
              Alert.alert('Error', 'Dog ID not found.');
            }
          } else {
            Alert.alert('Error', 'User data not found.');
          }
        } else {
          Alert.alert('Error', 'User not authenticated.');
        }
      } catch (error) {
        console.error('Error fetching dog data:', error);
        Alert.alert('Error', 'Failed to fetch dog data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDogData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!dogData) {
    return (
      <View style={styles.container}>
        <Text>Dog data not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
      <View style={styles.topContainer}>
        <View style={styles.heartContainer}>
          <Ionicons name="heart" size={width * 0.8} color="red" style={styles.heartIcon} />
          <Image source={{ uri: dogData.photo }} style={styles.dogImage} />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Hug Sent!</Text>
        <Text style={styles.subtitle}>{dogData.name} has received your hug</Text>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topContainer: {
    flex: 3, // Adjust the flex values to control the space taken by the top and bottom containers
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Ensures that the dog image is positioned relative to the heart
  },
  heartIcon: {
    position: 'absolute',
  },
  dogImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    position: 'absolute',
    resizeMode: 'cover', // Ensures the image fits well within the circular frame
  },
  bottomContainer: {
    flex: 1, // Adjust the flex values to control the space taken by the top and bottom containers
    justifyContent: 'flex-start', // Align the content to the top of the bottom container
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: -50, // Negative margin to bring the bottom container closer to the top container
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#777',
    marginBottom: 40,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#00C3A9',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 40, // Adjusted to place the close button properly at the top right
    right: 20,
    zIndex: 1, // Ensure the button appears above other elements
  },
  closeButtonText: {
    fontSize: 24,
    color: 'black',
  },
});

export default HugSentScreen;
