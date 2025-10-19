import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../models/profile.dart';
import '../utils/constants.dart';
import '../models/cv.dart';
import '../models/downloaded_file.dart';

class ProfileApiService {
  Future<Profile> getMyProfile(String token) async {
    final url = Uri.parse('$BASE_URL/profiles/me');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = _decodeProfileBody(response.body);
      return Profile.fromJson(data);
    } else {
      throw Exception('Failed to load profile');
    }
  }

  Future<Profile> updateMyProfile(String token, Profile profile) async {
    final url = Uri.parse('$BASE_URL/profiles/me');
    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(profile.toJson()),
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = _decodeProfileBody(response.body);
      return Profile.fromJson(data);
    } else {
      throw Exception('Failed to update profile');
    }
  }

  Future<Cv> uploadCv(
    String token,
    String versionName, {
    String? filePath,
    List<int>? fileBytes,
    String? fileName,
    String? contentType,
  }) async {
    final url = Uri.parse('$BASE_URL/profiles/me/cvs/upload');
    final request = http.MultipartRequest('POST', url);
    request.headers['Authorization'] = 'Bearer $token';
    request.fields['versionName'] = versionName;

    http.MultipartFile filePart;
    if (filePath != null) {
      filePart = await http.MultipartFile.fromPath('file', filePath);
    } else if (fileBytes != null) {
      final mediaType =
          contentType != null
              ? MediaType.parse(contentType)
              : MediaType('application', 'octet-stream');
      filePart = http.MultipartFile.fromBytes(
        'file',
        fileBytes,
        filename: fileName ?? 'upload.bin',
        contentType: mediaType,
      );
    } else {
      throw ArgumentError('Either filePath or fileBytes must be provided');
    }

    request.files.add(filePart);

    final response = await request.send();

    if (response.statusCode == 201) {
      // Created
      final responseBody = await response.stream.bytesToString();
      return Cv.fromJson(json.decode(responseBody));
    } else {
      throw Exception('Failed to upload CV');
    }
  }

  Future<Cv> generateCv(String token, String versionName) async {
    final url = Uri.parse('$BASE_URL/profiles/me/cvs/generate');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({'versionName': versionName}),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to generate CV');
    }

    return Cv.fromJson(json.decode(response.body));
  }

  Future<DownloadedFile> downloadCvFile(String token, String fileId) async {
    final url = Uri.parse('$BASE_URL/files/$fileId');
    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to download CV');
    }

    final contentDisposition = response.headers['content-disposition'];
    final fileName = _extractFileName(contentDisposition) ?? 'cv_$fileId';

    return DownloadedFile(
      bytes: response.bodyBytes,
      fileName: fileName,
      contentType: response.headers['content-type'],
    );
  }

  Map<String, dynamic> _decodeProfileBody(String body) {
    try {
      final decoded = json.decode(body);
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }
      throw const FormatException('Profile response is not an object');
    } on FormatException catch (_) {
      final sanitized = body
          .replaceAll('"experiences":]', '"experiences":[]')
          .replaceAll('"education":]', '"education":[]')
          .replaceAll('"skills":]', '"skills":[]')
          .replaceAll('"cvs":]', '"cvs":[]');

      final decoded = json.decode(sanitized);
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }
      throw const FormatException('Profile response is not an object');
    }
  }

  String? _extractFileName(String? contentDisposition) {
    if (contentDisposition == null) {
      return null;
    }
    final parts = contentDisposition.split(';');
    for (final part in parts) {
      final trimmed = part.trim();
      if (trimmed.toLowerCase().startsWith('filename=')) {
        final value = trimmed.substring('filename='.length).trim();
        return value.replaceAll('"', '');
      }
    }
    return null;
  }
}
