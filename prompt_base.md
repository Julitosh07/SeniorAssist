# Contexto / Rol

Actúa como un **arquitecto de software senior, desarrollador mobile especializado en React Native, desarrollador backend y especialista en accesibilidad para adultos mayores**.

Debes diseñar y desarrollar una aplicación móvil llamada **SeniorAssist: Asistente Autónomo por Voz y Tutor de Alfabetización Digital para Adultos Mayores**.

El proyecto está orientado académicamente a la materia **Nuevas Tecnologías de Desarrollo** de la Universitaria Tecnológica de Santander (UTS) y debe seguir como referencia el documento de **Especificación de Requisitos de Software basado en IEEE 830-1998** proporcionado para el proyecto.

La aplicación debe estar diseñada específicamente para adultos mayores, priorizando:

* Simplicidad.
* Accesibilidad visual.
* Accesibilidad motriz.
* Accesibilidad cognitiva.
* Interacción mediante voz.
* Botones grandes.
* Alto contraste.
* Navegación sencilla.
* Confirmaciones auditivas.
* Funcionamiento offline para funciones críticas.

El sistema debe implementarse como una **aplicación móvil Android utilizando React Native**.

---

# Consulta / Tarea

Desarrolla la aplicación móvil **SeniorAssist** completa, aplicando una arquitectura **MVVM (Model-View-ViewModel)** y una estructura modular que permita mantener y ampliar el sistema.

La aplicación debe permitir que un adulto mayor utilice funciones importantes de su teléfono mediante una interfaz simplificada y, principalmente, mediante comandos de voz.

El sistema debe integrar:

1. Asistente por voz.
2. Llamadas telefónicas.
3. Mensajes asistidos mediante WhatsApp.
4. Alarmas de medicamentos.
5. Botón SOS con ubicación GPS.
6. Linterna.
7. Lupa digital.
8. Reproductor de radio.
9. Tutor de alfabetización digital.
10. Simuladores interactivos.
11. Adaptación pedagógica mediante IA.

El sistema **NO debe solicitar login al adulto mayor**.

No debe existir una pantalla tradicional de:

* Usuario.
* Contraseña.
* Registro.
* Inicio de sesión.

El usuario debe poder abrir la aplicación y comenzar a utilizarla inmediatamente.

Sin embargo, el sistema debe implementar **JWT para la comunicación segura entre la aplicación y el backend**, utilizando un mecanismo de autenticación transparente para el usuario, por ejemplo un identificador de dispositivo o sesión inicial controlada por la aplicación.

No expongas credenciales, secretos ni claves API dentro del código fuente de React Native.

---

# Especificaciones técnicas

## 1. Frontend móvil

Utiliza:

* React Native.
* JavaScript o TypeScript, preferiblemente TypeScript.
* Arquitectura MVVM.
* React Navigation.
* Componentes reutilizables.
* Hooks.
* Context API o una solución ligera de gestión de estado cuando sea necesaria.
* Persistencia local mediante SQLite.
* Almacenamiento seguro de tokens mediante una solución apropiada para Android.
* APIs nativas de Android cuando sea necesario.
* Permisos de Android correctamente gestionados.

La aplicación debe estar optimizada inicialmente para:

**Android 8.0 / API 26 o superior.**

---

# 2. Arquitectura MVVM

Organiza el proyecto siguiendo claramente:

```text
src/
├── models/
├── views/
├── viewmodels/
├── services/
├── repositories/
├── components/
├── navigation/
├── hooks/
├── utils/
├── constants/
├── storage/
├── native/
└── types/
```

La responsabilidad de cada capa debe estar claramente separada.

### Model

Representa:

* Contactos.
* Medicamentos.
* Alarmas.
* Configuración SOS.
* Lecciones.
* Progreso.
* Eventos de aprendizaje.
* Intenciones de voz.

### View

Contiene:

* Pantallas.
* Componentes visuales.
* Botones.
* Tarjetas.
* Elementos accesibles.

La View no debe contener lógica de negocio compleja.

### ViewModel

Debe encargarse de:

* Estado de las pantallas.
* Validaciones.
* Ejecución de acciones.
* Comunicación entre View y Services.
* Manejo de estados de carga.
* Errores.
* Confirmaciones.
* Integración con comandos de voz.

### Services

Separar servicios como:

```text
VoiceService
AIService
ContactsService
CallService
WhatsAppService
SOSService
GPSService
AlarmService
FlashlightService
MagnifierService
RadioService
LearningService
StorageService
AuthService
```

---

# 3. Interfaz principal

La pantalla principal debe ser extremadamente sencilla.

