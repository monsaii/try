import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CaptureContext = createContext();

export const CaptureProvider = ({ children }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const fetchNetworkData = async () => {
    const timestamp = new Date().toLocaleTimeString();
    const speed = parseFloat((Math.random() * 100).toFixed(2));
    const latency = parseFloat((Math.random() * 300).toFixed(2));
    const packetLoss = parseFloat((Math.random() * 10).toFixed(2));

    const newData = { timestamp, speed, latency, packetLoss };

    // Update AsyncStorage for historical data
    const storedData = await AsyncStorage.getItem('historicalData');
    const historicalData = storedData ? JSON.parse(storedData) : [];
    const updatedData = [newData, ...historicalData.slice(0, 99)];
    await AsyncStorage.setItem('historicalData', JSON.stringify(updatedData));
  };

  const startCapture = () => {
    if (!isCapturing) {
      setIsCapturing(true);
      const id = setInterval(fetchNetworkData, 1000);
      setIntervalId(id);
    }
  };

  const stopCapture = () => {
    if (isCapturing) {
      setIsCapturing(false);
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <CaptureContext.Provider value={{ isCapturing, startCapture, stopCapture }}>
      {children}
    </CaptureContext.Provider>
  );
};
