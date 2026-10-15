import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial',
  }),

  // Escala de tamaños accesible (Mínimo 18sp según especificación del proyecto)
  sizes: {
    caption: 16,     // Notas secundarias
    body: 18,        // Texto base mínimo absoluto (18sp)
    bodyLarge: 20,   // Texto de párrafos destacado
    button: 22,      // Texto en botones táctiles grandes
    subtitle: 22,    // Subtítulos destacados
    title: 24,       // Títulos de secciones secundarias
    header: 28,      // Encabezados de pantallas
    hero: 34,        // Botón Push-to-Talk y alertas críticas
  },

  // Altura de línea amplia para mejorar legibilidad
  lineHeights: {
    caption: 22,
    body: 26,
    bodyLarge: 28,
    button: 30,
    subtitle: 30,
    title: 34,
    header: 38,
    hero: 44,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};
