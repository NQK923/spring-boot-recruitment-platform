import './cv.dart';

class Profile {
  final int userId;
  final String? fullName;
  final String? phoneNumber;
  final String? summary;
  final List<Cv> cvs;

  Profile({
    required this.userId,
    this.fullName,
    this.phoneNumber,
    this.summary,
    this.cvs = const [],
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    final dynamic cvData = json['cvs'];
    final List<Cv> cvs;
    if (cvData is List) {
      cvs = cvData.map((item) => Cv.fromJson(Map<String, dynamic>.from(item))).toList();
    } else if (cvData is Map<String, dynamic>) {
      cvs = cvData.values
          .whereType<Map>()
          .map((item) => Cv.fromJson(Map<String, dynamic>.from(item as Map)))
          .toList();
    } else {
      cvs = const [];
    }

    return Profile(
      userId: json['userId'],
      fullName: json['fullName'],
      phoneNumber: json['phoneNumber'],
      summary: json['summary'],
      cvs: cvs,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'phoneNumber': phoneNumber,
      'summary': summary,
    };
  }
}
