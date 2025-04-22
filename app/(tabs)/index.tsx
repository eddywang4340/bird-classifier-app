import '../utils/tf-register';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as tf from '@tensorflow/tfjs';
import CustomCameraView from '../components/CameraView';
import BirdPrediction from '../components/BirdPrediction';
import { 
  initializeTf, 
  loadModel, 
  preprocessImage, 
  classifyImage, 
  BirdPredictionResult 
} from '../utils/tensorflowHelper';

export default function HomeScreen() {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<BirdPredictionResult | null>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);

  // Initialize TensorFlow.js and load the model
  useEffect(() => {
    const setupTensorFlow = async () => {
      try {
        // Load the model
        const loadedModel = await loadModel();
        modelRef.current = loadedModel;
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error setting up TensorFlow:', error);
        setModelLoadError('Failed to load bird classification model. Please check your internet connection.');
        setIsModelLoading(false);
      }
    };

    setupTensorFlow();
    
    return () => {
      if (modelRef.current) {
        try {
          modelRef.current.dispose();
        } catch (e) {
          console.error('Error disposing model:', e);
        }
      }
    };
  }, []);

  // Handle image capture from camera
  const handleCapture = async (uri: string) => {
    setImageUri(uri);
    setPredictionResult({ topResult: 'Analyzing...', allResults: [] });
    
    try {
      if (!modelRef.current) {
        throw new Error('Model not loaded');
      }
      
      // Preprocess the image
      const processedImageTensor = await preprocessImage(uri);
      
      // Run classification
      const result = await classifyImage(modelRef.current, processedImageTensor);
      setPredictionResult(result);
    } catch (error) {
      console.error('Error during image analysis:', error);
      setPredictionResult({ 
        topResult: 'Analysis failed', 
        allResults: [] 
      });
    }
  };

  // Reset to camera view
  const handleReset = () => {
    setImageUri(null);
    setPredictionResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bird Identifier</Text>
      </View>

      {isModelLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading bird recognition model...</Text>
        </View>
      ) : modelLoadError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{modelLoadError}</Text>
        </View>
      ) : imageUri ? (
        <BirdPrediction 
          imageUri={imageUri} 
          predictionResult={predictionResult} 
          onReset={handleReset} 
        />
      ) : (
        <View style={styles.cameraContainer}>
          <Text style={styles.instructionText}>
            Take a photo of a bird to identify it
          </Text>
          <CustomCameraView onCapture={handleCapture} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    padding: 16,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#555',
  },
});