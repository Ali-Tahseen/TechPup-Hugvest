import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { EmotionProvider } from './src/contexts/EmotionContext';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import CreateAvatarScreen from './src/screens/CreateAvatarScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HugSentScreen from './src/screens/HugSentScreen';
import InteractionScreen from './src/screens/InteractionScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import MapScreen from './src/screens/MapScreen';
import VoiceMessageSentScreen from './src/screens/VoiceMessageSentScreen';
import TrainVideos from './src/screens/TrainVideos';
import HomeScreen from './src/screens/HomeScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HeartRateScreen from './src/screens/HeartRateScreen';

const Stack = createStackNavigator();
const ModalStack = createStackNavigator();

function MainStackNavigator() {
  return (
    <EmotionProvider>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateAvatar" component={CreateAvatarScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Interaction" component={InteractionScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="TrainVideos" component={TrainVideos} options={{ headerShown: false }}/>
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HeartRateScreen" component={HeartRateScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </EmotionProvider>
  );
}

function App() {
  return (
    <NavigationContainer>
      <ModalStack.Navigator screenOptions={{ presentation: 'modal', headerShown: false }}>
        <ModalStack.Screen name="Main" component={MainStackNavigator} />
        <ModalStack.Screen name="HugSent" component={HugSentScreen} />
        <ModalStack.Screen name="VoiceMessageSent" component={VoiceMessageSentScreen} />
      </ModalStack.Navigator>
    </NavigationContainer>
  );
}

export default App;
