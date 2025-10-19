class Cv {
  final int? id;
  final String? fileId;
  final String versionName;
  final bool isDefault;
  final DateTime? createdAt;

  Cv({
    this.id,
    this.fileId,
    required this.versionName,
    required this.isDefault,
    this.createdAt,
  });

  factory Cv.fromJson(Map<String, dynamic> json) {
    return Cv(
      id: _parseInt(json['id']),
      fileId: json['fileId']?.toString(),
      versionName: json['versionName'] ?? 'Untitled CV',
      isDefault: json['isDefault'] ?? false,
      createdAt: _parseDate(json['createdAt']),
    );
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

  static int? _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    return null;
  }
}
