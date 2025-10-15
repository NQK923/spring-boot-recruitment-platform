class CreateJobRequest {
  final String title;
  final String description;
  final String requirements;
  final String location;
  final String workType;

  CreateJobRequest({
    required this.title,
    required this.description,
    required this.requirements,
    required this.location,
    required this.workType,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'requirements': requirements,
      'location': location,
      'workType': workType,
    };
  }
}
