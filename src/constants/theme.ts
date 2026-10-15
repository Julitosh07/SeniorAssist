export interface ColorPalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  
  // Acciones principales con alto contraste (WCAG AAA)
  primary: string;         // Azul primario de alto contraste
  primaryContrast: string;
  
  emergency: string;       // Rojo SOS
  emergencyContrast: string;
  
  flashlight: string;      // Amarillo linterna
  flashlightContrast: string;
  
  magnifier: string;       // Cian/Azul lupa
  magnifierContrast: string;
  
  radio: string;           // Morado radio
  radioContrast: string;
  
  learning: string;        // Verde tutor
  learningContrast: string;
  
  alarms: string;          // Naranja alarmas
  alarmsContrast: string;

  // Estados
  success: string;
  warning: string;
  error: string;
  listening: string;
}

export const lightTheme: ColorPalette = {
  background: '#F8FAFC',       // Slate 50
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',  // Slate 100
  textPrimary: '#0F172A',      // Slate 900 (Contraste 15:1 sobre fondo claro)
  textSecondary: '#334155',    // Slate 700
  border: '#CBD5E1',           // Slate 300

  primary: '#1D4ED8',          // Azul fuerte
  primaryContrast: '#FFFFFF',
  
  emergency: '#DC2626',        // Rojo brillante
  emergencyContrast: '#FFFFFF',
  
  flashlight: '#B45309',       // Ámbar oscuro legible
  flashlightContrast: '#FFFFFF',
  
  magnifier: '#0369A1',        // Azul cielo oscuro
  magnifierContrast: '#FFFFFF',
  
  radio: '#6D28D9',           // Púrpura profundo
  radioContrast: '#FFFFFF',
  
  learning: '#047857',        // Verde esmeralda profundo
  learningContrast: '#FFFFFF',
  
  alarms: '#C2410C',          // Naranja quemado legible
  alarmsContrast: '#FFFFFF',

  success: '#15803D',
  warning: '#A16207',
  error: '#B91C1C',
  listening: '#2563EB',
};

export const darkTheme: ColorPalette = {
  background: '#090D16',       // Negro azabache para máximo contraste
  surface: '#1E293B',          // Slate 800
  surfaceElevated: '#334155',  // Slate 700
  textPrimary: '#FFFFFF',      // Blanco puro (Contraste 18:1 sobre fondo oscuro)
  textSecondary: '#E2E8F0',    // Slate 200
  border: '#475569',           // Slate 600

  primary: '#3B82F6',
  primaryContrast: '#000000',
  
  emergency: '#EF4444',        // Rojo accesible
  emergencyContrast: '#FFFFFF',
  
  flashlight: '#FBBF24',       // Amarillo cálido
  flashlightContrast: '#000000',
  
  magnifier: '#38BDF8',        // Celeste
  magnifierContrast: '#000000',
  
  radio: '#A78BFA',           // Lavanda brillante
  radioContrast: '#000000',
  
  learning: '#34D399',        // Verde menta
  learningContrast: '#000000',
  
  alarms: '#FB923C',          // Naranja accesible
  alarmsContrast: '#000000',

  success: '#22C55E',
  warning: '#FACC15',
  error: '#F87171',
  listening: '#60A5FA',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 9999,
};
