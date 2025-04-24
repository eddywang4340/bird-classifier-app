// import './tf-register';
// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';
// import * as FileSystem from 'expo-file-system';
// import * as ImageManipulator from 'expo-image-manipulator';
// import * as base64 from 'base64-js';
// import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
// import { decodeJpeg } from '@tensorflow/tfjs-react-native';

// // Type definitions
// export type BirdPredictionResult = {
//   topResult: string;
//   allResults: {
//     species: string;
//     probability: number;
//   }[];
// };

// // Initialize TensorFlow
// export const initializeTf = async (): Promise<void> => {
//   try {
//     await tf.ready();
//     console.log('TensorFlow.js is ready');
//   } catch (error) {
//     console.error('Failed to initialize TensorFlow', error);
//     throw error;
//   }
// };

// // Load model from local assets using bundleResourceIO
// export const loadModel = async (): Promise<tf.GraphModel> => {
//   try {
//     await initializeTf();
    
//     console.log('Loading bird classifier model from local assets using bundleResourceIO...');
    
//     // Load the model JSON from assets
//     const modelJSON = require('../assets/model/model.json');
    
//     // Load the weight files
//     const modelWeights = [
//       require('../assets/model/group1-shard1of4.bin'),
//       require('../assets/model/group1-shard2of4.bin'),
//       require('../assets/model/group1-shard3of4.bin'),
//       require('../assets/model/group1-shard4of4.bin')
//     ];
    
//     // Use bundleResourceIO to load the model directly from the bundle resources
//     const model = await tf.loadGraphModel(
//       bundleResourceIO(modelJSON, modelWeights)
//     );
    
//     console.log('Bird classifier model loaded successfully');
//     return model;
//   } catch (error) {
//     console.error('Failed to load local model:', error);
//     console.log('Falling back to MobileNet model...');
    
//     try {
//       // Fallback to MobileNet as a reliable alternative
//       const model = await tf.loadGraphModel(
//         'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json'
//       );
//       console.log('MobileNet model loaded successfully as fallback');
//       return model;
//     } catch (fallbackError) {
//       console.error('All model loading attempts failed:', fallbackError);
//       throw new Error('Could not load any image classification model');
//     }
//   }
// };

// // Process image for TensorFlow.js using a more compatible approach
// export const preprocessImage = async (uri: string): Promise<tf.Tensor> => {
//   try {
//     console.log('Preprocessing image with normalized [0,1] range...');
    
//     // First resize to 224x224 with base64 output
//     const resizedImg = await ImageManipulator.manipulateAsync(
//       uri,
//       [{ resize: { width: 224, height: 224 } }],
//       { format: ImageManipulator.SaveFormat.JPEG, base64: true }
//     );
    
//     if (!resizedImg.base64) {
//       throw new Error('Failed to get base64 data from resized image');
//     }
    
//     // Convert base64 to Uint8Array
//     const imgBuffer = base64.toByteArray(resizedImg.base64);
    
//     // Use decodeJpeg to convert JPEG buffer to tensor
//     const decodedImage = decodeJpeg(imgBuffer);
    
//     // Normalize pixel values to [0, 1] instead of [-1, 1]
//     // This matches the reference code's normalization approach
//     const normalized = decodedImage.toFloat().div(tf.scalar(255.0));
    
//     // Add batch dimension [1, 224, 224, 3]
//     const batched = normalized.expandDims(0);
    
//     // Clean up intermediates
//     decodedImage.dispose();
//     normalized.dispose();
    
//     console.log('Image preprocessed successfully with shape:', batched.shape);
//     return batched;
//   } catch (error) {
//     console.error('Error preprocessing image:', error);
    
//     // Fallback to manual processing if decodeJpeg fails
//     try {
//       console.log('Trying manual tensor creation with [0,1] normalization...');
      
//       // Get image as base64
//       const resizedImg = await ImageManipulator.manipulateAsync(
//         uri,
//         [{ resize: { width: 224, height: 224 } }],
//         { format: ImageManipulator.SaveFormat.JPEG, base64: true }
//       );
      
//       if (!resizedImg.base64) {
//         throw new Error('Failed to get base64 data');
//       }
      
//       // Convert base64 to bytes
//       const imgBuffer = base64.toByteArray(resizedImg.base64);
      
//       // Manual RGB extraction - using a fixed tensor size
//       const numChannels = 3; // RGB
//       const pixels = new Float32Array(224 * 224 * numChannels);
      
//       // Fill the array with zeros first
//       pixels.fill(0);
      
//       // Copy as many pixels as we can from the image buffer
//       // This isn't 100% correct but should prevent size mismatch errors
//       // Now normalized to [0,1] range by dividing by 255
//       const limit = Math.min(imgBuffer.length, pixels.length);
//       for (let i = 0; i < limit; i++) {
//         pixels[i] = imgBuffer[i] / 255.0;
//       }
      
//       // Create tensor with correct shape
//       const tensor = tf.tensor3d(pixels, [224, 224, 3], 'float32');
      
//       // Add batch dimension
//       const batched = tensor.expandDims(0);
      
//       // Clean up
//       tensor.dispose();
      
//       console.log('Manual preprocessing successful with shape:', batched.shape);
//       return batched;
//     } catch (secondError) {
//       console.error('All preprocessing methods failed:', secondError);
//       throw new Error('Failed to preprocess image after multiple attempts');
//     }
//   }
// };

// // Prediction function
// export const classifyImage = async (
//   model: tf.GraphModel, 
//   imageTensor: tf.Tensor
// ): Promise<BirdPredictionResult> => {
//   try {
//     console.log('Running model prediction...');
//     console.log('Input tensor shape:', imageTensor.shape);
    
