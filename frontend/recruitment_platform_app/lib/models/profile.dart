import './cv.dart';
import './education.dart';
import './experience.dart';
import './skill.dart';

class Profile {
  final int userId;
  final String? fullName;
  final String? phoneNumber;
  final String? summary;
  final List<Cv> cvs;
  final List<Experience> experiences;
  final List<Education> education;
  final List<Skill> skills;

  Profile({
    required this.userId,
    this.fullName,
    this.phoneNumber,
    this.summary,
    this.cvs = const [],
    this.experiences = const [],
    this.education = const [],
    this.skills = const [],
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      userId: _parseId(json['userId']),
      fullName: json['fullName'],
      phoneNumber: json['phoneNumber'],
      summary: json['summary'],
      cvs: _parseList(json['cvs'], (item) => Cv.fromJson(item)),
      experiences: _parseList(
        json['experiences'],
        (item) => Experience.fromJson(item),
      ),
      education: _parseList(
        json['education'],
        (item) => Education.fromJson(item),
      ),
      skills: _parseList(json['skills'], (item) => Skill.fromJson(item)),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'phoneNumber': phoneNumber,
      'summary': summary,
    };
  }

  static List<T> _parseList<T>(
    dynamic data,
    T Function(Map<String, dynamic> map) parser,
  ) {
    if (data is List) {
      return data
          .map(_castToMap)
          .whereType<Map<String, dynamic>>()
          .map(parser)
          .toList();
    } else if (data is Map) {
      return data.values
          .map(_castToMap)
          .whereType<Map<String, dynamic>>()
          .map(parser)
          .toList();
    }
    return <T>[];
  }

  static Map<String, dynamic>? _castToMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }
    if (value is Map) {
      return Map<String, dynamic>.from(value);
    }
    return null;
  }

  static int _parseId(dynamic value) {
    if (value is int) return value;
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }
}
