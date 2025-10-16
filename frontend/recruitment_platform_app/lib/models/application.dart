class Application {
  final int id;
  final int jobPostingId;
  final int candidateId;
  final String? candidateName; // Make it nullable
  final int cvId;
  final String status;
  final DateTime appliedAt;

  Application({
    required this.id,
    required this.jobPostingId,
    required this.candidateId,
    this.candidateName,
    required this.cvId,
    required this.status,
    required this.appliedAt,
  });

  factory Application.fromJson(Map<String, dynamic> json) {
    return Application(
      id: json['id'],
      jobPostingId: json['jobPostingId'],
      candidateId: json['candidateId'],
      candidateName: json['candidateName'],
      cvId: json['cvId'],
      status: json['status'],
      appliedAt: DateTime.parse(json['appliedAt']),
    );
  }
}
