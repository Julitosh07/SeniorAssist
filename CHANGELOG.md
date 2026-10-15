# Changelog - SeniorAssist

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-15

### 🚀 Publicación Inicial / Release de Producción (IEEE 830-1998)

Esta versión representa el lanzamiento oficial de **SeniorAssist**, un Asistente Autónomo por Voz y Tutor de Alfabetización Digital diseñado con accesibilidad cognitiva, visual y motriz extrema para adultos mayores.

### ✨ Added (Nuevas Funcionalidades)
- **RF01 - Llamadas Telefónicas:** Marcado autónomo directo por voz o mediante botón grande con confirmación auditiva.
- **RF02 - Mensajes Asistidos por WhatsApp:** Apertura y precarga de mensajes con formato internacional E.164 (`+57`) y tolerancia a modismos coloquiales.
- **RF03 - Alarmas de Medicamentos y Pastillero:** Programación de recordatorios por voz, sonido de alarma continuo y persistencia en base de datos local SQLite.
- **RF04 - Botón SOS Georreferenciado:** Envío de coordenadas GPS en tiempo real y llamada automática a contacto de emergencia configurado.
- **RF05 - Linterna Inteligente:** Control por voz y botón táctil de alto contraste (#B45309).
- **RF06 - Lupa Digital:** Zoom óptico continuo y función de congelamiento de imagen para lectura asistida.
- **RF07 - Reproductor de Radio AM/FM:** Transmisión de audio en vivo de emisoras nacionales con control de reproducción y pausa por voz.
- **RF08 - Tutor de Alfabetización Digital:** Módulos guiados paso a paso para el aprendizaje de herramientas móviles.
- **RF09 - Simuladores Interactivos:** Entornos de práctica idénticos a WhatsApp y Cámara sin riesgo de enviar mensajes reales.
- **RF10 - Asistente de Voz Omnipresente:** Reconocimiento con palabra de activación (*"Asistente"*) disponible en todas las pantallas y en segundo plano.
- **RF11 - Adaptación Pedagógica con IA:** Ajuste dinámico de dificultad y ritmo de locución según el desempeño del adulto mayor.

### ♿ Accessibility (Pautas WCAG AAA)
- Tipografía mínima base de **18sp**, botones con texto $\ge 22$sp y títulos $\ge 28$sp.
- Botones de acción táctil con altura mínima ergonómica de **64dp** (superando el estándar de 48dp).
- Paletas de alto contraste en modos Claro y Oscuro con soporte de modo daltónico.
- Interacción por voz con pausas prolongadas toleradas y confirmación auditiva inmediata.

### 🔒 Security (Seguridad Criptográfica y JWA)
- Autenticación transparente **Cero-Login (Zero-Login)** basada en identificador único de hardware.
- Implementación de **JWA (RFC 7518)** utilizando el algoritmo criptográfico simétrico **`HS256`** (HMAC-SHA256).
- Almacenamiento de tokens en el **Android Keystore** mediante `expo-secure-store`.
- Lista blanca estricta de acciones (`ALLOWED_ACTIONS`) para prevención de inyecciones de comandos.
- Modo de contingencia local offline (`offline-jwt`) que garantiza operatividad sin conexión a internet.

### 🛠️ Infrastructure & DevOps
- Pipeline de construcción (BUILD) automatizado con Gradle Wrapper y Metro Bundler.
- Pipeline de pruebas continuas (TEST) con 55 pruebas automatizadas (40 cliente, 7 voz, 8 backend).
- Pipeline de release con generación de Checksums SHA-256 inmutables.
- Preparación para despliegue (DEPLOY) en **AWS Elastic Beanstalk (Python 3.10 sin Docker)** y **Firebase App Distribution**.

---
**Artefacto de Entrega:** `SeniorAssist.apk`  
**Hash SHA-256:** `6F82ACB0B6CF9D7ADCDDC2ADA075C7004F712034F68EA7C788A1CE4A0CEFC24E`
