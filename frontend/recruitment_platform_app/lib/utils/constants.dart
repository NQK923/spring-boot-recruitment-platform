import 'package:flutter/foundation.dart';

const String _defaultApiBase = 'http://localhost:8080/api';
const String _androidEmulatorApiBase = 'http://10.0.2.2:8080/api';

String get BASE_URL {
  if (kIsWeb) {
    return _defaultApiBase;
  }

  switch (defaultTargetPlatform) {
    case TargetPlatform.android:
      return _androidEmulatorApiBase;
    default:
      return _defaultApiBase;
  }
}
