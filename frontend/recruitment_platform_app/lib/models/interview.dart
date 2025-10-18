class Interview {
  final int id;
  final int applicationId;
  final DateTime scheduleTime;
  final String? timezone;
  final String? format;
  final String? locationOrLink;
  final List<InterviewParticipant> participants;
  final List<InterviewFeedback> feedback;
  final String? outcome;

  Interview({
    required this.id,
    required this.applicationId,
    required this.scheduleTime,
    this.timezone,
    this.format,
    this.locationOrLink,
    this.participants = const [],
    this.feedback = const [],
    this.outcome,
  });

  factory Interview.fromJson(Map<String, dynamic> json) {
    final participantsJson = json['participants'] as List<dynamic>?;
    final feedbackJson = json['feedback'] as List<dynamic>?;

    return Interview(
      id: json['id'],
      applicationId: json['applicationId'],
      scheduleTime: DateTime.parse(json['scheduleTime']),
      timezone: json['timezone'],
      format: json['format'],
      locationOrLink: json['locationOrLink'],
      outcome: json['outcome'],
      participants: participantsJson == null
          ? const []
          : participantsJson
              .map((item) => InterviewParticipant.fromJson(item as Map<String, dynamic>))
              .toList(),
      feedback: feedbackJson == null
          ? const []
          : feedbackJson
              .map((item) => InterviewFeedback.fromJson(item as Map<String, dynamic>))
              .toList(),
    );
  }
}

class InterviewParticipant {
  final int userId;
  final String role;

  InterviewParticipant({required this.userId, required this.role});

  factory InterviewParticipant.fromJson(Map<String, dynamic> json) {
    return InterviewParticipant(
      userId: json['userId'],
      role: json['role'],
    );
  }
}

class InterviewFeedback {
  final int interviewerId;
  final int? score;
  final String? comments;
  final String? outcome;

  InterviewFeedback({
    required this.interviewerId,
    this.score,
    this.comments,
    this.outcome,
  });

  factory InterviewFeedback.fromJson(Map<String, dynamic> json) {
    return InterviewFeedback(
      interviewerId: json['interviewerId'],
      score: json['score'],
      comments: json['comments'],
      outcome: json['outcome'],
    );
  }
}
