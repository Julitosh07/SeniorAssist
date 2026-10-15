# SeniorAssist

> **Asistente Autónomo por Voz y Tutor de Alfabetización Digital para Adultos Mayores**  
> Proyecto académico para la asignatura **Nuevas Tecnologías de Desarrollo** — UTS.  
> Especificación de Requisitos de Software basada en **IEEE 830-1998**.

---

## 📱 Descripción del Proyecto

**SeniorAssist** es una aplicación móvil desarrollada en **React Native** con arquitectura **MVVM (Model-View-ViewModel)** y un backend intermedio en **FastAPI (Python)**. Su propósito es brindar autonomía a los adultos mayores para comunicarse, gestionar su salud y aprender tecnología mediante una interfaz accesible y comandos de voz naturales (**Push-to-Talk**).

### Características Clave de Accesibilidad y Usabilidad
- **Cero Login Visible**: El usuario abre la app y la usa inmediatamente sin contraseñas ni formularios.
- **Autenticación Transparente JWT**: La sesión entre la app y el backend se negocia de forma invisible mediante identificador único de dispositivo.
- **Asistente Push-to-Talk**: El micrófono solo escucha cuando se mantiene presionado el botón central de voz (no escucha permanente).
- **Lista Blanca de Acciones**: La IA solo puede ejecutar intenciones pre-autorizadas en el cliente (`CALL_CONTACT`, `SEND_WHATSAPP`, `CREATE_ALARM`, `TRIGGER_SOS`, etc.).
- **Diseño de Alto Contraste (WCAG AAA)**: Tipografía mínima de **18sp**, botones táctiles gigantes (mínimo 48x48dp, recomendados 64dp+) y soporte para modo Claro y Oscuro.
- **Operación Offline**: Linterna, lupa, llamadas y alarmas de medicamentos funcionan 100% sin Internet usando SQLite local y APIs nativas de Android.

---

## 🏛️ Arquitectura del Software (MVVM)

```text
SeniorAssist/
├── src/
│   ├── models/                  # Entidades de dominio (Contact, Alarm, Lesson, etc.)
│   ├── views/                   # Pantallas accesibles (Home, SOS, Flashlight, etc.)
│   ├── viewmodels/              # Lógica de presentación desacoplada (useHomeViewModel, etc.)
│   ├── services/                # Servicios de negocio (VoiceService, AuthService, etc.)
│   ├── repositories/            # Acceso a persistencia SQLite
│   ├── components/              # Componentes de accesibilidad (AccessibleButton, PushToTalkButton, etc.)
│   ├── navigation/              # Navegación plana con React Navigation (máximo 2 niveles)
│   ├── hooks/                   # Hooks personalizados (useTheme, etc.)
│   ├── constants/               # Tokens de diseño (theme, typography, actions)
│   └── types/                   # Definiciones de TypeScript
├── backend/                     # API Gateway FastAPI (Python)
│   ├── app/
│   │   ├── main.py              # Entrypoint con endpoint /health y CORS
│   │   └── routers/             # Routers de autenticación, voz y pedagogía
│   └── requirements.txt
├── package.json
└── tsconfig.json
```

---

## 🚀 Puesta en Marcha

### Prerrequisitos
- Node.js (v18+) y npm.
- Python (v3.10+) para el backend.

### 1. Iniciar la Aplicación Móvil
```bash
# Instalar dependencias (ya configuradas)
npm install

# Comprobar tipos TypeScript (0 errores)
npm run typecheck

# Iniciar servidor de desarrollo en navegador web
npm run web

# O iniciar con Expo para Android
npm start
```

### 2. Iniciar el Backend (FastAPI)
```bash
# En una terminal separada dentro de la carpeta backend:
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

---

## 📋 Estado de Fases del Proyecto

- [x] **Fase 1: Base del Proyecto**: Arquitectura MVVM, TypeScript estricto, React Navigation plana, sistema de diseño accesible (WCAG AAA), componentes base, HomeView con Push-to-Talk y permisos Android.
- [x] **Fase 2: Funciones Locales**: SQLite embebido (8 tablas relacionales), Linterna nativa, Lupa digital con cámara (zoom 1x-5x, congelación y alto contraste) y Alarmas de medicamentos (RF03).
- [x] **Fase 3: Comunicación**: Contactos de confianza en SQLite, llamadas directas (RF01), WhatsApp asistido (RF02) y botón SOS de 120dp con GPS y SMS (RF04).
- [x] **Fase 4: Asistente de Voz e IA**: STT/TTS pausado en español, backend FastAPI con JWT transparente, NLU estructurado y lista blanca estricta de acciones.
- [x] **Fase 5: Tutor de Alfabetización Digital**: 4 simuladores interactivos seguros (WhatsApp, Cámara, Galería y Seguridad Digital contra estafas) con IA pedagógica adaptativa (RF08, RF11).
- [x] **Fase 6: Reproductor de Radio**: Emisoras colombianas en streaming en vivo con controles accesibles y verificación de conexión a internet (RF07).
- [x] **Fase 7: Pruebas Integrales y Certificación**: 48/48 pruebas automáticas superadas (40 de cliente/accesibilidad y 8 de backend FastAPI), empaquetado de producción limpio y verificación de permisos.

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto incluye dos suites de pruebas automatizadas:

```bash
# Ejecutar todas las pruebas (Cliente + Accesibilidad + Backend NLU)
npm test

