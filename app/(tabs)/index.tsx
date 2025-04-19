import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import CameraView from '../components/CameraView';
import BirdPrediction from '../components/BirdPrediction';
import { loadModel, preprocessImage, classifyImage } from '../utils/tensorflowHelper';

// Define types for our state
type PredictionResult = {
  topResult: string;
  allResults: {
    species: string;
    probability: number;
  }[];
} | null;

export default function CameraScreen() {
  // Update state definitions with proper types
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);

  // Load model on component mount
  useEffect(() => {
    async function initializeModel() {
      try {
        const loadedModel = await loadModel();
        setModel(loadedModel);
      } catch (error) {
        console.error('Failed to load model:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeModel();
  }, []);

  // Handle image capture with type for uri
  const handleCapture = async (uri: string) => {
    setImageUri(uri);
    setIsClassifying(true);
    
    try {
      if (!model) {
        throw new Error('Model not loaded');
      }
      
      const processedImage = await preprocessImage(uri);
      const results = await classifyImage(model, processedImage);
      setPredictionResult(results);
    } catch (error) {
      console.error('Error during image classification:', error);
      setPredictionResult({
        topResult: 'Classification failed',
        allResults: []
      });
    } finally {
      setIsClassifying(false);
    }
  };

  // Reset to camera view
  const handleReset = () => {
    setImageUri(null);
    setPredictionResult(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading bird classifier...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {!imageUri ? (
          <CameraView onCapture={handleCapture} />
        ) : (
          <>
            {isClassifying ? (
              <View style={styles.classifyingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.classifyingText}>Identifying bird...</Text>
              </View>
            ) : (
              <BirdPrediction 
                imageUri={imageUri} 
                predictionResult={predictionResult} 
                onReset={handleReset} 
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  classifyingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classifyingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
});
