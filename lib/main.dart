import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'dart:typed_data';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final cameras = await availableCameras();
  final firstCamera = cameras.first;

  runApp(MyApp(camera: firstCamera));
}

class MyApp extends StatelessWidget {
  final CameraDescription camera;

  const MyApp({super.key, required this.camera});

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

  const MyHomePage({super.key, required this.title, required this.camera});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  Uint8List? _imageBytes;
  late Interpreter _interpreter;

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
    _initializeControllerFuture = _controller.initialize().then((_) {
      debugPrint("Camera initialized successfully");
    }).catchError((e) {
      debugPrint("Error initializing camera: $e");
    });
    _loadModel();  // Load the model on initialization
  }

  @override
  void dispose() {
    _controller.dispose();
    _interpreter.close();  // Close the model when disposing
    super.dispose();
  }

  Future<void> _loadModel() async {
    try {
      _interpreter = await Interpreter.fromAsset('model.tflite');
      debugPrint('Model loaded successfully');
    } catch (e) {
      debugPrint('Error loading model: $e');
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
        const SnackBar(content: Text('Picture captured')),
      );
    } catch (e) {
      debugPrint("Error taking picture: $e");
    }
  }

  Future<List<dynamic>> _runModel(Uint8List imageBytes) async {
    try {
      debugPrint("Running the model");

      // Preprocess the image to get a flat Float32List
      Float32List input = _preprocessImage(imageBytes);

      // Reshape the input to [1, 50, 50, 3]
      List<List<List<List<double>>>> reshapedInput = [
        List.generate(
          50,
              (y) => List.generate(
            50,
                (x) => [
              input[(y * 50 + x) * 3],
              input[(y * 50 + x) * 3 + 1],
              input[(y * 50 + x) * 3 + 2],
            ],
          ),
        )
      ];

      // Convert reshaped input to a Float32List for TensorFlow Lite interpreter
      List<Float32List> inputList = [Float32List.fromList(reshapedInput.expand((i) => i.expand((j) => j.expand((k) => k))).toList())];

      // Create an output buffer with the number of bird species
      var output = Float32List(birdSpecies.length);

      // Run the model with the input and output buffers
      _interpreter.runForMultipleInputs(inputList, {0: output});

      debugPrint("Finished running inference");

      // Convert the output to a more usable format (e.g., List)
      return output.toList();
    } catch (e) {
      debugPrint("Error at _runModel: $e");
      return [];
    }
  }



  Float32List _preprocessImage(Uint8List imageBytesPreprocess) {
    // Convert Uint8List to Image
    final image = img.decodeImage(imageBytesPreprocess);

    // Resize image to match the model input size (e.g., 50x50)
    final resizedImage = img.copyResize(image!, width: 50, height: 50);

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

    return buffer;
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
            } else if (snapshot.hasError) {
              return Text('Error: ${snapshot.error}');
            } else {
              return const Center(child: CircularProgressIndicator());
            }
          },
        ),
      ),
    );
  }
}
