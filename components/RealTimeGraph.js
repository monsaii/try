import React from 'react';
import { Dimensions, View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const RealTimeGraph = ({ data, title, yAxisSuffix = " Mbps" }) => {
  const screenWidth = Dimensions.get('window').width;

  const validData = data.values.map((value) =>
    isNaN(value) || !isFinite(value) ? 0 : value
  );

  const labelsToShow = data.labels.map((label, index) =>
    index % 2 === 0 ? label : '' // Show every other label
  );

  return (
    <View style={{ marginVertical: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{title}</Text>
      <LineChart
        data={{
          labels: labelsToShow.slice(0, validData.length),
          datasets: [{ data: validData }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix={yAxisSuffix}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default RealTimeGraph;
