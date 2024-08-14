import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../functions/firebaseConfig'; // Adjust the path based on your project structure
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleSendOtp = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', email));
      if (userDoc.exists()) {
        const generatedOtp = uuidv4().slice(0, 6); // Generate a 6-character OTP
        setGeneratedOtp(generatedOtp);
        // Here you should implement your own OTP sending logic
        // Since we are using sendPasswordResetEmail, it sends a password reset email, not OTP.
        await sendPasswordResetEmail(auth, email); // This will send a password reset email
        setOtpSent(true);
        Alert.alert('OTP Sent', 'An OTP has been sent to your email.');
      } else {
        Alert.alert('Email Not Found', 'No account found with this email.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp === generatedOtp) {
      try {
        const userDoc = await getDoc(doc(db, 'users', email));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (!userData.avatarCreated) {
            navigation.navigate('CreateAvatar');
          } else {
            const dogID = userData.dogID; // Use dogID instead of dogName
            if (dogID) {
              const dogDocRef = doc(db, 'users', userDoc.id, 'dogs', dogID);
              const dogDoc = await getDoc(dogDocRef);
              if (dogDoc.exists()) {
                const dogData = dogDoc.data();
                navigation.navigate('Home', { ...dogData });
              } else {
                Alert.alert('Dog Data Not Found', 'No dog data found, please create a profile.');
                navigation.navigate('CreateAvatar');
              }
            } else {
              Alert.alert('Dog Data Not Found', 'No dog data found, please create a profile.');
              navigation.navigate('CreateAvatar');
            }
          }
        } else {
          Alert.alert('User Data Not Found', 'No user data found, please contact support.');
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
    }
  };

  return (
    <View style={styles.container}>
      {!otpSent ? (
        <>
          <Text style={styles.header}>Forgot Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#666"
          />
          <Button title="Send OTP" onPress={handleSendOtp} />
        </>
      ) : (
        <>
          <Text style={styles.header}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="OTP"
            value={otp}
            onChangeText={setOtp}
            autoCapitalize="none"
            placeholderTextColor="#666"
          />
          <Button title="Reset Password" onPress={handleVerifyOtp} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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
  },
});