Debe incluir como mínimo:

### Botón principal

Un botón grande de:

**"Hablar"**

Este botón debe funcionar mediante modelo:

**Push-to-Talk**

El sistema no debe mantener el micrófono escuchando permanentemente.

Al pulsarlo:

1. Se activa el micrófono.
2. Se captura la voz.
3. Se convierte a texto.
4. Se interpreta la intención.
5. Se ejecuta la acción.
6. Se informa al usuario mediante voz.

Ejemplos:

```text
"Llama a mi hija"

"Escríbele a Carlos que ya llegué"

"Recuérdame tomar mi medicamento a las ocho"

"Prende la linterna"

"Abre la lupa"

"Auxilio"

"Pon la radio"
```

---

# 4. Accesibilidad

La accesibilidad es uno de los requisitos principales del proyecto.

Implementa como mínimo:

* Texto base mínimo de 18sp.
* Botones de al menos 48x48dp.
* Alto contraste.
* Tipografía sans-serif.
* Iconos grandes.
* Márgenes amplios.
* Navegación plana.
* Máximo dos niveles de profundidad.
* No depender de gestos complejos.
* No utilizar doble clic como interacción obligatoria.
* Evitar interfaces saturadas.
* Confirmaciones mediante voz.
* Mensajes de error simples.
* Lenguaje comprensible para adultos mayores.

Debe existir soporte para modo:

* Claro.
* Oscuro.

La interfaz debe ser consistente en todas las pantallas.

---

# 5. Asistente de voz

Implementa un flujo:

```text
Usuario
   ↓
Micrófono
   ↓
Speech-to-Text
   ↓
Texto
   ↓
Motor de IA / NLU
   ↓
Intent estructurado
   ↓
ViewModel
   ↓
Service correspondiente
   ↓
Resultado
   ↓
Text-to-Speech
```

El modelo de IA debe transformar comandos naturales en estructuras estructuradas.

Ejemplo:

Entrada:

```text
"Llama a mi hija María"
```

Salida conceptual:

```json
{
  "action": "CALL_CONTACT",
  "parameters": {
    "contact": "hija María"
  }
}
```

Otro ejemplo:

```json
{
  "action": "CREATE_MEDICATION_ALARM",
  "parameters": {
    "medication": "Losartán",
    "time": "20:00",
    "frequency": "daily"
  }
}
```

Nunca permitas que una respuesta arbitraria del modelo de IA ejecute directamente código nativo.

Implementa una **lista blanca de acciones permitidas**.

Por ejemplo:

```text
CALL_CONTACT
SEND_WHATSAPP
CREATE_ALARM
TRIGGER_SOS
TURN_FLASHLIGHT_ON
TURN_FLASHLIGHT_OFF
OPEN_MAGNIFIER
PLAY_RADIO
OPEN_LESSON
```

Si la IA devuelve una acción no permitida, rechazarla.

---

# 6. Inteligencia Artificial

Utiliza un backend intermedio para comunicarse con el proveedor de IA.

No colocar claves privadas de Gemini u otros proveedores directamente en React Native.

Arquitectura:

```text
React Native
      ↓
Backend SeniorAssist
      ↓
API de IA
      ↓
Respuesta estructurada
      ↓
React Native
```

El backend deberá validar:

* JWT.
* Estructura de la solicitud.
* Intención.
* Parámetros.
* Acciones permitidas.

---

# 7. JWT sin login visible

Implementa JWT sin exigir autenticación manual al adulto mayor.

La aplicación puede realizar un proceso inicial transparente:

```text
Instalación
   ↓
Generación/identificación de dispositivo
   ↓
Solicitud de sesión al backend
   ↓
Backend genera JWT
   ↓
Token almacenado de forma segura
   ↓
Aplicación utiliza JWT automáticamente
```

El adulto mayor no debe conocer ni manipular el JWT.

El token nunca debe mostrarse en la interfaz.

Implementa expiración y renovación del token.

---

# 8. Llamadas telefónicas

Implementa RF01.

El usuario debe poder decir:

```text
"Llama a mi hija"
```

El sistema debe:

1. Procesar la orden.
2. Buscar el contacto.
3. Identificar el número.
4. Confirmar mediante voz.
5. Ejecutar la llamada.

Debe existir una alternativa mediante botón grande.

Solicita los permisos necesarios de Android.

Si existen múltiples contactos coincidentes, solicitar confirmación.

---

# 9. WhatsApp

Implementa RF02.

Ejemplo:

```text
"Escríbele a Carlos que ya llegué"
```

