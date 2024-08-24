import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'dart:typed_data';

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

  @override
  void initState() {
    super.initState();
    _controller = CameraController(
      widget.camera,
      ResolutionPreset.high,
    );
    _initializeControllerFuture = _controller.initialize();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _takePicture() async {
    try {
      await _initializeControllerFuture;

      // Take the picture and get the image as bytes
      final image = await _controller.takePicture();
      final bytes = await image.readAsBytes();
      print("Image captured");

      setState(() {
        _imageBytes = bytes;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Picture captured')),
      );
    } catch (e) {
      print("Error taking picture: $e");
    }
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
