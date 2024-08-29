import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'dart:typed_data';
import 'package:flutter_tflite/flutter_tflite.dart';  // Import flutter_tflite
import 'dart:convert';  // For base64 encoding
import 'package:image/image.dart' as img;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final cameras = await availableCameras();
  final firstCamera = cameras.first;

  runApp(MyApp(camera: firstCamera));
}

class MyApp extends StatelessWidget {
  final CameraDescription camera;

  const MyApp({Key? key, required this.camera}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      home: MyHomePage(title: 'Bird Classifier App', camera: camera),
    );
  }
}

class MyHomePage extends StatefulWidget {
  final String title;
  final CameraDescription camera;

  const MyHomePage({Key? key, required this.title, required this.camera}) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  Uint8List? _imageBytes;

  // Define your list of bird species
  static const List<String> birdSpecies = [
    'Canada Goose',
    'Blue Jay',
    'Northern Cardinal',
    'Pigeon',
    'Loon',
    'Seagull',
    'Red-Tailed Hawk',
    'Great Blue Heron',
  ];

  @override
  void initState() {
    super.initState();
    _controller = CameraController(
      widget.camera,
      ResolutionPreset.high,
    );
    _initializeControllerFuture = _controller.initialize();
    _loadModel();  // Load the model on initialization
  }

  @override
  void dispose() {
    _controller.dispose();
    Tflite.close();  // Close the model when disposing
    super.dispose();
  }

  Future<void> _loadModel() async {
    try {
      await Tflite.loadModel(
        model: "assets/model.tflite",
        // No need for labels.txt
      );
      debugPrint("Model loaded successfully");
    } catch (e) {
      debugPrint("Error loading model: $e");
    }
  }

  Future<void> _takePicture() async {
    try {
      await _initializeControllerFuture;

      // Take the picture and get the image as bytes
      final image = await _controller.takePicture();
      final bytes = await image.readAsBytes();
      debugPrint("Image captured");

      setState(() {
        _imageBytes = bytes;
      });

      // Run inference
      if (_imageBytes != null) {
        final output = await _runModel(_imageBytes!);
        debugPrint("Model output: $output");

        // Handle the results here, e.g., show the most likely bird species
        if (output.isNotEmpty) {
          final highestProbabilityIndex = output
              .map((result) => result['index'])
              .reduce((a, b) => a > b ? a : b);
          final birdName = birdSpecies[highestProbabilityIndex];
          debugPrint("Detected Bird: $birdName");
        }
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Picture captured')),
      );
    } catch (e) {
      debugPrint("Error taking picture: $e");
    }
  }

  Future<List<dynamic>> _runModel(Uint8List imageBytes) async {
    // Preprocess the image
    try {
      var processedImage = _preprocessImage(imageBytes);

      // Run inference
      var output = await Tflite.runModelOnBinary(
        binary: processedImage,
        numResults: 8,  // Number of classes
      );

      return output!;
    } catch (e) {
      debugPrint("Error at _runModel: $e");
      return [];
    }

  }

  Uint8List _preprocessImage(Uint8List imageBytesPreprocess) {
    // Convert Uint8List to Image
    final image = img.decodeImage(imageBytesPreprocess);

    // Resize image to match the model input size (e.g., 50x50)
    final resizedImage = img.copyResize(image!, width: 50, height: 50);

    // Convert image to list of bytes
    final imageBytesFinal = img.encodeJpg(resizedImage);

    // Normalize image to 0-1 range and convert to float32
    final buffer = Float32List(50 * 50 * 3);
    int offset = 0;
    for (var y = 0; y < 50; y++) {
      for (var x = 0; x < 50; x++) {
        final pixel = resizedImage.getPixel(x, y);
        final r = img.getRed(pixel) / 255.0;
        final g = img.getGreen(pixel) / 255.0;
        final b = img.getBlue(pixel) / 255.0;
        buffer[offset++] = r;
        buffer[offset++] = g;
        buffer[offset++] = b;
      }
    }

    return Uint8List.fromList(buffer.buffer.asUint8List());
    // try {
    //   // Convert Uint8List to Image
    //   final image = img.decodeImage(imageBytesPreprocess);
    //
    //   // Resize image to match the model input size (e.g., 50x50)
    //   final resizedImage = img.copyResize(image!, width: 50, height: 50);
    //
    //   // Convert image to list of bytes
    //   final imageBytesFinal = img.encodeJpg(resizedImage);
    //
    //   // Normalize image to 0-1 range and convert to float32
    //   final buffer = Float32List(50 * 50 * 3);
    //   int offset = 0;
    //   for (var y = 0; y < 50; y++) {
    //     for (var x = 0; x < 50; x++) {
    //       final pixel = resizedImage.getPixel(x, y);
    //       final r = img.getRed(pixel) / 255.0;
    //       final g = img.getGreen(pixel) / 255.0;
    //       final b = img.getBlue(pixel) / 255.0;
    //       buffer[offset++] = r;
    //       buffer[offset++] = g;
    //       buffer[offset++] = b;
    //     }
    //   }
    //
    //   return Uint8List.fromList(buffer.buffer.asUint8List());
    // } catch (e) {
    //   debugPrint("Error running _preprocessImage: $e");
    //   return Uint8List(0);
    // }
  }

  @override
  Widget build(BuildContext context) {
    // Get the screen size
    final screenSize = MediaQuery.of(context).size;

    // Set the camera preview height to 50% of the screen height
    final cameraHeight = screenSize.height * 0.5;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
        centerTitle: true,
      ),
      body: Center(
        child: FutureBuilder<void>(
          future: _initializeControllerFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0), // Add padding here
                    child: SizedBox(
                      height: cameraHeight, // Set scalable height here
                      width: screenSize.width, // Set width to full screen width
                      child: _imageBytes == null
                          ? CameraPreview(_controller)
                          : Image.memory(_imageBytes!),
                    ),
                  ),
                  const SizedBox(height: 16.0), // Add space between camera and button
                  Align(
                    alignment: Alignment.center,
                    child: FloatingActionButton(
                      onPressed: _takePicture,
                      tooltip: 'Take Picture',
                      child: const Icon(Icons.camera),
                    ),
                  ),
                ],
              );
            } else {
              return const Center(child: CircularProgressIndicator());
            }
          },
        ),
      ),
    );
  }
}
