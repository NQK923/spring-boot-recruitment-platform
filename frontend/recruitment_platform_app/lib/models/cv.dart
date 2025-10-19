class Cv {
  final int id;
  final String? fileId;
  final String versionName;
  final bool isDefault;

  Cv({
    required this.id,
    this.fileId,
    required this.versionName,
    required this.isDefault,
  });

  factory Cv.fromJson(Map<String, dynamic> json) {
    return Cv(
      id: json['id'],
      fileId: json['fileId']?.toString(),
      versionName: json['versionName'] ?? 'Untitled CV',
      isDefault: json['isDefault'] ?? false,
    );
  }
}
