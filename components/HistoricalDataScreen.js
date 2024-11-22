import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoricalDataScreen = ({ navigation }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [fileContentModalVisible, setFileContentModalVisible] = useState(false);

  useEffect(() => {
    const loadHistoricalData = async () => {
      const storedData = await AsyncStorage.getItem('historicalData');
      if (storedData) {
        setHistoricalData(JSON.parse(storedData));
      }

      const storedFiles = await AsyncStorage.getItem('csvFiles');
      if (storedFiles) {
        setFileList(JSON.parse(storedFiles));
      }
    };

    loadHistoricalData();
  }, []);

  const viewFileContent = async (fileName) => {
    try {
      const content = await AsyncStorage.getItem(fileName);
      if (content) {
        setSelectedFileContent(content);
        setFileModalVisible(false); // Close file list modal
        setFileContentModalVisible(true); // Open file content modal
      } else {
        Alert.alert('Error', 'File content could not be found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load file content.');
      console.error(error);
    }
  };

  const deleteFile = async (fileName) => {
    Alert.alert('Confirm', `Are you sure you want to delete ${fileName}?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            // Remove the file content from AsyncStorage
            await AsyncStorage.removeItem(fileName);

            // Update the file list
            const updatedFileList = fileList.filter((file) => file !== fileName);
            setFileList(updatedFileList);
            await AsyncStorage.setItem('csvFiles', JSON.stringify(updatedFileList));

            Alert.alert('Success', `${fileName} has been deleted.`);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete the file.');
            console.error(error);
          }
        },
      },
    ]);
  };

  const saveCsv = async () => {
    if (historicalData.length === 0) {
      Alert.alert('No Data', 'There is no data to save.');
      return;
    }

    const headers = 'Timestamp,Speed (Mbps),Latency (ms),Packet Loss (%)\n';
    const rows = historicalData
      .map(
        (item) =>
          `${item.timestamp},${item.speed},${item.latency},${item.packetLoss}`
      )
      .join('\n');
    const csvContent = headers + rows;

    const timestamp = new Date().toISOString();
    const fileName = `network_data_${timestamp}.csv`;

    try {
      await AsyncStorage.setItem(fileName, csvContent);

      const updatedFileList = [...fileList, fileName];
      setFileList(updatedFileList);
      await AsyncStorage.setItem('csvFiles', JSON.stringify(updatedFileList));

      Alert.alert('Success', `Data saved to ${fileName}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save CSV data.');
    }
  };

  const clearData = async () => {
    Alert.alert('Confirm', 'Are you sure you want to clear all data?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear',
        onPress: async () => {
          await AsyncStorage.removeItem('historicalData');
          setHistoricalData([]);
          Alert.alert('Success', 'All historical data cleared.');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historical Network Data</Text>

      <FlatList
        data={historicalData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>Time: {item.timestamp}</Text>
            <Text>Speed: {item.speed} Mbps</Text>
            <Text>Latency: {item.latency} ms</Text>
            <Text>Packet Loss: {item.packetLoss} %</Text>
          </View>
        )}
      />

      {/* Save CSV Button */}
      <TouchableOpacity style={styles.button} onPress={saveCsv}>
        <Text style={styles.buttonText}>Save CSV</Text>
      </TouchableOpacity>

      {/* View Saved Files Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setFileModalVisible(true)} // Open file list modal
      >
        <Text style={styles.buttonText}>View Saved Files</Text>
      </TouchableOpacity>

      {/* Clear Data Button */}
      <TouchableOpacity style={styles.clearButton} onPress={clearData}>
        <Text style={styles.buttonText}>Clear Data</Text>
      </TouchableOpacity>

      {/* Back to Home Button */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('NetworkMonitor')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>

      {/* Modal to Display File List */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={fileModalVisible}
        onRequestClose={() => setFileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setFileModalVisible(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Saved Files</Text>
          <FlatList
            data={fileList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.fileRow}>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => viewFileContent(item)}
                >
                  <Text style={styles.fileButtonText}>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteFile(item)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Modal to Display File Content */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={fileContentModalVisible}
        onRequestClose={() => {
          setFileContentModalVisible(false);
          setFileModalVisible(true); // Reopen the file list modal
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setFileContentModalVisible(false);
              setFileModalVisible(true); // Reopen the file list modal
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>File Content</Text>
          <ScrollView>
            <Text style={styles.csvText}>{selectedFileContent}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
  row: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 8, // Reduced padding for compact design
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8, // Reduced margin for compact layout
    alignItems: 'center',
    alignSelf: 'center', // Centers the button
    minWidth: '60%', // Sets a minimum width
  },
  clearButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: '60%',
  },
  secondaryButton: {
    backgroundColor: '#ffa500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: '60%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14, // Reduced font size for compact buttons
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 4, // Reduced padding for compact design
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12, // Smaller font size for delete button
    fontWeight: 'bold',
  },
  fileButton: {
    flex: 1,
    padding: 8,
  },
  fileButtonText: {
    fontSize: 14, // Smaller font for compact list
    color: '#1e90ff',
  },
  csvText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  backButton: {
    marginBottom: 10,
    padding: 6, // Compact padding for back button
    backgroundColor: '#ddd',
    borderRadius: 4,
    width: 80, // Compact width
  },
  backButtonText: {
    fontSize: 14, // Smaller font size
    textAlign: 'center',
    color: '#333',
  },
});

export default HistoricalDataScreen;
