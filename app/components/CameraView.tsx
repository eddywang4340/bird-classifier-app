import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

// Define props interface
interface CameraViewProps {
  onCapture: (uri: string) => void;
}

const CustomCameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = React.useRef<CameraView>(null);
    
    if (!permission) {
      // Camera permissions are still loading
      return <View style={styles.container} />;
    }
    
    if (!permission.granted) {
      // Camera permissions are not granted yet
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            We need your permission to use the camera
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const takePicture = async () => {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync();
          if (photo && photo.uri) {
            onCapture(photo.uri);
          }
        } catch (error) {
          console.error('Error taking picture:', error);
        }
      }
    };

    const toggleCameraFacing = () => {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    return (
      <View style={styles.container}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <MaterialIcons name="flip-camera-ios" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.emptySpace} />
          </View>
        </CameraView>
      </View>
    );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: width * 1.33, // 4:3 ratio
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  emptySpace: {
    width: 40,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CustomCameraView;