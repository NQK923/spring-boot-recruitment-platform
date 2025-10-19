class DownloadedFile {
  DownloadedFile({
    required this.bytes,
    required this.fileName,
    this.contentType,
  });

  final List<int> bytes;
  final String fileName;
  final String? contentType;
}
