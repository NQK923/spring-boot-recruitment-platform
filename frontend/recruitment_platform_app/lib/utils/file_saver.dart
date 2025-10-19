import 'file_saver_stub.dart'
    if (dart.library.html) 'file_saver_web.dart'
    if (dart.library.io) 'file_saver_io.dart';

Future<String> saveFile({
  required String fileName,
  required List<int> bytes,
  String? contentType,
}) {
  return saveFileImpl(
    fileName: fileName,
    bytes: bytes,
    contentType: contentType,
  );
}
