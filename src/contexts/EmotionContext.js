import React, { createContext, useState, useEffect } from 'react';

export const EmotionContext = createContext();

const fetchBPM = async () => {
  try {
    const response = await fetch('http://techpup.xyz/get.php');
    
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    const value1 = data.value1 || 0;

    // Setting BPM based on the value1
    if (value1 < 4000) {
      return { bpm: Math.floor(Math.random() * (40 - 20 + 1)) + 20, value1 }; // BPM between 20 and 40
    } else {
      return { bpm: Math.floor(Math.random() * (100 - 60 + 1)) + 60, value1 }; // BPM between 60 and 100
    }
  } catch (error) {
    console.error('Error fetching BPM:', error.message || error);
    return { bpm: 50, value1: 0 }; // Fallback values
  }
};

const fetchEmotionData = async (value1) => {
  try {
    if (value1 < 4000) {
      const calm = Math.floor(Math.random() * (80 - 60 + 1)) + 60; // Calm between 60 and 80
      return { calm, anxious: 100 - calm };
    } else {
      return { calm: 30, anxious: 70 };
    }
  } catch (error) {
    return { calm: 30, anxious: 70 };
  }
};

export const EmotionProvider = ({ children }) => {
  const [emotionData, setEmotionData] = useState({ calm: 30, anxious: 70 });
  const [heartRate, setHeartRate] = useState(10);

  const fetchHeartRateAndEmotionData = async () => {
    const { bpm, value1 } = await fetchBPM();
    setHeartRate(bpm);
    const emotion = await fetchEmotionData(value1);
    setEmotionData(emotion);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchHeartRateAndEmotionData();
    }, 15000); // Fetch data every 8 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <EmotionContext.Provider value={{ emotionData, heartRate, fetchHeartRateAndEmotionData }}>
      {children}
    </EmotionContext.Provider>
  );
};
