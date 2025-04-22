/**
 * This file must be imported before any TensorFlow imports
 * It registers the required polyfills for TensorFlow.js React Native
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('📱 Setting up React Native FS polyfill');

// Type definition for the ReactNativeFS global
interface ReactNativeFS {
  exists: (path: string) => Promise<boolean>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string, encoding?: string) => Promise<void>;
  unlink: (path: string) => Promise<void>;
  mkdir: (dirPath: string) => Promise<void>;
  DocumentDirectoryPath: string;
}

// Register react-native-fs polyfill
if (!(global as any).ReactNativeFS) {
  (global as any).ReactNativeFS = {
    exists: async (path: string): Promise<boolean> => {
      try {
        const info = await FileSystem.getInfoAsync(path);
        return info.exists;
      } catch (error) {
        console.error('ReactNativeFS.exists error:', error);
        return false;
      }
    },
    readFile: async (path: string): Promise<string> => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (fileInfo.exists) {
          return await FileSystem.readAsStringAsync(path);
        }
        throw new Error(`File does not exist: ${path}`);
      } catch (error) {
        console.error('ReactNativeFS.readFile error:', error);
        throw error;
      }
    },
    writeFile: async (path: string, content: string, encoding?: string): Promise<void> => {
      try {
        // Simply pass the content without options
        // FileSystem.writeAsStringAsync doesn't need encoding for most cases
        await FileSystem.writeAsStringAsync(path, content);
      } catch (error) {
        console.error('ReactNativeFS.writeFile error:', error);
        throw error;
      }
    },
    unlink: async (path: string): Promise<void> => {
      try {
        await FileSystem.deleteAsync(path);
      } catch (error) {
        console.error('ReactNativeFS.unlink error:', error);
        throw error;
      }
    },
    mkdir: async (dirPath: string): Promise<void> => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(dirPath);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        }
      } catch (error) {
        console.error('ReactNativeFS.mkdir error:', error);
        throw error;
      }
    },
    DocumentDirectoryPath: FileSystem.documentDirectory || ''
  } as ReactNativeFS;
  
  console.log('✅ ReactNativeFS polyfill registered');
}

// Define the localStorage interface for the Storage API
interface FakeLocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

// Create a sync wrapper around AsyncStorage
class SyncStorageShim implements FakeLocalStorage {
  private cache: Record<string, string> = {};
  
  getItem(key: string): string | null {
    // Return from cache synchronously
    return this.cache[key] || null;
  }
  
  setItem(key: string, value: string): void {
    // Update cache immediately
    this.cache[key] = value;
    // Then persist in background
    AsyncStorage.setItem(key, value).catch(e => {
      console.error('AsyncStorage.setItem error:', e);
    });
  }
  
  removeItem(key: string): void {
    // Update cache immediately
    delete this.cache[key];
    // Then persist in background
    AsyncStorage.removeItem(key).catch(e => {
      console.error('AsyncStorage.removeItem error:', e);
    });
  }
  
  // Initialize the cache
  constructor() {
    console.log('Initializing localStorage polyfill');
    // We don't need to wait for this to complete
    AsyncStorage.getAllKeys().then(keys => {
      if (keys.length > 0) {
        return AsyncStorage.multiGet(keys);
      }
      return [];
    }).then(keyValuePairs => {
      keyValuePairs.forEach(([key, value]) => {
        if (key && value) {
          this.cache[key] = value;
        }
      });
      console.log(`Loaded ${keyValuePairs.length} items into localStorage polyfill cache`);
    }).catch(e => {
      console.error('Error initializing localStorage cache:', e);
    });
  }
}

// Register localStorage polyfill
if (!(global as any).localStorage) {
  (global as any).localStorage = new SyncStorageShim();
  console.log('✅ localStorage polyfill registered');
}