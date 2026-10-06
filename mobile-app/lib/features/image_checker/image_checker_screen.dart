import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/providers.dart';
import '../../core/theme.dart';
import '../../widgets/analysis_progress.dart';
import '../../widgets/auth_avatar.dart';
import '../../widgets/state_views.dart';

class ImageCheckerScreen extends ConsumerStatefulWidget {
  const ImageCheckerScreen({super.key});

  @override
  ConsumerState<ImageCheckerScreen> createState() => _ImageCheckerScreenState();
}

class _ImageCheckerScreenState extends ConsumerState<ImageCheckerScreen> {
  final _picker = ImagePicker();
  final _description = TextEditingController();
  Uint8List? _bytes;
  String? _imagePath;
  String _mime = 'image/jpeg';
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _description.dispose();
    super.dispose();
  }

  Future<void> _pick(ImageSource source) async {
    try {
      final file = await _picker.pickImage(
        source: source,
        maxWidth: 224,
        maxHeight: 224,
        imageQuality: 85,
      );
      if (file == null) return;
      final bytes = await file.readAsBytes();
      if (!mounted) return;
      setState(() {
        _bytes = bytes;
        _imagePath = file.path;
        _mime = file.mimeType ?? 'image/jpeg';
        _error = null;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Could not pick image: $e')));
      }
    }
  }

  Future<void> _analyze() async {
    final bytes = _bytes;
    if (bytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please choose a photo first.')),
      );
      return;
    }
    if (!mounted) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await ref
          .read(aiServiceProvider)
          .identifyImage(
            bytes: bytes,
            mimeType: _mime,
            description: _description.text.trim(),
          );
      final user = ref.read(currentUserProvider);
      if (user != null) {
        try {
          await ref
              .read(supabaseServiceProvider)
              .saveSession(
                email: user.email ?? '',
                symptomText: _description.text.trim().isEmpty
                    ? null
                    : _description.text.trim(),
                imagePath: _imagePath,
                prediction: result,
              );
        } catch (_) {}
      }
      if (mounted) context.push('/results', extra: result);
    } catch (e) {
      if (mounted)
        setState(() => _error = 'Analysis failed. Please try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _cancel() {
    if (!mounted) return;
    setState(() {
      _busy = false;
      _error = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Photo'),
        actions: const [AuthAvatar()],
      ),
      body: SafeArea(
        child: _busy
            ? AnalysisProgressView(
                title: 'AI is analyzing your photo...',
                subtitle:
                    'Running the skin-condition model and refining the result. Please wait.',
                onCancel: _cancel,
              )
            : _error != null
            ? AppError(message: _error!, onRetry: _analyze)
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text(
                    'Take or upload a photo of a visible symptom and let our AI identify potential conditions.',
                    style: TextStyle(color: AppColors.textMuted, height: 1.5),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    height: 260,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: _bytes == null
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.add_a_photo,
                                  size: 48,
                                  color: AppColors.textMuted,
                                ),
                                const SizedBox(height: 8),
                                const Text(
                                  'No photo selected',
                                  style: TextStyle(color: AppColors.textMuted),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    IconButton.filled(
                                      tooltip: 'Take a photo',
                                      onPressed: _busy
                                          ? null
                                          : () => _pick(ImageSource.camera),
                                      icon: const Icon(Icons.photo_camera),
                                    ),
                                    const SizedBox(width: 16),
                                    IconButton.filled(
                                      tooltip: 'Choose from gallery',
                                      onPressed: _busy
                                          ? null
                                          : () => _pick(ImageSource.gallery),
                                      icon: const Icon(Icons.photo_library),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          )
                        : Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.memory(_bytes!, fit: BoxFit.cover),
                              Positioned(
                                top: 8,
                                right: 8,
                                child: IconButton.filled(
                                  onPressed: () => setState(() {
                                    _bytes = null;
                                  }),
                                  icon: const Icon(
                                    Icons.close,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _description,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Additional description (optional)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: _busy || _bytes == null ? null : _analyze,
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _busy
                        ? const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                              SizedBox(width: 12),
                              Text('Analyzing...'),
                            ],
                          )
                        : const Text('Analyze Photo'),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '⚠️ For informational purposes only. Not a substitute for professional medical advice.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ],
              ),
      ),
    );
  }
}
