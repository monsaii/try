import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewCsv = () => {
  const [csvContent, setCsvContent] = useState('');

  useEffect(() => {
    const loadCsvContent = async () => {
      try {
        const csv = await AsyncStorage.getItem('csvContent');
        if (csv) {
          setCsvContent(csv);
        } else {
          Alert.alert('No CSV Found', 'Please save CSV data first.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load CSV data.');
      }
    };
    loadCsvContent();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>CSV Content</Text>
      <Text style={styles.csvText}>{csvContent}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  csvText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});

export default ViewCsv;
