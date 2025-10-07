/**
 * Color palette for AnbarYar inventory app
 * Persian-friendly design with RTL support
 */

export const Colors = {
  // Primary Colors
  primary: '#0072FF',        // Neon Blue
  primaryLight: '#4DB8FF',   // Lighter neon blue
  primaryDark: '#0056CC',    // Darker neon blue
  
  // Secondary Colors
  secondary: '#F7F8FA',      // Light grayish white
  secondaryDark: '#E8EAED',  // Slightly darker gray
  
  // Text Colors
  text: '#1A1A1A',          // Deep black
  textSecondary: '#6B7280', // Gray text
  textLight: '#9CA3AF',     // Light gray text
  
  // Status Colors
  success: '#2ECC71',        // Green
  error: '#E74C3C',          // Red
  warning: '#F39C12',        // Orange
  info: '#3498DB',           // Blue
  
  // Background Colors
  background: '#F7F8FA',     // Main background
  surface: '#FFFFFF',        // Card/Modal background
  surfaceElevated: '#FFFFFF', // Elevated surface
  
  // Border Colors
  border: '#E5E7EB',         // Light border
  borderFocus: '#0072FF',    // Focus border
  borderError: '#E74C3C',    // Error border
  
  // Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowLarge: 'rgba(0, 0, 0, 0.2)',
} as const;

/**
 * Theme configuration for light/dark mode
 */
export const Theme = {
  light: {
    ...Colors,
    background: Colors.background,
    surface: Colors.surface,
    text: Colors.text,
    textSecondary: Colors.textSecondary,
  },
  dark: {
    ...Colors,
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
  },
} as const;

/**
 * Status color mapping for drug differences
 */
export const StatusColors = {
  shortage: Colors.error,      // Red for shortage
  surplus: Colors.success,     // Green for surplus
  exact: Colors.textSecondary, // Gray for exact match
  uncounted: Colors.warning,   // Orange for uncounted
} as const;
