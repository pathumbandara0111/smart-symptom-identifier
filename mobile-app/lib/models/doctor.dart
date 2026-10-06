/// Supabase `doctors` row.
class Doctor {
  const Doctor({
    required this.id,
    required this.hospitalId,
    required this.name,
    required this.speciality,
    required this.fee,
    required this.phone,
    required this.available,
  });

  final String id;
  final String hospitalId;
  final String name;
  final String speciality;
  final double fee;
  final String phone;
  final bool available;

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      id: json['id'] as String? ?? '',
      hospitalId: json['hospitalId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      speciality: json['speciality'] as String? ?? '',
      fee: (json['fee'] as num? ?? 0).toDouble(),
      phone: json['phone'] as String? ?? '',
      available: json['available'] as bool? ?? true,
    );
  }
}