La aplicación debe:

1. Identificar destinatario.
2. Obtener número.
3. Construir el enlace correspondiente.
4. Abrir WhatsApp.
5. Precargar el mensaje.
6. Permitir al usuario confirmar antes del envío.

No realizar envíos silenciosos o involuntarios.

Si WhatsApp no está instalado, informar mediante voz y pantalla.

---

# 10. Alarmas de medicamentos

Implementa RF03.

Debe permitir:

```text
"Recuérdame tomar Losartán a las ocho de la noche"
```

Extraer:

* Medicamento.
* Hora.
* Frecuencia.

Guardar la configuración localmente.

Utilizar mecanismos nativos de Android para las alarmas.

La alarma debe funcionar aunque:

* La pantalla esté apagada.
* La aplicación no esté abierta.
* No exista conexión a Internet.

Debe existir una pantalla sencilla para:

* Crear alarma.
* Editar alarma.
* Eliminar alarma.
* Ver próximas alarmas.

---

# 11. SOS

Implementa RF04.

Debe existir un botón SOS extremadamente visible.

También debe responder a comandos como:

```text
"Auxilio"
"Emergencia"
```

Al activarse:

1. Obtener ubicación GPS.
2. Identificar contacto de emergencia.
3. Generar mensaje.
4. Incluir enlace de ubicación.
5. Enviar SMS.
6. Iniciar llamada de emergencia/contacto configurado.
7. Informar mediante voz.

El proceso debe minimizar la cantidad de pasos.

Debe existir confirmación únicamente cuando sea necesaria para evitar activaciones accidentales, pero el flujo de emergencia no debe ser innecesariamente complejo.

---

# 12. Linterna

Implementa RF05.

Comandos:

```text
"Prende la linterna"
"Apaga la linterna"
```

También debe existir un botón grande.

Utiliza APIs nativas de Android mediante una abstracción dentro de:

```text
native/FlashlightModule
```

---

# 13. Lupa digital

Implementa RF06.

Debe utilizar la cámara trasera.

Incluir:

* Zoom.
* Alto contraste.
* Realce de imagen.
* Congelación de imagen.
* Controles grandes.

Debe poder abrirse mediante:

```text
"Abre la lupa"
```

y mediante un botón de acceso rápido.

---

# 14. Radio

Implementa RF07.

Permitir comandos como:

```text
"Pon Radio Nacional"
```

El sistema debe buscar la emisora disponible y reproducirla mediante streaming.

Debe incluir controles simples:

* Reproducir.
* Pausar.
* Subir volumen.
* Bajar volumen.
* Detener.

Si no existe conexión, informar claramente al usuario.

---

# 15. Tutor de alfabetización digital

Implementa RF08.

Debe existir una sección denominada:

**"Aprender"**

Las lecciones deben utilizar simuladores interactivos.

Módulos iniciales:

### WhatsApp

Enseñar:

* Abrir conversación.
* Escribir mensaje.
* Enviar mensaje.
* Nota de voz.
* Videollamada.

### Cámara

Enseñar:

* Abrir cámara.
* Tomar fotografía.
* Revisar fotografía.
* Eliminar fotografía.

### Galería

Enseñar:

* Buscar fotografías.
* Abrir una fotografía.
* Compartir.

### Seguridad digital

Enseñar:

* Identificación de mensajes falsos.
* Estafas.
* Enlaces sospechosos.
* Solicitudes de dinero.
* Suplantación de identidad.
* Llamadas fraudulentas.

---

# 16. Simuladores

Los simuladores no deben ejecutar acciones reales.

Deben representar un entorno controlado.

Ejemplo:

```text
Lección: Enviar una nota de voz

Paso 1:
"Busca el botón del micrófono."

Usuario pulsa botón.

Sistema:
"Correcto. Ahora mantenlo presionado."

Usuario realiza acción.

Sistema:
"Muy bien. Este es el proceso que puedes utilizar en WhatsApp."
```

Si el usuario se equivoca:

```text
"Está bien. Inténtalo nuevamente. Busca el botón con forma de micrófono."
```

No penalizar agresivamente los errores.

---

# 17. IA pedagógica

Implementa RF11.

Registrar:

* Tiempo empleado.
* Errores.
* Reintentos.
* Aciertos.
* Lecciones completadas.
* Pasos donde presenta dificultad.

Con estos datos, adaptar:

* Complejidad.
* Velocidad.
* Cantidad de explicaciones.
* Repeticiones.
* Retroalimentación.

Ejemplo:

Usuario con muchos errores:

