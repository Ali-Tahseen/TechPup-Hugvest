import React, { useState, useEffect } from 'react';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { db, auth } from '../functions/firebaseConfig';
import { doc, getDoc, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import axios from 'axios';
import CustomMarker from './CustomMarker';

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDogs, setNearbyDogs] = useState([]);

  useEffect(() => {
    const fetchUserLocation = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.dogID) {
            const dogDocRef = doc(db, 'users', user.uid, 'dogs', userData.dogID);
            const dogDocSnap = await getDoc(dogDocRef);
            if (dogDocSnap.exists()) {
              const location = dogDocSnap.data().location;
              const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: { q: location, format: 'json' },
              });
              if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                setUserLocation({
                  latitude: parseFloat(lat),
                  longitude: parseFloat(lon),
                  photo: dogDocSnap.data().photo,
                });
              } else {
                console.warn('No results found for the user location');
              }
            }
          }
        }
      }
    };

    const fetchNearbyDogs = async () => {
      try {
        const q = query(collectionGroup(db, 'dogs'), where('location', '!=', ''));
        const querySnapshot = await getDocs(q);
        const dogs = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const dogData = doc.data();
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
              params: { q: dogData.location, format: 'json' },
            });
            if (response.data && response.data.length > 0) {
              const { lat, lon } = response.data[0];
              return {
                id: doc.id,
                ...dogData,
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                photo: dogData.photo,
              };
            }
          })
        );
        setNearbyDogs(dogs.filter((dog) => dog));
      } catch (error) {
        console.error('Error fetching nearby dogs:', error);
      }
    };

    fetchUserLocation();
    fetchNearbyDogs();
  }, []);

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <UrlTile urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
      <Marker
        coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
        title="My Location"
      >
        <CustomMarker photo={userLocation.photo} isUser={true} />
      </Marker>
      {nearbyDogs.map((dog, index) => (
        <Marker
          key={index}
          coordinate={{ latitude: dog.latitude, longitude: dog.longitude }}
          title={dog.name}
        >
          <CustomMarker photo={dog.photo} />
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapScreen;
