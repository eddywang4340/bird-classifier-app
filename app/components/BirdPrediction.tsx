import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BirdPredictionResult } from '../utils/tensorflowHelper';

// Define props interface
interface BirdPredictionProps {
  imageUri: string;
  predictionResult: BirdPredictionResult | null;
  onReset: () => void;
}

const BirdPrediction: React.FC<BirdPredictionProps> = ({ imageUri, predictionResult, onReset }) => {
  if (!imageUri) return null;

  const { topResult, allResults } = predictionResult || { topResult: 'Analyzing...', allResults: [] };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Identified Bird</Text>
        <Text style={styles.resultText}>{topResult}</Text>
        
        {allResults.length > 0 && (
          <View style={styles.allResultsContainer}>
            <Text style={styles.allResultsTitle}>All Results</Text>
            <ScrollView style={styles.scrollView}>
              {allResults.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultItemText}>{result.species}</Text>
                  <Text style={styles.resultItemPercentage}>
                    {(result.probability * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <MaterialIcons name="refresh" size={24} color="white" />
        <Text style={styles.resetButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  allResultsContainer: {
    marginTop: 10,
  },
  allResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  scrollView: {
    maxHeight: 150,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultItemText: {
    fontSize: 16,
    color: '#555',
  },
  resultItemPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default BirdPrediction;
