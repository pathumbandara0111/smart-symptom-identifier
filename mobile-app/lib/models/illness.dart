/// Supabase `illnesses` row, joined with its ordered `first_aids` steps.
class Illness {
  const Illness({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    this.firstAidSteps = const [],
  });

  final String id;
  final String name;
  final String description;
  final String category;
  final List<String> firstAidSteps;

  factory Illness.fromJson(Map<String, dynamic> json) {
    final steps = <String>[];
    final firstAids = json['FirstAid'] as List<dynamic>? ?? [];
    // first_aids come with ordered `step` + `instruction`; sort defensively.
    final ordered = List<Map<String, dynamic>>.from(firstAids)
      ..sort(
        (a, b) => (a['step'] as int? ?? 0).compareTo(b['step'] as int? ?? 0),
      );
    for (final fa in ordered) {
      final instruction = fa['instruction'] as String?;
      if (instruction != null) steps.add(instruction);
    }
    return Illness(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? 'general',
      firstAidSteps: steps,
    );
  }
}
