// ignore_for_file: avoid_web_libraries_in_flutter

import 'dart:async';
import 'dart:convert';
import 'dart:html' as html;

Future<String?> startGitHubWebOAuth(
  Uri authorizeUrl,
  String expectedState, {
  Duration timeout = const Duration(minutes: 5),
}) {
  final popup = html.window.open(
    authorizeUrl.toString(),
    'github-auth',
    'width=600,height=800,menubar=no,toolbar=no,status=no',
  );

  final completer = Completer<String?>();
  StreamSubscription<html.MessageEvent>? subscription;
  Timer? timer;

  void cleanUp() {
    subscription?.cancel();
    timer?.cancel();
    popup.close();
  }

  subscription = html.window.onMessage.listen((event) {
    dynamic data = event.data;
    Map<String, dynamic>? payload;

    if (data is String) {
      try {
        final decoded = jsonDecode(data);
        if (decoded is Map<String, dynamic>) {
          payload = decoded;
        }
      } catch (_) {
        // Ignore JSON parsing errors and keep waiting.
      }
    } else if (data is Map) {
      payload = Map<String, dynamic>.from(data);
    }

    if (payload == null) {
      return;
    }

    if (payload['source'] != 'github-auth') {
      return;
    }

    if (payload['state'] != expectedState) {
      return;
    }

    if (completer.isCompleted) {
      return;
    }

    final error = payload['error'] as String?;
    if (error != null && error.isNotEmpty) {
      cleanUp();
      completer.completeError(Exception('GitHub login failed: $error'));
      return;
    }

    final code = payload['code'] as String?;
    cleanUp();
    completer.complete(code);
  });

  timer = Timer(timeout, () {
    if (!completer.isCompleted) {
      cleanUp();
      completer.completeError(Exception('GitHub login timed out'));
    }
  });

  return completer.future;
}
