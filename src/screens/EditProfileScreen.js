import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../functions/firebaseConfig';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const genderData = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const weightUnitData = [
  { label: 'kg', value: 'kg' },
  { label: 'lbs', value: 'lbs' },
];

const heightUnitData = [
  { label: 'cm', value: 'cm' },
  { label: 'inches', value: 'inches' },
  { label: 'metres', value: 'metres' },
  { label: 'feet', value: 'feet' },
];

const EditProfileScreen = ({ navigation }) => {
  const [dogName, setDogName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(null);
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [about, setAbout] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState('');
  const [furColor, setFurColor] = useState('');
  const [behavior, setBehavior] = useState('');
  const [behaviors, setBehaviors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
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
              const data = dogDocSnap.data();
              setDogName(data.name);
              setAge(data.age);
              setGender(data.gender);
              setBreed(data.breed);
              const [weightValue, weightUnitValue] = data.weight.split(' ');
              setWeight(weightValue);
              setWeightUnit(weightUnitValue);
              const [heightValue, heightUnitValue] = data.height.split(' ');
              setHeight(heightValue);
              setHeightUnit(heightUnitValue);
              setLocation(data.location);
              setFurColor(data.furColor);
              setBehaviors(data.behaviors);
              setAbout(data.about);
              setPhoto(data.photo);
            }
          }
        }
      }
    };

    fetchDogData();
  }, []);

  const handleAddBehavior = () => {
    if (behavior.trim() !== '' && behaviors.length < 5) {
      setBehaviors([...behaviors, behavior.trim()]);
      setBehavior('');
    }
  };

  const handleRemoveBehavior = (index) => {
    const newBehaviors = behaviors.filter((_, i) => i !== index);
    setBehaviors(newBehaviors);
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const aboutWords = about.trim().split(/\s+/);
    if (aboutWords.length > 50) {
      setError('About section cannot exceed 50 words.');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const dogID = userDocSnap.exists() ? userDocSnap.data().dogID : null;

    if (!dogID) {
      setError('Dog ID not found');
      return;
    }

    const dogDocRef = doc(db, 'users', user.uid, 'dogs', dogID);

    try {
      await updateDoc(dogDocRef, {
        name: dogName,
        age: age,
        gender: gender,
        breed: breed,
        weight: `${weight} ${weightUnit}`,
        height: `${height} ${heightUnit}`,
        location: location,
        furColor: furColor,
        behaviors: behaviors,
        about: about,
        photo: photo ? photo : ''
      });

      Alert.alert('Profile Updated', 'Your dog\'s profile has been updated successfully.');
      navigation.goBack();
    } catch (error) {
      setError(error.message);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Your Dog's Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Dog’s Name"
        value={dogName}
        onChangeText={setDogName}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        placeholderTextColor="#666"
      />
      <View style={styles.row}>
        <Text style={styles.label}>Gender:</Text>
        <Dropdown
          style={[styles.dropdown, { flex: 1 }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={genderData}
          search={false}
          labelField="label"
          valueField="value"
          placeholder="Select Gender"
          value={gender}
          onChange={item => setGender(item.value)}
          renderLeftIcon={() => (
            <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
          )}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Breed"
        value={breed}
        onChangeText={setBreed}
        placeholderTextColor="#666"
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
        <Dropdown
          style={[styles.dropdown, styles.inputHalf]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={weightUnitData}
          search={false}
          labelField="label"
          valueField="value"
          placeholder="Unit"
          value={weightUnit}
          onChange={item => setWeightUnit(item.value)}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Height"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
        <Dropdown
          style={[styles.dropdown, styles.inputHalf]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={heightUnitData}
          search={false}
          labelField="label"
          valueField="value"
          placeholder="Unit"
          value={heightUnit}
          onChange={item => setHeightUnit(item.value)}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Fur Color"
        value={furColor}
        onChangeText={setFurColor}
        placeholderTextColor="#666"
      />
      <View style={styles.behaviorContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Behavior"
          value={behavior}
          onChangeText={setBehavior}
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={handleAddBehavior} style={styles.addButton}>
          <AntDesign name="plus" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.behaviorListContainer}>
        {behaviors.map((item, index) => (
          <View key={index} style={styles.behaviorItem}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveBehavior(index)} style={styles.removeButton}>
              <AntDesign name="close" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="About (max 50 words)"
        value={about}
        onChangeText={setAbout}
        placeholderTextColor="#666"
        multiline
      />
      <View style={styles.buttonContainer}>
        <Button title="Upload Photo" onPress={pickImage} />
      </View>
      {photo && <Image source={{ uri: photo }} style={styles.photo} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Save Profile" onPress={handleSaveProfile} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
    marginRight: 8,
  },
  dropdown: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  photo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginVertical: 12,
  },
  behaviorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 8,
    marginLeft: 10,
  },
  behaviorListContainer: {
    maxHeight: 120, // Limit the height to 3 rows (approx 40px per row)
    width: '100%',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  behaviorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  removeButton: {
    marginLeft: 10,
  },
});

export default EditProfileScreen;
