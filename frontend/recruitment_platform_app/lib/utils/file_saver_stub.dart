Future<String> saveFileImpl({
  required String fileName,
  required List<int> bytes,
  String? contentType,
}) async {
  throw UnsupportedError('File saving is not supported on this platform.');
}
