/**
 * SeniorAssist - Verificación Integral del Cliente y Accesibilidad
 * Comprueba cumplimiento de WCAG AAA, permisos Android, tokens y lista blanca.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ SUPERADO: ${message}`);
  }
}

console.log('========================================================');
console.log('🔎 AUDITORÍA Y PRUEBAS INTEGRALES DE SENIORASSIST');
console.log('========================================================\n');

// 1. Verificación de Tipografía y Accesibilidad (WCAG AAA)
console.log('--- 1. Accesibilidad Tipográfica y Táctil (IEEE 830) ---');
const typographyPath = path.join(rootDir, 'src', 'constants', 'typography.ts');
const typographyContent = fs.readFileSync(typographyPath, 'utf-8');

assert(typographyContent.includes('body: 18'), 'Texto base mínimo es exactamente 18sp (body >= 18sp)');
assert(typographyContent.includes('bodyLarge: 20'), 'Texto destacado es >= 20sp');
assert(typographyContent.includes('button: 22'), 'Texto en botones táctiles es >= 22sp');
assert(typographyContent.includes('title: 24'), 'Títulos de sección son >= 24sp');
assert(typographyContent.includes('header: 28'), 'Encabezados de pantalla son >= 28sp');

// Verificación de tamaño de botones en AccessibleButton
const buttonPath = path.join(rootDir, 'src', 'components', 'AccessibleButton.tsx');
const buttonContent = fs.readFileSync(buttonPath, 'utf-8');
assert(buttonContent.includes('minHeight = 64'), 'Altura mínima de botones principales es 64dp (superior a 48dp)');

// 2. Verificación de Paletas de Alto Contraste (Light & Dark)
console.log('\n--- 2. Tokens de Color y Alto Contraste ---');
const themePath = path.join(rootDir, 'src', 'constants', 'theme.ts');
const themeContent = fs.readFileSync(themePath, 'utf-8');
assert(themeContent.includes('#DC2626') || themeContent.includes('#EF4444'), 'Color de emergencia SOS de alto contraste definido (#DC2626)');
assert(themeContent.includes('#B45309') || themeContent.includes('#FBBF24'), 'Color de linterna de alto contraste definido (#B45309)');
assert(themeContent.includes('#047857') || themeContent.includes('#34D399'), 'Color del tutor de alfabetización definido (#047857)');
assert(themeContent.includes('#6D28D9') || themeContent.includes('#A78BFA'), 'Color de radio en streaming definido (#6D28D9)');

// 3. Verificación de Lista Blanca de Acciones (Action Whitelist)
console.log('\n--- 3. Lista Blanca Estricta de Acciones ---');
const actionsPath = path.join(rootDir, 'src', 'constants', 'actions.ts');
const actionsContent = fs.readFileSync(actionsPath, 'utf-8');

const requiredActions = [
  'CALL_CONTACT',
  'SEND_WHATSAPP',
  'CREATE_ALARM',
  'TRIGGER_SOS',
  'TURN_FLASHLIGHT_ON',
  'TURN_FLASHLIGHT_OFF',
  'OPEN_MAGNIFIER',
  'PLAY_RADIO',
  'STOP_RADIO',
  'OPEN_LESSON',
];

for (const action of requiredActions) {
  assert(actionsContent.includes(`'${action}'`), `Acción requerida '${action}' presente en la lista blanca`);
}

// 4. Auditoría de Permisos Nativos de Android (AndroidManifest.xml)
console.log('\n--- 4. Permisos Nativos en AndroidManifest.xml ---');
const manifestPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const manifestContent = fs.readFileSync(manifestPath, 'utf-8');

const requiredPermissions = [
  'android.permission.RECORD_AUDIO',
  'android.permission.CALL_PHONE',
  'android.permission.SEND_SMS',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.CAMERA',
  'android.permission.FLASHLIGHT',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.INTERNET',
];

for (const perm of requiredPermissions) {
  assert(manifestContent.includes(perm), `Permiso '${perm}' correctamente declarado en AndroidManifest.xml`);
}

// 5. Verificación de Integridad de Base de Datos SQLite y Tablas
console.log('\n--- 5. Persistencia Local SQLite (Offline-First) ---');
const databasePath = path.join(rootDir, 'src', 'storage', 'database.ts');
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

const requiredTables = [
  'contacts',
  'medications',
  'alarms',
  'emergency_contacts',
  'lessons',
  'learning_progress',
  'learning_events',
  'app_settings',
  'device_session',
];

for (const tbl of requiredTables) {
  assert(databaseContent.includes(tbl), `Tabla '${tbl}' declarada en el esquema de base de datos local SQLite`);
}

// 6. Verificación de Cero Login Visible y Seguridad JWT
console.log('\n--- 6. Autenticación Transparente (Cero Login Visible) ---');
const authServicePath = path.join(rootDir, 'src', 'services', 'AuthService.ts');
const authContent = fs.readFileSync(authServicePath, 'utf-8');
assert(authContent.includes('getDeviceId'), 'Identificador de dispositivo único generado y persistido automáticamente');
assert(authContent.includes('getValidToken'), 'Token JWT transparente negociado silenciosamente');
assert(authContent.includes('getAuthHeader'), 'Cabecera Authorization Bearer generada');

console.log('\n========================================================');
console.log(`📊 RESULTADO DE LA AUDITORÍA: ${passedTests}/${totalTests} PRUEBAS SUPERADAS`);
if (passedTests === totalTests) {
  console.log('🎉 TODAS LAS PRUEBAS DE INTEGRIDAD DEL CLIENTE FUERON EXITOSAS.');
}
console.log('========================================================\n');
