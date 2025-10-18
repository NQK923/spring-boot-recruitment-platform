class ApplicationNote {
  final int id;
  final int applicationId;
  final int authorUserId;
  final String content;
  final DateTime createdAt;

  ApplicationNote({
    required this.id,
    required this.applicationId,
    required this.authorUserId,
    required this.content,
    required this.createdAt,
  });

  factory ApplicationNote.fromJson(Map<String, dynamic> json) {
    return ApplicationNote(
      id: json['id'],
      applicationId: json['applicationId'],
      authorUserId: json['authorUserId'],
      content: json['content'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
