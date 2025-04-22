// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolution for react-native-fs
config.resolver.extraNodeModules = {
  'react-native-fs': path.resolve(__dirname, './react-native-fs.js')
};

// Add bin extension to assetExts
const { assetExts } = config.resolver;
config.resolver.assetExts = [...assetExts, 'bin'];

module.exports = config;