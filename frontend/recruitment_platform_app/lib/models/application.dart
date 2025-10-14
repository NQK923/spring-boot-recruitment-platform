class Application {
  final int id;
  final int jobPostingId;
  final int candidateId;
  final int cvId;
  final String status;
  final DateTime appliedAt;

  Application({
    required this.id,
    required this.jobPostingId,
    required this.candidateId,
    required this.cvId,
    required this.status,
    required this.appliedAt,
  });

  factory Application.fromJson(Map<String, dynamic> json) {
    return Application(
      id: json['id'],
      jobPostingId: json['jobPostingId'],
      candidateId: json['candidateId'],
      cvId: json['cvId'],
      status: json['status'],
      appliedAt: DateTime.parse(json['appliedAt']),
    );
  }
}