//     // Run inference
//     const predictions = model.predict(imageTensor) as tf.Tensor;
//     console.log('Output predictions shape:', predictions.shape);
    
//     // Get the probabilities as an array
//     const probabilities = await predictions.data();
//     console.log('Got probabilities, first few values:', 
//       Array.from(probabilities.slice(0, 5))
//           .map((p, i) => `[${i}]: ${p.toFixed(6)}`).join(', '));
    
//     try {
//       // Try to fetch the bird labels
//       console.log('Fetching bird label mapping...');
//       const response = await fetch('x');
//       const labelsText = await response.text();
      
//       // Parse the CSV to get bird names
//       const birdLabels = labelsText.split('\n')
//         .filter(line => line.trim() !== '')
//         .map(line => {
//           const parts = line.split(',');
//           return parts.length > 1 ? parts[1] : `Bird ${line}`;
//         });
      
//       console.log(`Loaded ${birdLabels.length} bird labels`);
      
//       // Format and sort results
//       let results = Array.from(probabilities).map((probability, index) => ({
//         species: index < birdLabels.length ? birdLabels[index] : `Bird ${index}`,
//         probability: probability
//       }))
//       .filter(item => item.probability > 0.001) // Lower threshold to see more results
//       .sort((a, b) => b.probability - a.probability);
      
//       // Log all results with decent probability
//       results.slice(0, 10).forEach((result, idx) => {
//         console.log(`Result #${idx + 1}: ${result.species} (${(result.probability * 100).toFixed(2)}%)`);
//       });
      
//       // Cleanup tensors to prevent memory leaks
//       tf.dispose([imageTensor, predictions]);
      
//       return {
//         topResult: results.length > 0 ? results[0].species : 'Unknown Bird',
//         allResults: results.slice(0, 10) // Return top 10 results
//       };
//     } catch (labelError) {
//       // If we can't fetch bird labels, use generic labels
//       console.warn('Could not fetch bird labels, using generic labels:', labelError);
      
//       // Format results with generic labels
//       const results = Array.from(probabilities).map((probability, index) => ({
//         species: `Class ${index}`,
//         probability: probability
//       }))
//       .filter(item => item.probability > 0.01)
//       .sort((a, b) => b.probability - a.probability);
      
//       // Cleanup tensors
//       tf.dispose([imageTensor, predictions]);
      
//       return {
//         topResult: results.length > 0 ? results[0].species : 'Unknown Object',
//         allResults: results.slice(0, 10)
//       };
//     }
//   } catch (error) {
//     // Handle errors during classification
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//     console.error('Error during classification:', errorMessage);
//     tf.dispose([imageTensor]);
    
//     return {
//       topResult: 'Classification Error',
//       allResults: [{
//         species: 'Error: ' + errorMessage,
//         probability: 1
//       }]
//     };
//   }
// };

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as base64 from 'base64-js';

// Type definitions (keeping the same as your original)
export type BirdPredictionResult = {
  topResult: string;
  allResults: {
    species: string;
    probability: number;
  }[];
};

// Configuration for the API endpoint
// Try one of these URLs depending on your setup:
const LOCAL_IP = '172.25.96.1'; // CHANGE THIS to your computer's actual IP address
const API_URLS = {
  localhost: 'http://127.0.0.1:5000/classify',
  localIP: `http://${LOCAL_IP}:5000/classify`,
  androidEmulator: 'http://10.0.0.178:5000/classify'
};

// Start with localhost, but you can change this to one of the other options if needed
const API_URL = API_URLS.androidEmulator;  // Try changing this to .localIP or .androidEmulator

// Optional: Initialize function for any setup needed
export const initializeTf = async (): Promise<void> => {
  try {
    console.log('API-based bird classifier initialized');
  } catch (error) {
    console.error('Failed to initialize bird classifier', error);
    throw error;
  }
};

// No need for model loading with API approach
export const loadModel = async (): Promise<any> => {
  // Return a dummy object since we're not using a local model
  console.log('Using remote bird classifier API instead of local model');
  return { ready: true };
};

// Process image and send to API
export const classifyImage = async (
  _model: any,  // Not used but kept for API compatibility
  _imageTensor: any,  // Not used but kept for API compatibility
  originalUri: string  // Added parameter for the original image URI
): Promise<BirdPredictionResult> => {
  try {
    console.log('Preparing image for API classification...');
    console.log('Using API URL:', API_URL);
    
    // Resize the image to 224x224 to match the model's expected input
    const resizedImg = await ImageManipulator.manipulateAsync(
      originalUri,
      [{ resize: { width: 224, height: 224 } }],
      { format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    
    if (!resizedImg.base64) {
      throw new Error('Failed to get base64 data from resized image');
    }
    
    console.log('Image resized successfully, base64 length:', resizedImg.base64.length);
    console.log('Sending image to API for classification...');
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Send the image to the API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64_image: resizedImg.base64
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      // Parse the response
      const result = await response.json();
      console.log('Classification received from API:', result.topResult);
      
      return result;
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 30 seconds');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error during classification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Detailed error:', errorMessage);
    
    return {
      topResult: 'Classification Error',
      allResults: [{
        species: 'Error: ' + errorMessage,
        probability: 1
      }]
    };
  }
};

// Keep the preprocessImage function for backward compatibility if needed
export const preprocessImage = async (uri: string): Promise<any> => {
  console.log('Note: preprocessImage is not used with API approach');
  // Return a placeholder since this isn't used with the API approach
  return null;
};