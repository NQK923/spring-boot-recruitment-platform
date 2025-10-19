import 'dart:io';

import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';

Future<String> saveFileImpl({
  required String fileName,
  required List<int> bytes,
  String? contentType,
}) async {
  final destinationDir = await _resolveDirectory();
  final sanitizedName = _sanitizeFileName(fileName);
  final filePath =
      '${destinationDir.path}${Platform.pathSeparator}$sanitizedName';
  final file = File(filePath);
  await file.writeAsBytes(bytes, flush: true);
  await OpenFilex.open(file.path);
  return 'Saved to ${file.path}';
}

Future<Directory> _resolveDirectory() async {
  final downloads = await getDownloadsDirectory();
  if (downloads != null) {
    return downloads;
  }

  try {
    final docs = await getApplicationDocumentsDirectory();
    return docs;
  } catch (_) {
    return await getTemporaryDirectory();
  }
}

String _sanitizeFileName(String input) {
  final fallback = 'downloaded_file';
  final name = input.trim().isEmpty ? fallback : input.trim();
  final sanitized = name
      .replaceAll(RegExp(r'[<>:"/\\|?*]'), '_')
      .replaceAll("'", '_');
  return sanitized;
}