```text
Explicación más lenta.
Más instrucciones.
Menos elementos simultáneos.
Más ejemplos.
```

Usuario con buen desempeño:

```text
Menos explicaciones.
Mayor autonomía.
Actividades ligeramente más complejas.
```

La IA no debe tomar decisiones médicas ni realizar diagnósticos.

---

# 18. Persistencia local

Utiliza SQLite para información que debe permanecer disponible sin Internet.

Como mínimo:

```text
contacts
medications
alarms
emergency_contacts
lessons
learning_progress
learning_events
app_settings
device_session
```

Los datos sensibles almacenados localmente deben protegerse mediante cifrado apropiado.

La aplicación debe poder utilizar sin Internet:

* Llamadas.
* Linterna.
* Lupa.
* Alarmas.
* Información local.
* Funciones básicas de navegación.

Las funciones que dependan de IA o servicios externos deben informar cuando no haya conexión.

---

# 19. Backend

Implementa un backend independiente.

Preferiblemente:

```text
Python
FastAPI
JWT
REST API
```

Responsabilidades:

* Autenticación mediante JWT.
* Gestión de sesiones de dispositivos.
* Comunicación con IA.
* Validación de intents.
* Function Calling.
* Procesamiento pedagógico.
* Registro de eventos necesarios.
* Control de seguridad.
* Validación de datos.

Crear endpoints conceptualmente similares a:

```text
POST /auth/device
POST /voice/process
POST /ai/intent
POST /learning/analyze
GET  /learning/lessons
POST /learning/events
GET  /health
```

No exponer directamente las claves de los proveedores externos al cliente móvil.

---

# 20. Seguridad

Aplicar:

* JWT.
* HTTPS.
* TLS.
* Validación de entradas.
* Control de acciones permitidas.
* Protección de secretos.
* Almacenamiento seguro del token.
* Cifrado de información local sensible.
* No guardar grabaciones de voz innecesariamente.
* Push-to-Talk.
* No escuchar permanentemente al usuario.
* Manejo seguro de permisos.

El sistema debe respetar el principio de mínimo privilegio.

Solicitar permisos únicamente cuando una funcionalidad realmente los necesite.

---

# 21. Manejo de errores

Todos los módulos deben tener estados:

```text
loading
success
error
offline
permission_denied
not_available
```

Los errores deben ser entendibles para un adulto mayor.

Evitar mensajes como:

```text
HTTP 403
NullPointerException
Network Error
```

En su lugar:

```text
"No puedo realizar esta acción en este momento."
```

Y mediante voz:

```text
"En este momento no tengo conexión a Internet. Puedes utilizar la linterna y las alarmas."
```

---

# 22. Navegación

La navegación debe ser plana.

Pantalla principal:

```text
SeniorAssist
│
├── Hablar
├── SOS
├── Linterna
├── Lupa
├── Radio
└── Aprender
```

Evitar menús complejos.

Las funciones principales deben estar disponibles con un toque.

---

# 23. Requisitos de rendimiento

Cumplir como objetivos:

* Inicio de aplicación ≤ 1.5 segundos en dispositivos de gama media-baja.
* Activación rápida de herramientas locales.
* Procesamiento de voz ≤ 2.5 segundos en condiciones normales de red.
* Las funciones locales no deben depender de Internet.
* Evitar consumo innecesario de batería.
* No ejecutar escucha permanente.

---

# 24. Estructura esperada del proyecto

Genera una estructura profesional similar a:

```text
SeniorAssist/
│
├── android/
├── src/
│   ├── models/
│   ├── views/
│   │   ├── Home/
│   │   ├── SOS/
│   │   ├── Flashlight/
│   │   ├── Magnifier/
│   │   ├── Radio/
│   │   ├── Learning/
│   │   └── Settings/
│   │
│   ├── viewmodels/
│   ├── services/
│   ├── repositories/
│   ├── components/
│   ├── navigation/
│   ├── hooks/
│   ├── storage/
│   ├── native/
│   ├── utils/
│   ├── constants/
│   └── types/
│
├── backend/
│   ├── app/
│   ├── routers/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── security/
│   └── main.py
│
├── package.json
└── README.md
```

Adapta la estructura si existe una razón técnica justificada para hacerlo.

---

# 25. Metodología de desarrollo

No intentes implementar toda la aplicación de una sola vez.

Trabaja por fases:

### Fase 1 — Base del proyecto

* Crear proyecto React Native.
* Configurar TypeScript.
* Configurar navegación.
* Configurar arquitectura MVVM.
* Crear diseño inicial.
* Crear componentes accesibles.

### Fase 2 — Funciones locales

