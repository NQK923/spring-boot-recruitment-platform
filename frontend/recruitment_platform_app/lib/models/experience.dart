class Experience {
  const Experience({
    this.id,
    required this.title,
    required this.companyName,
    this.description,
    this.startDate,
    this.endDate,
  });

  final int? id;
  final String title;
  final String companyName;
  final String? description;
  final DateTime? startDate;
  final DateTime? endDate;

  factory Experience.fromJson(Map<String, dynamic> json) {
    return Experience(
      id: _parseInt(json['id']),
      title: (json['title'] ?? '') as String,
      companyName: (json['companyName'] ?? '') as String,
      description: json['description'] as String?,
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
