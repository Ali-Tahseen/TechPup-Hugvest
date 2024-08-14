import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, Platform } from 'react-native';
import { auth, db } from '../functions/firebaseConfig';
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const ProfileScreen = ({ navigation }) => {
  const [dogName, setDogName] = useState('');

  useEffect(() => {
    const fetchDogName = async () => {
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
              setDogName(dogDocSnap.data().name);
            }
          }
        }
      }
    };

    fetchDogName();
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this account?',
      [
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const userDocRef = doc(db, 'users', user.uid);
              const userDocSnap = await getDoc(userDocRef);
              const dogID = userDocSnap.exists() ? userDocSnap.data().dogID : null;

              if (dogID) {
                const dogDocRef = doc(db, 'users', user.uid, 'dogs', dogID);
                await deleteDoc(dogDocRef);
              }

              await updateDoc(userDocRef, { dogID: '' });

              Alert.alert('Account Deleted', 'Your account has been deleted.');

              auth.signOut().then(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'CreateAvatar' }],
                });
              });
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.nameContainer}>
          <Text style={styles.dogName}>{dogName}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.closeButton}>
          <FontAwesome5 name="times" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <TouchableOpacity style={styles.storeButton} onPress={() => Alert.alert('Feature Coming Soon', 'TechPup HugVest Store is coming soon!')}>
          <FontAwesome5 name="shopping-bag" size={20} color="#333" />
          <Text style={styles.storeButtonText}>Go to the TechPup HugVest Store</Text>
        </TouchableOpacity>
        <Text style={styles.sectionHeader}>Account</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.optionButtonText}>Edit Dog Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'E-mail Address/Password is coming soon!')}>
          <Text style={styles.optionButtonText}>E-mail Address/Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'Notification Settings are coming soon!')}>
          <Text style={styles.optionButtonText}>Notification Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'Co-Parent Settings are coming soon!')}>
          <Text style={styles.optionButtonText}>Co-Parent Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Subscription')}>
          <Text style={styles.optionButtonText}>Subscription</Text>
        </TouchableOpacity>
        <Text style={styles.sectionHeader}>About the App</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'Version Info is coming soon!')}>
          <Text style={styles.optionButtonText}>Version Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'Notice is coming soon!')}>
          <Text style={styles.optionButtonText}>Notice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'User’s Guide is coming soon!')}>
          <Text style={styles.optionButtonText}>User’s Guide</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'Contact Us is coming soon!')}>
          <Text style={styles.optionButtonText}>Contact Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'Terms and Conditions are coming soon!')}>
          <Text style={styles.optionButtonText}>Terms and Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Feature Coming Soon', 'Privacy Policy is coming soon!')}>
          <Text style={styles.optionButtonText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, styles.logoutButton]} onPress={handleLogout}>
          <Text style={[styles.optionButtonText, styles.logoutButtonText]}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, styles.deleteButton]} onPress={handleDeleteAccount}>
          <Text style={[styles.optionButtonText, styles.deleteButtonText]}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('Home')}>
            <FontAwesome5 name="dog" size={24} color="#aaa" />
            <Text style={styles.bottomNavText}>My Dog</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('TrainVideos')}>
            <FontAwesome5 name="video" size={24} color="#aaa" />
            <Text style={styles.bottomNavText}>TechPup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => Alert.alert('Feature Coming Soon', 'Friends feature is coming soon!')}>
            <FontAwesome5 name="bone" size={24} color="#aaa" style={{ transform: [{ rotate: '45deg' }] }} />
            <Text style={styles.bottomNavText}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('Profile')}>
            <FontAwesome5 name="user" solid size={24} color="#0097A7" />
            <Text style={[styles.bottomNavText, styles.activeNavText]}>Me</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 50,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  nameContainer: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  dogName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Ensure there is enough space to scroll to the bottom
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    justifyContent: 'center',
  },
  storeButtonText: {
    color: '#333',
    fontSize: 16,
    marginLeft: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButtonText: {
    color: '#333',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  logoutButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    color: '#fff',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    height: 60,
  },
  bottomNavButton: {
    alignItems: 'center',
  },
  bottomNavText: {
    fontSize: 12,
    color: '#aaa',
  },
  activeNavText: {
    color: '#0097A7',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
