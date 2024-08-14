import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Animated, Easing, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../functions/firebaseConfig';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-svg-charts';
import { G, Text as SvgText } from 'react-native-svg';
import { EmotionContext } from '../contexts/EmotionContext';

const { width, height } = Dimensions.get('window');

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
          return dogDocSnap.data();
        }
      }
    }
  }
  return {};
};

const HeartRateScreen = () => {
  const { heartRate, emotionData } = useContext(EmotionContext);
  const [dogData, setDogData] = useState({});
  const navigation = useNavigation();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const getDogData = async () => {
      const data = await fetchDogData();
      setDogData(data);
    };
    getDogData();
  }, []);

  useEffect(() => {
    const animateHeart = () => {
      const duration = (60 / heartRate) * 1000;
      const animation = Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(animation).start();
    };

    animateHeart();
  }, [heartRate]);

  useEffect(() => {
    const animateECG = () => {
      const duration = (60 / heartRate) * 1000;
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    animateECG();
  }, [heartRate]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, 0],
  });

  const Labels = ({ slices }) => {
    return slices.map((slice, index) => {
      const { labelCentroid, data } = slice;
      const labelAngle = Math.atan2(labelCentroid[1], labelCentroid[0]) + Math.PI / 2;
      return (
        <G key={index}>
          <SvgText
            transform={
              `translate(${labelCentroid[0]}, ${labelCentroid[1]})` +
              `rotate(${(360 * labelAngle) / (2 * Math.PI)})`
            }
            fill={'#000000'}
            textAnchor={'middle'}
            alignmentBaseline={'center'}
            fontSize={14}
            stroke={'black'}
            strokeWidth={0.2}
          >
            {data.key} {data.value}%
          </SvgText>
        </G>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.header}>Health Overview</Text>
          <Text style={styles.date}>{date.toDateString()}</Text>
        </View>
        <View style={styles.heartContainer}>
          <Animated.View style={[styles.heart, { transform: [{ scale: scaleValue }] }]}>
            <Ionicons name="heart" size={width * 0.4} color="red" />
            <Text style={styles.heartRate}>{heartRate} BPM</Text>
          </Animated.View>
        </View>
        <View style={styles.wavesContainer}>
          <Animated.View style={[styles.ecgLineContainer, { transform: [{ translateX }] }]}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Image
                key={index}
                source={require('../../assets/icons/heart-rate.png')}
                style={styles.ecgLine}
                resizeMode="contain"
              />
            ))}
          </Animated.View>
        </View>
        <View style={styles.emotionContainer}>
          <FontAwesome5 name={emotionData.calm > emotionData.anxious ? "smile" : "meh"} size={width * 0.25} color="black" />
          <Text style={styles.emotionText}>{emotionData.calm > emotionData.anxious ? "Calm" : "Anxious"}</Text>
        </View>
        <View style={styles.pieChartContainer}>
          <PieChart
            style={styles.pieChart}
            data={[
              { key: 'Calm', value: emotionData.calm, svg: { fill: '#FFD700' } },
              { key: 'Anxious', value: emotionData.anxious, svg: { fill: '#8A2BE2' } },
            ]}
            padAngle={0}
            outerRadius={'90%'}
            innerRadius={'5%'}
            labelRadius={'100%'}
            valueAccessor={({ item }) => item.value}
          >
            <Labels />
          </PieChart>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  date: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginVertical: 10,
  },
  heartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  heart: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRate: {
    fontSize: 24,
    color: 'white',
    position: 'absolute',
    top: '40%',
  },
  wavesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    height: 40,
    overflow: 'hidden',
    width: '100%',
  },
  ecgLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecgLine: {
    width: width / 5,
    height: 40,
  },
  emotionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  emotionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    backgroundColor: '#FFD700',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  pieChartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  pieChart: {
    height: Math.min(height * 0.5, width * 0.9),
    width: Math.min(height * 0.5, width * 0.9),
  },
});

export default HeartRateScreen;
