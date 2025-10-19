class Education {
  const Education({
    this.id,
    required this.school,
    required this.degree,
    this.startDate,
    this.endDate,
  });

  final int? id;
  final String school;
  final String degree;
  final DateTime? startDate;
  final DateTime? endDate;

  factory Education.fromJson(Map<String, dynamic> json) {
    return Education(
      id: _parseInt(json['id']),
      school: (json['school'] ?? '') as String,
      degree: (json['degree'] ?? '') as String,
      startDate: _parseDate(json['startDate']),
      endDate: _parseDate(json['endDate']),
    );
  }

  static int? _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    return null;
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    if (value is String && value.isNotEmpty) {
      try {
        return DateTime.parse(value);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}
