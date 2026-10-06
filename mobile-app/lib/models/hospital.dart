import 'doctor.dart';

/// Supabase `hospitals` row.
class Hospital {
  const Hospital({
    required this.id,
    required this.name,
    required this.address,
    required this.lat,
    required this.lng,
    required this.phone,
    required this.type,
    this.doctors = const [],
  });

  final String id;
  final String name;
  final String address;
  final double lat;
  final double lng;
  final String phone;
  final String type;
  final List<Doctor> doctors;

  factory Hospital.fromJson(Map<String, dynamic> json) {
    return Hospital(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      address: json['address'] as String? ?? '',
      lat: (json['lat'] as num? ?? 0).toDouble(),
      lng: (json['lng'] as num? ?? 0).toDouble(),
      phone: json['phone'] as String? ?? '',
      type: json['type'] as String? ?? 'General',
      doctors: (json['Doctor'] as List<dynamic>? ?? [])
          .map((e) => Doctor.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }
}
