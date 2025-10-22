import 'package:flutter/material.dart';

class AppTheme {
  const AppTheme._();

  static const Color _primary = Color(0xFF2563EB);
  static const Color _primaryDark = Color(0xFF1E3A8A);
  static const Color _surface = Color(0xFFF8FAFC);
  static const Color _textHeading = Color(0xFF0F172A);
  static const Color _textBody = Color(0xFF475569);

  static ThemeData get lightTheme {
    final baseScheme = ColorScheme.fromSeed(
      seedColor: _primary,
      primary: _primary,
      secondary: const Color(0xFF38BDF8),
      background: _surface,
      surface: Colors.white,
    );

    return ThemeData(
      colorScheme: baseScheme,
      scaffoldBackgroundColor: _surface,
      visualDensity: VisualDensity.adaptivePlatformDensity,
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: _textHeading,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: _textHeading,
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontWeight: FontWeight.w700,
          color: _textHeading,
        ),
        headlineMedium: TextStyle(
          fontWeight: FontWeight.w700,
          color: _textHeading,
        ),
        headlineSmall: TextStyle(
          fontWeight: FontWeight.w700,
          color: _textHeading,
        ),
        titleLarge: TextStyle(
          fontWeight: FontWeight.w600,
          color: _textHeading,
        ),
        titleMedium: TextStyle(
          fontWeight: FontWeight.w600,
          color: _textHeading,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: _textBody,
        ),
        bodyMedium: TextStyle(
          fontSize: 15,
          color: _textBody,
        ),
        bodySmall: TextStyle(
          fontSize: 13,
          color: Color(0xFF94A3B8),
        ),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: _primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          side: BorderSide(color: _primary.withOpacity(0.2)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          foregroundColor: _textHeading,
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          backgroundColor: _primaryDark,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: _primary.withOpacity(0.08)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: _primary, width: 1.6),
        ),
        hintStyle: const TextStyle(
          color: Color(0xFF94A3B8),
        ),
        labelStyle: const TextStyle(
          color: _textBody,
          fontWeight: FontWeight.w500,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: _primary.withOpacity(0.08),
        selectedColor: _primary,
        labelStyle: const TextStyle(
          fontWeight: FontWeight.w600,
          color: _primary,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        titleTextStyle: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: _textHeading,
        ),
        subtitleTextStyle: TextStyle(
          fontSize: 14,
          color: _textBody,
        ),
      ),
      dividerTheme: DividerThemeData(
        color: Colors.grey.withOpacity(0.15),
        thickness: 1,
      ),
      splashColor: _primary.withOpacity(0.08),
      highlightColor: _primary.withOpacity(0.05),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: _primary,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: _primary.withOpacity(0.14),
        elevation: 8,
        height: 68,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            fontSize: 13,
            fontWeight: states.contains(WidgetState.selected) ? FontWeight.w700 : FontWeight.w500,
            color: states.contains(WidgetState.selected) ? _primary : _textBody,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            size: 24,
            color: states.contains(WidgetState.selected) ? _primary : _textBody.withOpacity(0.7),
          ),
        ),
      ),
      extensions: const <ThemeExtension<dynamic>>[
        _AppThemeExtension(
          primaryDark: _primaryDark,
          surfaceAlt: _surface,
          subtleText: _textBody,
        ),
      ],
    );
  }

  static _AppThemeExtension of(BuildContext context) =>
      Theme.of(context).extension<_AppThemeExtension>() ??
      const _AppThemeExtension(
        primaryDark: _primaryDark,
        surfaceAlt: _surface,
        subtleText: _textBody,
      );
}

class _AppThemeExtension extends ThemeExtension<_AppThemeExtension> {
  const _AppThemeExtension({
    required this.primaryDark,
    required this.surfaceAlt,
    required this.subtleText,
  });

  final Color primaryDark;
  final Color surfaceAlt;
  final Color subtleText;

  @override
  ThemeExtension<_AppThemeExtension> lerp(
    covariant ThemeExtension<_AppThemeExtension>? other,
    double t,
  ) {
    if (other is! _AppThemeExtension) {
      return this;
    }
    return _AppThemeExtension(
      primaryDark: Color.lerp(primaryDark, other.primaryDark, t) ?? primaryDark,
      surfaceAlt: Color.lerp(surfaceAlt, other.surfaceAlt, t) ?? surfaceAlt,
      subtleText: Color.lerp(subtleText, other.subtleText, t) ?? subtleText,
    );
  }

  @override
  _AppThemeExtension copyWith({
    Color? primaryDark,
    Color? surfaceAlt,
    Color? subtleText,
  }) {
    return _AppThemeExtension(
      primaryDark: primaryDark ?? this.primaryDark,
      surfaceAlt: surfaceAlt ?? this.surfaceAlt,
      subtleText: subtleText ?? this.subtleText,
    );
  }
}
