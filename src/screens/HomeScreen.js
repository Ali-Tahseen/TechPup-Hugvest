import React, { useState, useEffect, useContext, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Platform, Dimensions, Animated, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../functions/firebaseConfig';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { EmotionContext } from '../contexts/EmotionContext';

const { height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [dogData, setDogData] = useState(null);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const { emotionData, heartRate } = useContext(EmotionContext);
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchDogData = async () => {
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
            const dogData = dogDocSnap.data();
            if (dogData.photo) {
              const storage = getStorage();
              const photoRef = ref(storage, dogData.photo);
              const photoURL = await getDownloadURL(photoRef);
              setDogData({ ...dogData, photoURL });
            } else {
              setDogData(dogData);
            }
          }
        }
      }
    }
  };

  const fetchNotifications = async () => {
    if (dogData) {
      const isCalm = emotionData.calm > 50;
      const emoji = isCalm ? 'smile' : 'dizzy';
      const emotion = isCalm ? 'calm' : 'anxious';
  
      const dummyNotifications = [
        { id: 1, message: `${dogData.name} is ${emotion}.`, icon: emoji },
        { id: 2, message: `${dogData.name} is having a heart rate of ${heartRate} BPM.`, icon: 'heartbeat' },
      ];
      
      setNotifications(dummyNotifications);
    }
  };
  

  useEffect(() => {
    fetchDogData();
    fetchNotifications();
  }, [dogData, emotionData, heartRate]);

  useFocusEffect(
    React.useCallback(() => {
      fetchDogData();
      fetchNotifications();
    }, [])
  );

  useEffect(() => {
    let loopAnimation;
    if (emotionData.calm > 50) {
      loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      loopAnimation.start();
    } else if (emotionData.calm <= 50 && emotionData.anxious > 50) {
      loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(dizzyColorAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(dizzyColorAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      loopAnimation.start();
    }
    return () => loopAnimation && loopAnimation.stop(); // Clean up the animation on unmount
  }, [colorAnim, dizzyColorAnim, emotionData]);
  

  const toggleShowFullAbout = () => {
    setShowFullAbout(!showFullAbout);
  };

  const getGenderIcon = (gender) => {
    if (gender.toLowerCase() === 'male') {
      return 'mars';
    } else if (gender.toLowerCase() === 'female') {
      return 'venus';
    }
    return 'genderless';
  };

  const dizzyColorAnim = useRef(new Animated.Value(0)).current;

  const smileColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#00FF00', '#FFFFFF'],
  });

  const dizzyIconColor = dizzyColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#800080', '#FFFFFF'], // Original color and animated color
  });
  

  if (!dogData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Heights of fixed elements
  const locationHeight = 30; // Approximate height of the location container
  const bottomNavHeight = 70; // Approximate height of the bottom navigation bar
  const topPartHeight = 300; // Approximate height of the top part including side icons and photo
  const spacing = 10; // Spacing between the containers

  // Calculate the remaining height available for the three containers
  const availableHeight = height - locationHeight - bottomNavHeight - topPartHeight - (spacing * 4);

  // Calculate the height for each container
  const containerHeight = availableHeight / 3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topPart}>
        <View style={styles.sideIconsContainer}>
            <View style={styles.emojisContainer}>
              <Animated.Text style={{ color: smileColor }}>
                <FontAwesome5 name="smile" size={24} />
              </Animated.Text>
              <FontAwesome5 name="meh" size={24} color="#FFD700" style={styles.emojiIcon} />
              <FontAwesome5 name="frown" size={24} color="#FF4500" style={styles.emojiIcon} />
              <FontAwesome5 name="angry" size={24} color="#FF0000" style={styles.emojiIcon} />
              <FontAwesome5 name="grin-stars" size={24} color="#00BFFF" style={styles.emojiIcon} />
              <Animated.Text style={{ color: dizzyIconColor }}>
                <FontAwesome5 name="dizzy" size={24} />
              </Animated.Text>
            </View>

          {dogData.photoURL && (
            <Image 
              source={{ uri: dogData.photoURL }} 
              style={styles.photo} 
              onError={() => {
                console.log('Failed to load image: ', dogData.photoURL);
                setDogData({ ...dogData, photoURL: null });
              }}
            />
          )}
          <View style={styles.rightIconsContainer}>
            <TouchableOpacity style={[styles.iconButton, styles.iconButtonRed]} onPress={() => navigation.navigate('HeartRateScreen')}>
              <FontAwesome5 name="heartbeat" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.iconButtonGreen]} onPress={() => navigation.navigate('Interaction')}>
              <FontAwesome5 name="dog" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.iconButtonPurple]} onPress={() => navigation.navigate('Map')}>
              <FontAwesome5 name="map" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <FontAwesome5 name="map-marker" size={16} color="#666" />
          <Text style={styles.locationText}>Hong Kong</Text>
        </View>
        <TouchableOpacity style={styles.bellIconContainer} onPress={() => setModalVisible(true)}>
          <FontAwesome5 name="bell" size={24} color="#666" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.dogDetailsBox, { minHeight: containerHeight, marginBottom: spacing }]}>
          <View style={styles.dogDetailsRow}>
            <Text style={styles.dogName}>{dogData.name}</Text>
            <View style={styles.genderContainer}>
              <Text style={styles.genderText}>{dogData.gender}</Text>
              <View style={styles.genderIconBox}>
                <FontAwesome5 name={getGenderIcon(dogData.gender)} size={16} color="#fff" style={styles.genderIcon} />
              </View>
            </View>
          </View>
          <View style={styles.breedAgeContainer}>
            <Text style={styles.detailText}>• {dogData.breed}</Text>
            <Text style={styles.detailText}>• {dogData.age} months</Text>
          </View>
        </View>
        <View style={[styles.aboutContainer, { minHeight: containerHeight, marginBottom: spacing }]}>
          <View style={styles.aboutHeader}>
            <Image source={require('../../assets/icons/dog_bone_icon.png')} style={styles.aboutIcon} />
            <Text style={styles.sectionTitle}>About {dogData.name}</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Weight</Text>
              <Text style={styles.statValue}>{dogData.weight}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Height</Text>
              <Text style={styles.statValue}>{dogData.height}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Color</Text>
              <Text style={styles.statValue}>{dogData.furColor}</Text>
            </View>
          </View>
          <Text style={styles.aboutText}>
            {showFullAbout ? dogData.about : dogData.about.split(' ').slice(0, 20).join(' ')}
            {dogData.about.split(' ').length > 20 && (
              <Text style={styles.moreText} onPress={toggleShowFullAbout}>
                {showFullAbout ? ' Less' : '... More'}
              </Text>
            )}
          </Text>
        </View>
        <View style={[styles.behaviorContainer, { minHeight: containerHeight }]}>
          <View style={styles.behaviorHeader}>
            <FontAwesome5 name="paw" size={20} color="#666" style={styles.behaviorIcon} />
            <Text style={styles.sectionTitle}>{dogData.name} behavior</Text>
          </View>
          <View style={styles.behaviorTagsContainer}>
            {dogData.behaviors.map((behavior, index) => (
              <View key={index} style={styles.behaviorTag}>
                <Text style={styles.behaviorTagText}>{behavior}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('Home')}>
            <FontAwesome5 name="dog" size={24} color="#0097A7" />
            <Text style={[styles.bottomNavText, styles.activeNavText]}>My Dog</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('TrainVideos')}>
            <FontAwesome5 name="video" size={24} color="#666" />
            <Text style={styles.bottomNavText}>TechPup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => Alert.alert('Feature Coming Soon', 'Friends feature is coming soon!')}>
            <FontAwesome5 name="bone" size={24} color="#666" style={{ transform: [{ rotate: '45deg' }] }} />
            <Text style={styles.bottomNavText}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('Profile')}>
            <FontAwesome5 name="user" solid size={24} color="#666" />
            <Text style={styles.bottomNavText}>Me</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <FontAwesome5 name={notification.icon} size={24} color="#666" />
                <Text style={styles.notificationText}>{notification.message}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    paddingTop: Platform.OS === 'android' ? 45 : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: Platform.OS === 'ios' ? 80 : 70, // Ensure padding to prevent overlap with the bottom navigation bar
  },
  topPart: {
    alignItems: 'center',
  },
  sideIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.01,
  },
  emojisContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginRight: 10,
  },
  emojiIcon: {
    marginVertical: 10, // Adjust this value to change the spacing
  },
  rightIconsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: height * 0.25,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonRed: {
    backgroundColor: '#F44336',
  },
  iconButtonGreen: {
    backgroundColor: '#4CAF50',
  },
  iconButtonPurple: {
    backgroundColor: '#9C27B0',
  },
  photo: {
    width: height * 0.15,
    height: height * 0.15,
    borderRadius: height * 0.075,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: height * 0.005,
    marginBottom: height * 0.005,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.005,
    justifyContent: 'center',
    marginBottom: height * 0.005,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  bellIconContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  dogDetailsBox: {
    backgroundColor: '#B2EBF2',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    width: '90%',
    alignSelf: 'center',
    position: 'relative',
  },
  dogDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  genderContainer: {
    alignItems: 'center',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
  },
  genderIconBox: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
  },
  genderIcon: {
    fontSize: 16,
    color: '#fff',
  },
  breedAgeContainer: {
    marginTop: height * 0.005,
    alignItems: 'flex-start',
    width: '100%',
  },
  detailText: {
    fontSize: 16,
    color: '#666',
  },
  aboutContainer: {
    backgroundColor: '#B2EBF2',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    elevation: 3,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aboutIcon: {
    marginLeft: 10,
    width: 24,
    height: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#0097A7',
    padding: 10,
    borderRadius: 10,
  },
  statTitle: {
    fontSize: 14,
    color: '#fff',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  moreText: {
    color: '#00796B',
    textDecorationLine: 'underline',
  },
  behaviorContainer: {
    backgroundColor: '#B2EBF2',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    elevation: 3,
  },
  behaviorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  behaviorIcon: {
    marginRight: 10,
  },
  behaviorTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  behaviorTag: {
    alignItems: 'center',
    backgroundColor: '#0097A7',
    padding: 10,
    borderRadius: 10,
    margin: 5,
  },
  behaviorTagText: {
    color: '#fff',
  },
  bottomContainer: {
    backgroundColor: '#B2EBF2',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#B2EBF2',
    paddingVertical: 10,
    height: 60,
  },
  bottomNavButton: {
    alignItems: 'center',
  },
  bottomNavText: {
    fontSize: 12,
    color: '#666',
  },
  activeNavText: {
    color: '#0097A7',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#0097A7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;
