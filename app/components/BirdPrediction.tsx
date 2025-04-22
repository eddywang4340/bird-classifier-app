import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { BirdPredictionResult } from '../utils/tensorflowHelper';

type BirdPredictionProps = {
  imageUri: string;
  predictionResult: BirdPredictionResult | null;
  onReset: () => void;
};

const BirdPrediction: React.FC<BirdPredictionProps> = ({ 
  imageUri, 
  predictionResult, 
  onReset 
}) => {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
      
      <View style={styles.resultsContainer}>
        {predictionResult ? (
          <>
            <Text style={styles.resultTitle}>Identified Bird:</Text>
            <Text style={styles.topResult}>{predictionResult.topResult}</Text>
            
            {predictionResult.allResults.length > 0 && (
              <>
                <Text style={styles.otherResultsTitle}>Other Possibilities:</Text>
                {predictionResult.allResults.map((result, index) => (
                  <View key={index} style={styles.resultItem}>
                    <Text style={styles.resultName}>{result.species}</Text>
                    <Text style={styles.resultProbability}>
                      {(result.probability * 100).toFixed(2)}%
                    </Text>
                  </View>
                ))}
              </>
            )}
          </>
        ) : (
          <Text style={styles.loadingText}>Analyzing image...</Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={onReset}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
      
      {/* Add extra padding at the bottom to ensure scrollability */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding at the bottom
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  resultsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  topResult: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  otherResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultName: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  resultProbability: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 50, // Extra space at the bottom
  }
});

export default BirdPrediction;