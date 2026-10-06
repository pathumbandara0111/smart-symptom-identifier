import 'dart:math' as math;

import 'package:geolocator/geolocator.dart';

/// A resolved user location (latitude / longitude) that a caller may sort or
/// display against.
class UserLocation {
  const UserLocation({required this.lat, required this.lng});

  final double lat;
  final double lng;
}

/// Geolocation wrapper around the geolocator plugin.
///
/// Exposes a dependency-free permission flow and returns null / without
/// throwing when location is unavailable, so callers can fall back gracefully
/// (e.g. an un-sorted hospital list when the user denies location).
class LocationService {
  LocationService();

  /// Returns the current position, or null when permission is denied, location
  /// services are off, or no fix could be acquired within the timeout.
  Future<UserLocation?> getCurrentLocation() async {
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }
      if (!await Geolocator.isLocationServiceEnabled()) return null;

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      return UserLocation(lat: position.latitude, lng: position.longitude);
    } catch (_) {
      return null;
    }
  }

  /// Great-circle (Haversine) distance in kilometres between two coordinates.
  static double distanceKm(double lat1, double lng1, double lat2, double lng2) {
    const earthR = 6371.0;
    final dLat = _toRad(lat2 - lat1);
    final dLng = _toRad(lng2 - lng1);
    final a =
        math.pow(math.sin(dLat / 2), 2) +
        math.cos(_toRad(lat1)) *
            math.cos(_toRad(lat2)) *
            math.pow(math.sin(dLng / 2), 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return earthR * c;
  }

  /// Human-friendly distance label, e.g. "850 m" or "4.2 km".
  static String formatDistance(double km) {
    if (km < 1) {
      final metres = (km * 1000).round();
      return '$metres m';
    }
    return '${km.toStringAsFixed(1)} km';
  }

  static double _toRad(double deg) => deg * math.pi / 180.0;
}
