import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../functions/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

// Calculate dynamic spacing based on screen height
const dynamicSpacing = height * 0.02;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert('Email not verified', 'Please verify your email before logging in.');
        return;
      }

      // Check if user data exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.avatarCreated) {
          navigation.navigate('CreateAvatar');
        } else {
          const dogID = userData.dogID; // Use dogID instead of dogName
          if (dogID) {
            const dogDocRef = doc(db, 'users', user.uid, 'dogs', dogID);
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
      Alert.alert('Login Error', error.message);
    }
  };

  const handleGoogleLogin = () => {
    // Your Google login logic here
  };

  const handleFacebookLogin = () => {
    // Your Facebook login logic here
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPasswordScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TechPup HugVest</Text>
      <Text style={styles.subtitle}>Sign In</Text>
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Feature Coming Soon', 'Google Login is coming soon!')}>
          <AntDesign name="google" size={24} color="black" />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Feature Coming Soon', 'Facebook Login is coming soon!')}>
          <FontAwesome name="facebook" size={24} color="black" />
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Username / E-mail Address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        placeholderTextColor="#666"
      />
      <View style={styles.optionsContainer}>
        <View style={styles.rememberMeContainer}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => {
                setRememberMe(!rememberMe);
              }}
              color="#333"
              uncheckedColor="#333"
            />
          </View>
          <Text style={styles.optionText}>Remember Me</Text>
        </View>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.optionText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          Don’t have an account? <Text style={styles.signUpLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
      <Text style={styles.versionText}>Version 0.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: dynamicSpacing,
    color: '#333',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00BFFF',
    marginBottom: dynamicSpacing,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
    marginBottom: dynamicSpacing,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  socialButtonText: {
    marginLeft: 8,
    color: 'black',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.8,
    marginVertical: dynamicSpacing,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
  },
  input: {
    width: width * 0.8,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: dynamicSpacing,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E0F7FA',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
    marginBottom: dynamicSpacing,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  optionText: {
    color: '#666',
  },
  signInButton: {
    backgroundColor: '#00BFFF',
    width: width * 0.8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: dynamicSpacing,
  },
  signInButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signUpText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: dynamicSpacing,
  },
  signUpLink: {
    color: '#00BFFF',
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#666',
    marginTop: dynamicSpacing,
  },
});