# O ejecutar suites individuales:
npm run test:client   # 40 pruebas de accesibilidad WCAG AAA, permisos y tokens
npm run test:backend  # 8 pruebas de API REST, JWT transparente y lista blanca NLU
npm run typecheck     # Verificación estricta de tipos TypeScript (0 errores)
```

---

## 🗣️ Catálogo de Comandos de Voz Admitidos (Push-to-Talk)

El usuario puede mantener presionado el botón central **"Hablar"** y pronunciar cualquiera de los siguientes comandos naturales:

| Categoría | Comando de Voz de Ejemplo | Acción en el Sistema |
|---|---|---|
| **Llamadas (RF01)** | *"Llama a mi hija María"* / *"Llamar a Carlos"* | Disca directamente al contacto sin marcar números |
| **WhatsApp (RF02)** | *"Escríbele a Carlos que ya llegué"* | Prepara el mensaje en WhatsApp con confirmación previa |
| **Medicamentos (RF03)** | *"Recuérdame tomar Losartán a las ocho de la noche"* | Crea la alarma en SQLite y programa el recordatorio |
| **Emergencia (RF04)** | *"Auxilio"* / *"Emergencia"* / *"Socorro"* | Abre pantalla SOS, obtiene coordenadas GPS y envía alerta |
| **Linterna (RF05)** | *"Prende la linterna"* / *"Apaga la linterna"* | Enciende o apaga el flash LED del dispositivo |
| **Lupa Digital (RF06)** | *"Abre la lupa"* / *"Agrandar texto"* | Abre la cámara trasera con controles de zoom y alto contraste |
| **Radio en Vivo (RF07)** | *"Pon Radio Nacional"* / *"Pon Caracol"* | Sintoniza la emisora en streaming con audio en vivo |
| **Radio Controles** | *"Pausar la radio"* / *"Sube el volumen"* / *"Baja el volumen"* | Controla la reproducción y el volumen del audio |
| **Aprender (RF08, RF11)**| *"Quiero aprender WhatsApp"* / *"Aprender a usar la cámara"* | Abre directamente el simulador interactivo guiado |
| **Seguridad Digital** | *"Quiero aprender seguridad"* / *"Evitar estafas"* | Abre el simulador de detección de engaños y falsos premios |

---

## 🔒 Seguridad y Privacidad (IEEE 830)

1. **Sin Escucha Permanente**: El micrófono solo se abre físicamente mientras el usuario presiona el botón Push-to-Talk.
2. **Cero Login Visible**: El adulto mayor no tiene que recordar ni ingresar ningún usuario ni contraseña. Se genera un `device_id` seguro persistido en `expo-secure-store`.
3. **Lista Blanca de Acciones (Action Whitelist)**: Solo se ejecutan acciones explícitamente autorizadas; cualquier comando malicioso o fuera de alcance es rechazado por el backend y por el cliente.
4. **Resiliencia Offline**: En caso de pérdida de señal, las funciones locales críticas (linterna, lupa, llamadas, alarmas, SOS) operan 100% autónomas mediante SQLite local.

---

## 📊 Matriz de Cumplimiento de Requisitos IEEE 830-1998

| Requisito | Descripción | Estado | Implementación |
|---|---|---|---|
| **RF01** | Llamadas telefónicas directas | ✅ Cumplido | `CallService.ts`, `ContactRepository.ts` |
| **RF02** | Mensajería asistida WhatsApp | ✅ Cumplido | `WhatsAppService.ts` con verificación |
| **RF03** | Alarmas de medicamentos | ✅ Cumplido | `AlarmService.ts`, `AlarmRepository.ts` |
| **RF04** | Botón SOS con GPS y SMS | ✅ Cumplido | `SOSService.ts`, `GPSService.ts`, `SOSView.tsx` |
| **RF05** | Linterna accesible | ✅ Cumplido | `FlashlightService.ts`, `FlashlightView.tsx` |
| **RF06** | Lupa digital de alto contraste | ✅ Cumplido | `MagnifierService.ts`, `MagnifierView.tsx` |
| **RF07** | Reproductor de radio en streaming | ✅ Cumplido | `RadioService.ts`, `RadioView.tsx` |
| **RF08** | Tutor de alfabetización digital | ✅ Cumplido | `LearningView.tsx`, `SimulatorView.tsx` |
| **RF09** | Asistente de voz Push-to-Talk | ✅ Cumplido | `VoiceService.ts`, `PushToTalkButton.tsx` |
| **RF10** | Autenticación JWT transparente | ✅ Cumplido | `AuthService.ts`, `backend/app/routers/auth.py` |
| **RF11** | Adaptación pedagógica por IA | ✅ Cumplido | `PedagogyService.ts`, `POST /learning/analyze` |
| **RNF01** | Accesibilidad WCAG AAA ($\ge$ 18sp, $\ge$ 48-64dp) | ✅ Cumplido | `theme.ts`, `typography.ts`, componentes base |
| **RNF02** | Navegación plana ($\le$ 2 niveles) | ✅ Cumplido | `AppNavigator.tsx` |
| **RNF03** | Funcionamiento Offline-first | ✅ Cumplido | SQLite embebido y fallbacks locales |
