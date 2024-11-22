import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RealTimeGraph from './RealTimeGraph';

const NetworkMonitor = ({ navigation }) => {
  const [speedData, setSpeedData] = useState({
    labels: Array(10).fill(''),
    values: Array(10).fill(0),
  });
  const [latencyData, setLatencyData] = useState({
    labels: Array(10).fill(''),
    values: Array(10).fill(0),
  });
  const [packetLossData, setPacketLossData] = useState({
    labels: Array(10).fill(''),
    values: Array(10).fill(0),
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const startCapturing = () => {
    if (!isCapturing) {
      setIsCapturing(true);
      const id = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();

        const speed = parseFloat((Math.random() * 100).toFixed(2));
        const latency = parseFloat((Math.random() * 300).toFixed(2));
        const packetLoss = parseFloat((Math.random() * 10).toFixed(2));

        setSpeedData((prev) => ({
          labels: [...prev.labels.slice(-9), timestamp],
          values: [...prev.values.slice(-9), speed],
        }));
        setLatencyData((prev) => ({
          labels: [...prev.labels.slice(-9), timestamp],
          values: [...prev.values.slice(-9), latency],
        }));
        setPacketLossData((prev) => ({
          labels: [...prev.labels.slice(-9), timestamp],
          values: [...prev.values.slice(-9), packetLoss],
        }));
      }, 1000);

      setIntervalId(id);
    }
  };

  const stopCapturing = async () => {
    if (isCapturing) {
      setIsCapturing(false);
      clearInterval(intervalId);
      setIntervalId(null);

      try {
        const existingData = await AsyncStorage.getItem('historicalData');
        const historicalData = existingData ? JSON.parse(existingData) : [];

        const updatedData = [
          ...historicalData,
          ...speedData.labels.map((label, index) => ({
            timestamp: label,
            speed: speedData.values[index],
            latency: latencyData.values[index],
            packetLoss: packetLossData.values[index],
          })),
        ];

        await AsyncStorage.setItem('historicalData', JSON.stringify(updatedData));
        Alert.alert('Data Saved', 'Captured data has been saved.');
      } catch (error) {
        Alert.alert('Error', 'Failed to save captured data.');
        console.error(error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Monitor (Real-Time Data)</Text>

      <RealTimeGraph data={speedData} title="Wi-Fi Speed (Mbps)" />
      <RealTimeGraph data={latencyData} title="Latency (ms)" yAxisSuffix=" ms" />
      <RealTimeGraph data={packetLossData} title="Packet Loss (%)" yAxisSuffix=" %" />

      <TouchableOpacity
        style={[styles.button, isCapturing ? styles.stopButton : styles.startButton]}
        onPress={isCapturing ? stopCapturing : startCapturing}
      >
        <Text style={styles.buttonText}>
          {isCapturing ? 'Stop Capturing' : 'Start Capturing'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('HistoricalData')}
      >
        <Text style={styles.buttonText}>Go to Historical Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#28a745',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
});

export default NetworkMonitor;