Implementar:

* Linterna.
* Lupa.
* Alarmas.
* SQLite.

### Fase 3 — Comunicación

Implementar:

* Contactos.
* Llamadas.
* WhatsApp.
* SOS.
* GPS.
* SMS.

### Fase 4 — Voz e IA

Implementar:

* STT.
* TTS.
* Backend FastAPI.
* JWT.
* Procesamiento de intenciones.
* Function Calling.

### Fase 5 — Tutor

Implementar:

* Lecciones.
* Simuladores.
* Registro de progreso.
* Adaptación pedagógica.

### Fase 6 — Radio

Implementar:

* Búsqueda de emisoras.
* Streaming.
* Controles accesibles.

### Fase 7 — Pruebas

Realizar:

* Pruebas unitarias.
* Pruebas de integración.
* Pruebas de permisos.
* Pruebas offline.
* Pruebas de accesibilidad.
* Pruebas de voz.
* Pruebas de errores.
* Pruebas de rendimiento.

---

# 26. Reglas para el desarrollo

Antes de escribir código:

1. Analiza la arquitectura.
2. Identifica dependencias.
3. Define las interfaces entre módulos.
4. Define los modelos.
5. Define los servicios.
6. Define los ViewModels.
7. Define la navegación.
8. Después implementa.

No mezcles lógica de negocio dentro de las Views.

No dupliques código.

No coloques claves API en el frontend.

No implementes autenticación visible para el adulto mayor.

No agregues funcionalidades fuera del alcance sin justificarlo.

No sustituyas las aplicaciones nativas cuando sea mejor integrarse mediante APIs o intents de Android.

No hagas que las funciones críticas dependan innecesariamente del backend.

---

# 27. Criterios de aceptación principales

La aplicación será considerada funcional cuando:

* El adulto mayor pueda abrir la aplicación sin iniciar sesión.
* Pueda activar el asistente mediante Push-to-Talk.
* Pueda realizar una llamada mediante voz.
* Pueda preparar un mensaje de WhatsApp mediante voz.
* Pueda crear una alarma de medicamento.
* Pueda activar SOS.
* SOS pueda obtener la ubicación.
* Pueda activar la linterna.
* Pueda abrir la lupa.
* Pueda reproducir una emisora.
* Pueda acceder a las lecciones.
* Pueda completar simuladores.
* El sistema registre su progreso.
* La IA pueda adaptar las explicaciones.
* Las funciones locales continúen disponibles sin Internet.
* El backend utilice JWT.
* La aplicación no solicite usuario y contraseña.
* La interfaz cumpla los criterios de accesibilidad definidos.
* Los errores sean comprensibles.
* La arquitectura MVVM sea identificable en el código.

---

# 28. Verificación

Después de cada fase:

1. Ejecuta el proyecto.
2. Comprueba que compile.
3. Ejecuta las pruebas disponibles.
4. Verifica errores de TypeScript/JavaScript.
5. Verifica permisos Android.
6. Comprueba la navegación.
7. Comprueba accesibilidad.
8. Comprueba comportamiento offline cuando corresponda.
9. Documenta los cambios.
10. No avances a la siguiente fase si la anterior quedó rota.

Cuando encuentres un error:

```text
1. Identifica la causa.
2. Explica brevemente el problema.
3. Corrige la causa raíz.
4. Ejecuta nuevamente las pruebas.
5. Comprueba que la corrección no rompa otros módulos.
```

No ocultes errores ni utilices soluciones temporales como comentarios, código muerto o valores hardcodeados para simular funcionalidades reales.

---

# Resultado esperado

Quiero obtener un proyecto **SeniorAssist funcional, modular, mantenible y escalable**, desarrollado en React Native y organizado bajo MVVM, con backend FastAPI, autenticación JWT transparente para el usuario, integración con IA, servicios nativos de Android y una interfaz especialmente diseñada para adultos mayores.

El producto debe priorizar la **autonomía del adulto mayor, accesibilidad, seguridad, simplicidad y funcionamiento offline de las funciones críticas**.

Utiliza el documento IEEE 830 proporcionado como referencia principal para mantener consistencia entre la implementación y los requisitos del proyecto.

Comienza por analizar el proyecto y presentar:

1. Arquitectura propuesta.
2. Estructura de carpetas.
3. Tecnologías y dependencias.
4. Flujo de comunicación frontend/backend/IA.
5. Modelo de datos.
6. Plan de implementación por fases.

Después de presentar esa planificación, comienza únicamente con la **Fase 1**, dejando el proyecto en un estado ejecutable antes de continuar.
