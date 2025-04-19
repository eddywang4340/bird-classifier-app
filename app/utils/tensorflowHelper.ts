import * as tf from '@tensorflow/tfjs';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Type definitions
export type BirdPredictionResult = {
  topResult: string;
  allResults: {
    species: string;
    probability: number;
  }[];
};

// List of bird species that match your model's output classes
const BIRD_SPECIES = [
  'Canada Goose',
  'Blue Jay',
  'Northern Cardinal',
  'Pigeon',
  'Loon',
  'Seagull',
  'Red-Tailed Hawk',
  'Great Blue Heron',
];

// Model loading
export const loadModel = async (): Promise<tf.GraphModel> => {
  try {
    // Wait for TensorFlow.js to be ready
    await tf.ready();
    console.log('TensorFlow.js is ready');

    // Path to your model JSON file
    const modelPath = 'your-model-path'; // Update this to your actual model path
    
    // Load the model
    const model = await tf.loadGraphModel(modelPath);
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Failed to load model', error);
    throw error;
  }
};

// Image preprocessing
export const preprocessImage = async (uri: string): Promise<tf.Tensor> => {
  try {
    // Create an instance of ImageManipulator
    const context = ImageManipulator.ImageManipulator.manipulate(uri);
    
    // Resize the image to 50x50
    context.resize({ width: 50, height: 50 });

    // Render the image to get an ImageRef
    const imageRef = await context.renderAsync();
    
    // Save the modified image
    const result = await imageRef.saveAsync();

    // Read the image as base64
    const base64Data  = await FileSystem.readAsStringAsync(result.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to tensor - this will need to be adjusted based on your model's requirements
    const imgBuffer = tf.util.encodeString(base64Data, 'base64').buffer;
    const raw = new Uint8Array(imgBuffer);
    
    // Create a tensor with the right shape
    // Note: This part may need adjustment based on how your model expects the data
    const imageArray = Array.from(raw).map(val => val / 255.0);
    const tensor = tf.tensor4d(
      imageArray, 
      [1, 50, 50, 3] // Batch size 1, 50x50 image, 3 channels (RGB)
    );
    
    return tensor;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw error;
  }
};

// Prediction function
export const classifyImage = async (
  model: tf.GraphModel, 
  imageTensor: tf.Tensor
): Promise<BirdPredictionResult> => {
  try {
    // Run inference
    const predictions = await model.predict(imageTensor) as tf.Tensor;
    
    // Get the probabilities as an array
    const probabilities = await predictions.data();
    
    // Get the index of the highest probability
    const highestProbIndex = Array.from(probabilities).indexOf(
      Math.max(...Array.from(probabilities))
    );
    
    // Get the bird species name
    const birdName = BIRD_SPECIES[highestProbIndex];
    
    // Format results
    const results = BIRD_SPECIES.map((species, index) => ({
      species,
      probability: probabilities[index]
    })).sort((a, b) => b.probability - a.probability);
    
    // Cleanup tensors to prevent memory leaks
    tf.dispose([imageTensor, predictions]);
    
    return {
      topResult: birdName,
      allResults: results
    };
  } catch (error) {
    console.error('Error during classification:', error);
    throw error;
  }
};