/// Supabase `User` row (webapp Prisma schema), keyed by email. Firebase is the
/// auth authority; this mirrors the migrated `profiles` concept.
class Profile {
  const Profile({
    required this.id,
    required this.name,
    required this.email,
    this.role,
    this.createdAt,
  });

  final String id;
  final String name;
  final String email;
  final String? role;
  final DateTime? createdAt;

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
    );
  }
}
