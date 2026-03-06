import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Light Theme Colors
  static const Color primaryDefault = Color(0xFF262626);
  static const Color primaryLight = Color(0xFF404040);
  static const Color primaryDark = Color(0xFF171717);
  static const Color primaryForeground = Color(0xFFFAFAFA);

  static const Color secondaryDefault = Color(0xFF737373);
  static const Color secondaryLight = Color(0xFFA3A3A3);
  static const Color secondaryDark = Color(0xFF525252);

  static const Color backgroundDefault = Color(0xFFF5F5F5);
  static const Color backgroundLight = Color(0xFFFFFFFF);

  static const Color textPrimary = Color(0xFF262626);
  static const Color textSecondary = Color(0xFF525252);
  static const Color textMuted = Color(0xFF737373);

  static const Color accentSuccess = Color(0xFF15803D);
  static const Color accentWarning = Color(0xFFB45309);
  static const Color accentError = Color(0xFFB91C1C);
  static const Color accentInfo = Color(0xFF1D4ED8);

  static const Color borderColor = Color(0xFFD1D5DB);

  // Dark Theme Colors
  static const Color primaryDarkDefault = Color(0xFFF5F5F5);
  static const Color primaryDarkForeground = Color(0xFF262626);

  static const Color backgroundDarkDefault = Color(0xFF18181B);
  static const Color backgroundDarkLight = Color(0xFF27272A);

  static const Color textDarkPrimary = Color(0xFFF5F5F5);
  static const Color textDarkSecondary = Color(0xFFD4D4D4);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: primaryDefault,
    scaffoldBackgroundColor: backgroundDefault,
    colorScheme: const ColorScheme.light(
      primary: primaryDefault,
      onPrimary: primaryForeground,
      secondary: secondaryDefault,
      onSecondary: Colors.white,
      surface: backgroundLight,
      onSurface: textPrimary,
      error: accentError,
    ),
    textTheme: GoogleFonts.interTextTheme().copyWith(
      displayLarge: GoogleFonts.inter(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: textPrimary,
      ),
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        color: textPrimary,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        color: textSecondary,
      ),
    ),
    dividerTheme: const DividerThemeData(
      color: borderColor,
      thickness: 1,
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: primaryDarkDefault,
    scaffoldBackgroundColor: backgroundDarkDefault,
    colorScheme: const ColorScheme.dark(
      primary: primaryDarkDefault,
      onPrimary: primaryDarkForeground,
      secondary: secondaryLight,
      onSecondary: Colors.black,
      surface: backgroundDarkLight,
      onSurface: textDarkPrimary,
      error: Color(0xFFF87171),
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
      displayLarge: GoogleFonts.inter(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: textDarkPrimary,
      ),
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        color: textDarkPrimary,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        color: textDarkSecondary,
      ),
    ),
    dividerTheme: const DividerThemeData(
      color: Color(0xFF3F3F46),
      thickness: 1,
    ),
  );

  static InputDecoration inputDecoration(String label, {IconData? prefixIcon}) {
    return InputDecoration(
      labelText: label,
      alignLabelWithHint: true,
      prefixIcon: prefixIcon != null ? Icon(prefixIcon, size: 20) : null,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderColor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryDefault, width: 2),
      ),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }
}
