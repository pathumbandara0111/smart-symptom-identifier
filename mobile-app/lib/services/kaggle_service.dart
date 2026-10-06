import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';

import '../core/config.dart';

/// Caller for the custom Kaggle-hosted AI models (DistilBERT text + MobileNetV2
/// image), exposed over the ngrok API. Mirrors the webapp's Kaggle calls.
class KaggleService {
  KaggleService(this._dio);

  final Dio _dio;

  Dio get dio => _dio; // exposed so the room/tests can override base options.

  String get baseUrl => AppConfig.kaggleBaseUrl;

  /// Predict illness from free-text symptoms. Returns the predicted illness
  /// name. Throws on any failure so the caller can fall back.
  Future<String> predictText(String symptoms) async {
    final response = await _dio.post(
      '$baseUrl/predict-text',
      data: {'symptoms': symptoms},
      options: Options(headers: {'Content-Type': 'application/json'}),
    );
    final data = response.data;
    if (data is Map && data['status'] == 'success' && data['illness'] != null) {
      return data['illness'].toString();
    }
    throw Exception('Kaggle text prediction failed');
  }

  /// Predicts a condition from an image. Returns the raw HAM10000-style code
  /// returned by the model (mapped to a full name by the caller).
  Future<String> predictImage(Uint8List bytes) async {
    final body = {'image': base64Encode(bytes)};
    final response = await _dio.post(
      '$baseUrl/predict-image',
      data: body,
      options: Options(
        headers: {'Content-Type': 'application/json'},
        sendTimeout: const Duration(seconds: 45),
        receiveTimeout: const Duration(seconds: 45),
      ),
    );
    final data = response.data;
    if (data is Map &&
        data['status'] == 'success' &&
        data['condition'] != null) {
      return data['condition'].toString();
    }
    throw Exception('Kaggle image prediction failed');
  }
}
