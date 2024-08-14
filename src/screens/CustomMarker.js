import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const CustomMarker = ({ photo, isUser }) => {
  return (
    <View style={styles.markerContainer}>
      <Image source={require('../../assets/icons/location-icon.png')} style={styles.markerIcon} />
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo }} style={styles.image} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  imageContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'absolute',
    top: 10,
    left: 15,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  userMarker: {
    borderColor: 'blue',
  },
});

export default CustomMarker;
