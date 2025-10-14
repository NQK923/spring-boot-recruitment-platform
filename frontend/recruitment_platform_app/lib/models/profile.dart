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
    var cvList = json['cvs'] as List?;
    List<Cv> cvs = cvList != null ? cvList.map((i) => Cv.fromJson(i)).toList() : [];

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
