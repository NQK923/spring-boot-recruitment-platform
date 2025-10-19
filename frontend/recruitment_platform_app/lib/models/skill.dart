class Skill {
  const Skill({this.id, required this.name});

  final int? id;
  final String name;

  factory Skill.fromJson(Map<String, dynamic> json) {
    final dynamic rawName = json['skillName'] ?? json['name'];
    return Skill(
      id: _parseInt(json['id']),
      name: rawName is String ? rawName : '',
    );
  }

  static int? _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    return null;
  }
}
