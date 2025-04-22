// react-native-fs.js
import * as FileSystem from 'expo-file-system';

// Create a complete mock for the react-native-fs module
const RNFS = {
  mkdir: path => FileSystem.makeDirectoryAsync(path, { intermediates: true }),
  moveFile: (source, destination) => FileSystem.moveAsync({ from: source, to: destination }),
  copyFile: (source, destination) => FileSystem.copyAsync({ from: source, to: destination }),
  pathForBundle: bundleNamesArray => FileSystem.documentDirectory,
  pathForGroup: groupName => FileSystem.documentDirectory,
  getFSInfo: () => ({ freeSpace: 1024 * 1024 * 1024, totalSpace: 1024 * 1024 * 1024 * 2 }),
  getAllExternalFilesDirs: () => [],
  unlink: path => FileSystem.deleteAsync(path),
  exists: path => FileSystem.getInfoAsync(path).then(res => res.exists),
  existsAssets: path => Promise.resolve(false),
  existsRes: path => Promise.resolve(false),
  readDir: path => FileSystem.readDirectoryAsync(path).then(files => files.map(fileName => ({ name: fileName, path: `${path}/${fileName}` }))),
  readFile: path => FileSystem.readAsStringAsync(path),
  readFileAssets: (path, encoding) => Promise.resolve(''),
  readFileRes: (path, encoding) => Promise.resolve(''),
  writeFile: (path, content, encoding) => FileSystem.writeAsStringAsync(path, content),
  downloadFile: options => {
    const { fromUrl, toFile } = options;
    return FileSystem.downloadAsync(fromUrl, toFile);
  },
  uploadFiles: options => Promise.resolve({ jobId: 1, statusCode: 200, bytesWritten: 0 }),
  touch: (path, mtime, ctime) => FileSystem.getInfoAsync(path),
  MainBundlePath: FileSystem.documentDirectory,
  CachesDirectoryPath: FileSystem.cacheDirectory,
  DocumentDirectoryPath: FileSystem.documentDirectory,
  ExternalDirectoryPath: FileSystem.documentDirectory,
  ExternalStorageDirectoryPath: FileSystem.documentDirectory,
  TemporaryDirectoryPath: FileSystem.cacheDirectory,
  LibraryDirectoryPath: FileSystem.documentDirectory,
  PicturesDirectoryPath: FileSystem.documentDirectory
};

export default RNFS;