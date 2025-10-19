// ignore_for_file: deprecated_member_use, avoid_web_libraries_in_flutter

import 'dart:html' as html;

Future<String> saveFileImpl({
  required String fileName,
  required List<int> bytes,
  String? contentType,
}) async {
  final blob = html.Blob([bytes], contentType ?? 'application/octet-stream');
  final url = html.Url.createObjectUrlFromBlob(blob);
  final anchor =
      html.AnchorElement(href: url)
        ..download = fileName.isEmpty ? 'download' : fileName
        ..style.display = 'none';

  html.document.body?.append(anchor);
  anchor.click();
  anchor.remove();
  html.Url.revokeObjectUrl(url);

  return 'Downloaded $fileName';
}
