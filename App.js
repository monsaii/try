import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NetworkMonitor from './components/NetworkMonitor';
import HistoricalDataScreen from './components/HistoricalDataScreen';
import ViewCsv from './components/ViewCsv';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NetworkMonitor" component={NetworkMonitor} />
        <Stack.Screen name="HistoricalData" component={HistoricalDataScreen} />
        <Stack.Screen name="ViewCsv" component={ViewCsv} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
