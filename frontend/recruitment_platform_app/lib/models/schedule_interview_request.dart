class ScheduleInterviewRequest {
  final int applicationId;
  final DateTime scheduleTime;
  final String timezone;
  final String format;
  final String locationOrLink;
  final List<int> interviewerIds;
  final int candidateId;

  ScheduleInterviewRequest({
    required this.applicationId,
    required this.scheduleTime,
    required this.timezone,
    required this.format,
    required this.locationOrLink,
    required this.interviewerIds,
    required this.candidateId,
  });

  Map<String, dynamic> toJson() {
    return {
      'applicationId': applicationId,
      'scheduleTime': scheduleTime.toIso8601String(),
      'timezone': timezone,
      'format': format,
      'locationOrLink': locationOrLink,
      'interviewerIds': interviewerIds,
      'candidateId': candidateId,
    };
  }
}
