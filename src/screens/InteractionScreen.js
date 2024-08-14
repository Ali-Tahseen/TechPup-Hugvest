import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Dimensions, Animated } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../functions/firebaseConfig';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const InteractionScreen = ({ navigation }) => {
  const [dogData, setDogData] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [scrollValue, setScrollValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const handPosition = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const animateHandAndDot = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(handPosition, {
            toValue: width * 0.6, // Adjust this value to match your slider's width
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(handPosition, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animateHandAndDot();
  }, [handPosition]);

  const startRecording = async () => {
    try {
      if (recordedUri) {
        Alert.alert('Recording Exists', 'A recording is already stored. You can play it, send it, or delete it before recording a new one.');
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording permission is required to use this feature.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      console.log('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      return;
    }
    try {
      console.log('Stopping recording...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      console.log('Recording stopped and stored at:', uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleRecordButtonPress = async () => {
    try {
      if (recording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error('Error handling record button:', error);
    }
  };

  const handlePlayButtonPress = async () => {
    if (!recordedUri) {
      Alert.alert('No Recording Found', 'Please record something first.');
      return;
    }

    const soundObject = new Audio.Sound();
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      console.log('Loading sound object from:', recordedUri);
      await soundObject.loadAsync({ uri: recordedUri });
      await soundObject.playAsync();
      console.log('Playing recording...');
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          soundObject.unloadAsync();
          console.log('Playback finished and sound object unloaded');
        }
      });
    } catch (error) {
      console.error('Error playing the audio:', error);
    }
  };

  const handleSendButtonPress = () => {
    if (scrollValue > 0) {  // Ensure the slider has been moved from the initial position
        // Execute the API call to run the update_flag.php script on the server
        fetch('http://techpup.xyz/update_flag.php', {
          method: 'POST',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.text(); 
        })
        .then(data => {
            console.log('API call successful:', data);
            navigation.navigate('HugSent');
        })
        .catch(error => {
            console.error('Error making the API call:', error);
            Alert.alert('Error', 'Failed to send the hug. Please try again.');
        });
      
    } else {
        Alert.alert('Adjust the slider', 'Please move the slider to select the strength of the hug before sending.');
    }
  };


  

  const handleSendVoiceMessage = () => {
    if (!recordedUri) {
      Alert.alert('No Recording Found', 'Please record a message before sending.');
      return;
    }
    navigation.navigate('VoiceMessageSent');
  };

  const handleDeleteButtonPress = () => {
    if (!recordedUri) {
      Alert.alert('No Recording Found', 'There is nothing to delete.');
      return;
    }
    setRecordedUri(null);
    setRecording(null);
    Alert.alert('Recording Deleted', 'You can now record a new message.');
  };

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
        <Text>No dog data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="close" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Connect with {dogData.name}</Text>
      <Text style={styles.subtitle}>Send a Hug</Text>
      {dogData.photo && (
        <Image source={{ uri: dogData.photo }} style={styles.dogImage} />
      )}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Weak</Text>
        <Slider
          style={styles.slider}
          value={scrollValue}
          onValueChange={setScrollValue}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          minimumTrackTintColor="#00bcd4"
          maximumTrackTintColor="#000000"
          thumbTintColor="#00bcd4"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendButtonPress}
          disabled={scrollValue === 0} // Disable the button if the slider is not moved
        >
          <Entypo name="paper-plane" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.label}>Strong</Text>
      </View>
      <View style={styles.handContainer}>
      <View style={styles.sliderLine} />
        <Animated.View style={[styles.hand, { transform: [{ translateX: handPosition }] }]}>
          <View style={styles.dot} />
          <FontAwesome name="hand-pointer-o" size={36} color="black" />
        </Animated.View>
      </View>

      <TouchableOpacity onPress={handleRecordButtonPress}>
        {recording ? (
          <View style={styles.recordingIndicator}></View>
        ) : (
          <FontAwesome name="microphone" size={24} color="red" />
        )}
      </TouchableOpacity>
      <Text style={styles.subtitle}>Send a voice message</Text>
      <View style={styles.audioControls}>
        <TouchableOpacity onPress={handlePlayButtonPress}>
          <FontAwesome name="play" size={24} color="purple" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSendVoiceMessage}>
          <Entypo name="paper-plane" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteButtonPress}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: height * 0.05,
    right: width * 0.05,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  dogImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
    borderRadius: 75,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#00bcd4',
    borderRadius: 50,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  handContainer: {
    width: width * 0.6,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  sliderLine: {
    position: 'absolute',
    height: 2,
    width: width * 0.6,
    backgroundColor: '#ccc',
    top: 35,
  },
  dot: {
    position: 'absolute', // Ensure the dot is absolutely positioned
    zIndex: 1, // Lower zIndex to keep it behind the hand
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00bcd4',
    left: 0, // Adjust the left position relative to the container
    top: -5, // Adjust the top position to align with the finger tip
  },
  hand: {
    position: 'absolute', // Ensure the hand is also absolutely positioned
    zIndex: 2, // Higher zIndex to keep it in front of the dot
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 24,
    height: 24,
    backgroundColor: 'red',
    borderRadius: 12,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 12,
  },
});

export default InteractionScreen;