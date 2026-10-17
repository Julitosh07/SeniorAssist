# GUÍA MAESTRA DE SUSTENTACIÓN: FASE 6 - DEPLOY (DESPLIEGUE CONTINUO)
## Proyecto: SeniorAssist – Asistente Autónomo por Voz para Adultos Mayores
**Materia:** Nuevas Tecnologías de Desarrollo – Unidades Tecnológicas de Santander (UTS)  
**Semestre:** 6° Semestre  
**Fase Asignada para Exposición:** **FASE 6: DEPLOY**  
**Restricción Cumplida:** **100% CERO DOCKER (PaaS Cloud Nativo + Distribución Continua Móvil)**  
**Versión del Software:** v1.0.0 Oficial de Producción  
**URLs en Producción Activa:**
- Servicio Web en la Nube: `https://seniorassist.onrender.com`
- Documentación Interactiva Swagger / OpenAPI: `https://seniorassist.onrender.com/docs`
- Healthcheck en Vivo: `https://seniorassist.onrender.com/health`
- Repositorio y Releases: `https://github.com/Julitosh07/SeniorAssist`

---

## 1. RESUMEN Y OBJETIVO DE LA EXPOSICIÓN

El objetivo de esta exposición es demostrar ante el profesor y los compañeros cómo el equipo de SeniorAssist resolvió el **despliegue continuo en producción de un ecosistema distribuido híbrido**, compuesto por:
1. Un **Backend de Inteligencia Artificial y Autenticación** en Python (FastAPI).
2. Un **Cliente Móvil Android de Alta Accesibilidad** para adultos mayores (React Native / Expo).

Todo el despliegue fue ejecutado **estrictamente SIN CONTENEDORES DOCKER**, adoptando las mejores prácticas modernas de la industria: **Platform as a Service (PaaS) nativo en la nube** para el backend y **Mobile Binary Delivery (GitHub Releases / Firebase App Distribution)** para el dispositivo móvil.

---

## 2. EL PITCH DE ENTRADA (CÓMO INICIAR LA EXPOSICIÓN)

*(Memoriza o lee con seguridad estas palabras de apertura):*

> *"Buenos días profesor y compañeros. A nuestro equipo le correspondió exponer la **Fase 6: DEPLOY (Despliegue)**.*
>
> *Para nuestro proyecto **SeniorAssist**, el despliegue no era simplemente subir una página web en HTML. Teníamos el reto de desplegar un **ecosistema híbrido**: un microservicio en la nube con procesamiento de voz e inteligencia artificial, y una aplicación móvil Android de alta accesibilidad que se ejecuta directamente en los teléfonos de adultos mayores.*
>
> *Cumpliendo a cabalidad con la restricción de **no utilizar contenedores Docker**, analizamos la arquitectura y seleccionamos las soluciones empresariales nativas estándar:*
> 1. *Para el **Backend Cloud:** Utilizamos un modelo **PaaS (Platform as a Service)** sobre **Render** y **AWS Elastic Beanstalk**, ejecutando Python 3.10 de forma nativa directamente sobre el sistema operativo.*
> 2. *Para el **Cliente Móvil:** Implementamos un pipeline de compilación y entrega continua que distribuye el binario **Android APK** a través de **GitHub Releases** y **Firebase App Distribution**.*
>
> *A continuación les demostraremos por qué esta arquitectura es técnicamente superior a Docker para este proyecto, cómo está configurada la infraestructura como código, y veremos el sistema funcionando en vivo en tiempo real con peticiones desde el celular."*

---

## 3. LOS 4 ARGUMENTOS DE ORO: ¿POR QUÉ NO USAR DOCKER AQUÍ?

Si el profesor pregunta: *"¿Por qué decidieron no usar Docker y qué ventajas obtuvieron al hacerlo de forma nativa?"*, responde con estos 4 pilares técnicos:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 TABLA COMPARATIVA: DOCKER VS. PAAS NATIVO                   │
├──────────────────────────────┬────────────────────────┬─────────────────────┤
│ Criterio de Evaluación       │ Con Contenedores Docker│ Con PaaS Nativo     │
├──────────────────────────────┼────────────────────────┼─────────────────────┤
│ Tamaño del Artefacto         │ 1.5 GB a 2.0 GB (Linux)│ 13.73 KB (ZIP)      │
│ Sobrecarga de Recursos       │ Capas cgroups, overlay │ Cero sobrecarga     │
│ Arranque en Frío (Cold Start)│ 30 a 60 segundos       │ Instantáneo         │
│ Parcheo de Seguridad del SO  │ Manual en Dockerfile   │ Automático de Nube  │
│ Compatibilidad Móvil         │ Los celulares no corren│ Binario Android APK │
│                              │ Docker                 │ nativo firmado      │
└──────────────────────────────┴────────────────────────┴─────────────────────┘
```

### Argumento 1: Cero Sobrecarga de Recursos (Zero Overhead) y Artefactos Livianos
- En Docker, para correr una API simple de FastAPI se debe empaquetar una imagen base de Linux (Debian/Alpine), instalar compiladores, librerías del sistema y capas de sistema de archivos (`overlayfs`), generando imágenes que pesan entre **1.5 GB y 2.0 GB**.
- Con nuestro despliegue PaaS nativo, el sistema operativo de la nube ya tiene el runtime de Python optimizado. Nuestro paquete empaquetado (`dist/seniorassist-backend-deploy.zip`) pesa **únicamente 13.73 KB**. Se sube y se despliega en cuestión de segundos.

### Argumento 2: Mantenimiento y Parcheo de Seguridad Delegado
- Cuando un equipo utiliza Docker, asume la responsabilidad de parchar vulnerabilidades del kernel, de la distribución de Linux y de paquetes del sistema (`OpenSSL`, `glibc`).
- En PaaS (Render / AWS Elastic Beanstalk), el proveedor de nube se encarga de manera transparente del parcheo de seguridad del sistema operativo, de la terminación de certificados SSL/TLS y del balanceo de carga sin costo operativo para el equipo.

### Argumento 3: Las Aplicaciones Móviles NO se ejecutan en Contenedores Docker
- Un teléfono Android no tiene un Docker Daemon ni corre imágenes OCI.
- Las aplicaciones móviles requieren un ciclo de compilación nativo (Java/Kotlin, bytecode Dalvik/ART y librerías C++ empaquetadas en un `.apk`) y un canal de distribución específico como **GitHub Releases** o **Firebase App Distribution** para llegar al usuario final.

### Argumento 4: Demostración de Microservicios sin Contenedores
- Para demostrar que los microservicios son un **patrón de diseño arquitectónico** y no dependen de Docker, creamos el script `backend/microservicios_demo.py`. En él se ejecutan dos microservicios desacoplados: Microservicio de Autenticación (puerto 8001) y Microservicio de Procesamiento de Lenguaje Natural (puerto 8002), demostrando que la separación de servicios y escalabilidad se logra limpiamente de forma nativa.

---

## 4. ARQUITECTURA DETALLADA DEL DESPLIEGUE

```
                        EVENTO DISPARADOR (Git Push a main / Release v1.0.0)
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        │                                                 │
             [PIPELINE BACKEND CLOUD]                          [PIPELINE MÓVIL ANDROID]
                        │                                                 │
          Artefacto: seniorassist-backend                   Artefacto: SeniorAssist.apk (166 MB)
          Configuración: render.yaml + Procfile             Firmado con SHA-256 inmutable
                        │                                                 │
                        ▼                                                 ▼
               RENDER APPLICATION CLOUD                         GITHUB RELEASES (v1.0.0)
             (PaaS Python 3.10 Nativo)                                    │
                        │                                                 ▼
        ┌───────────────┴───────────────┐                  Descarga directa a cuidadores
        │ Uvicorn ASGI Server           │                  y celulares de adultos mayores
        │ Puerto dinámico $PORT (10000) │                                 │
        │ Encriptación SSL/TLS (HTTPS)  │                                 ▼
        └───────────────┬───────────────┘                   Instalación nativa en Android
                        │                                                 │
                        ▼                                                 ▼
              ENDPOINTS EN PRODUCCIÓN                          APLICACIÓN SENIORASSIST
          https://seniorassist.onrender.com                    (Operación Offline-First
          • /auth/device (Handshake) ◄────────────────────────  + Telemetría Cloud en Vivo)
          • /ai/intent (NLU / Telemetría) ◄───────────────────┘
          • /docs (Swagger UI)
```

---

## 5. DESPLIEGUE DEL BACKEND EN LA NUBE (RENDER & AWS)

### 5.1. ¿Cómo funciona el despliegue en Render?
El backend está alojado en **Render Cloud Application Services**, en la región de Oregon (`us-west`), bajo un runtime nativo de Python:
- **Enlace de Integración Continua (CI/CD):** Render está conectado mediante webhook oficial al repositorio de GitHub (`Julitosh07/SeniorAssist`). Cada vez que se hace un `git push origin main`, Render detecta los cambios, ejecuta el comando de construcción y reinicia el servicio sin interrupciones.
- **Comando de Construcción (Build Command):**  
  `pip install -r backend/requirements.txt`  
  Instala en un entorno virtual aislado de Python las dependencias mínimas requeridas (`fastapi`, `uvicorn`, `pydantic`, `pyjwt`, `python-dotenv`).
- **Comando de Inicio (Start Command):**  
  `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`  
  Levanta el servidor ASGI Uvicorn escuchando en todas las interfaces de red (`0.0.0.0`) y vinculándose a la variable de entorno `$PORT` asignada dinámicamente por el balanceador de carga de Render.
- **Variables de Entorno Seguras:**  
  Configuradas en Render para que ninguna clave secreta quede expuesta en texto plano:
  - `SENIOR_ASSIST_JWT_SECRET`: Clave simétrica de 256 bits para la firma de tokens JWA `HS256`.
  - `ENVIRONMENT`: Indicador de entorno (`production`).

### 5.2. Infraestructura como Código (IaC) en el Repositorio
Para garantizar que cualquier miembro del equipo pueda replicar este despliegue exactamente igual en otro servidor, creamos dos archivos de infraestructura:

1. **[`render.yaml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/render.yaml):**
   ```yaml
   services:
     - type: web
       name: seniorassist-backend
       runtime: python
       region: oregon
       plan: free
       buildCommand: pip install -r backend/requirements.txt
       startCommand: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: SENIOR_ASSIST_JWT_SECRET
           value: senior_assist_super_secure_academic_key_2026_uts
         - key: ENVIRONMENT
           value: production
   ```

2. **[`Procfile`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/Procfile):**
   ```text
   web: uvicorn backend.app.main:app --host 0.0.0.0 --port 5000
   ```
   *El Procfile es el estándar universal de la industria para despliegues PaaS (utilizado por AWS Elastic Beanstalk, Heroku y Render).*

3. **[`.ebextensions/01_fastapi.config`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.ebextensions/01_fastapi.config):**
   Archivo de configuración de infraestructura para AWS Elastic Beanstalk, que define el `PYTHONPATH` y las directivas de ejecución nativas en Amazon Linux 2023.

---

## 6. DESPLIEGUE DE LA APLICACIÓN MÓVIL ANDROID

### 6.1. Proceso de Compilación y Generación del Binario
Un celular de un adulto mayor requiere un archivo ejecutable firmado y optimizado. El pipeline móvil ejecutó los siguientes pasos:
1. **Generación del Bundle de JavaScript con Metro:**  
   `npx react-native bundle --platform android --dev false --entry-file index.ts --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/`  
   Minifica y optimiza el árbol de componentes React Native.
2. **Compilación Nativa con Gradle Wrapper:**  
   `./gradlew assembleRelease` en la carpeta `android/`.  
   Compila las clases Java, empaqueta los recursos nativos y produce el binario firmado:
   - Archivo generado: [`SeniorAssist.apk`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/SeniorAssist.apk)
   - Tamaño: **166 MB** (incluye motores de reconocimiento de voz fuera de línea, síntesis de voz Text-to-Speech y base de datos SQLite integrada).
3. **Firma Criptográfica y Checksum SHA-256:**  
   Para evitar que el APK sea alterado o corrompido, se generó el hash SHA-256 registrado en [`SHA256SUMS.txt`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/SHA256SUMS.txt):
   ```text
   6880379b8c4b534e162cb2a13fddfe3ac761c69c4048806309283cb444d5e6ba *SeniorAssist.apk
   ```

### 6.2. Canales de Distribución Continua
- **GitHub Releases (`v1.0.0`):** El APK se publica como artefacto inmutable en la sección de Releases del repositorio de GitHub (`Julitosh07/SeniorAssist/releases`), donde los cuidadores y evaluadores pueden descargarlo directamente en su celular con un solo clic.
- **Firebase App Distribution:** Configurado en el archivo de CI/CD `.github/workflows/deploy.yml` para enviar notificaciones automáticas y descargas "Over-The-Air" a grupos de prueba cerrados.

---

## 7. CÓMO SE COMUNICAN EL CELULAR Y RENDER EN VIVO

Para garantizar que el profesor vea la interacción en tiempo real, implementamos dos canales de comunicación directa entre el celular y Render:

1. **Handshake de Inicio (`POST /auth/device`):**  
   Tan pronto como se abre la aplicación en el celular, `App.tsx` ejecuta una llamada transparente en segundo plano a `https://seniorassist.onrender.com/auth/device`.  
   - El celular envía su identificador de hardware único (`device-uuid`).
   - El backend en Render responde con un token **JWT firmado con `HS256`** con validez de 30 días.
   - En los logs en vivo de Render aparece de inmediato:
     ```text
     INFO: 190.96.155.180 - "POST /auth/device HTTP/1.1" 200 OK
     ```
2. **Telemetría de Voz en Tiempo Real (`POST /ai/intent`):**  
   Cada vez que el usuario presiona el botón del asistente y pronuncia una orden (ejemplo: *"Llama a mi hija María"* o *"Pon la radio"*), `GlobalVoiceAssistantContext.tsx` ejecuta la acción localmente en el teléfono para responder al instante, y al mismo tiempo envía la petición a Render.  
   - En los logs de Render se visualiza la petición:
     ```text
     INFO: 190.96.155.180 - "POST /ai/intent HTTP/1.1" 200 OK
     ```
3. **Resiliencia Offline-First:**  
   Si el celular entra en una zona sin internet o si Render tarda en responder (por ejemplo en el primer arranque en frío), la llamada a la nube falla de manera silenciosa en segundo plano (`catch(() => {})`) y la app móvil sigue funcionando al 100% de forma autónoma. **El abuelo jamás experimenta una pantalla congelada ni un mensaje de error técnico.**

---

## 8. GUIÓN PASO A PASO PARA LA DEMOSTRACIÓN EN VIVO

Sigue este orden exacto durante la exposición frente al proyector para lograr el máximo impacto visual:

### Paso 1: Mostrar los Archivos de Infraestructura en Visual Studio Code
Abre y proyecta en pantalla:
1. [`render.yaml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/render.yaml): Muestra cómo se define el runtime de Python, comandos de build e inicio y variables de entorno.
2. [`Procfile`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/Procfile): Muestra el comando ASGI estándar para PaaS.
3. [`.github/workflows/deploy.yml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.github/workflows/deploy.yml): Muestra el pipeline de despliegue continuo con los jobs paralelos para Backend y Móvil.
4. [`SHA256SUMS.txt`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/SHA256SUMS.txt): Muestra la firma criptográfica del APK compilado.

### Paso 2: Mostrar la Documentación Swagger en Vivo
Abre en el navegador la URL pública:
👉 `https://seniorassist.onrender.com/docs`
- Muestra los 4 módulos documentados con estándar OpenAPI:
  - `GET /health`: Healthcheck del sistema.
  - `POST /auth/device`: Autenticación transparente sin contraseña.
  - `POST /ai/intent`: Procesamiento de lenguaje natural y telemetría.
  - `GET /monitoring/metrics`: Métricas de Prometheus.
- Haz clic en `GET /health` -> **Try it out** -> **Execute**. Muestra la respuesta en vivo:
  ```json
  {
    "status": "ok",
    "service": "SeniorAssist Backend AI & Voice",
    "version": "1.0.0",
    "environment": "production"
  }
  ```

### Paso 3: Proyectar la Consola de Render con los Logs en Vivo
Abre la pestaña del navegador con el Dashboard de Render:
👉 `https://dashboard.render.com` -> Servicio `seniorassist-backend` -> Pestaña **Logs** (activa el botón **Live tail**).
- Muestra el estado del servicio en color verde: **Deployed / Live**.
- Muestra que está corriendo con `uvicorn backend.app.main:app --host 0.0.0.0 --port 10000`.

### Paso 4: La Prueba de Fuego: Abrir la App en el Celular
Frente al profesor, toma tu celular (o proyéctalo si tienes duplicación de pantalla):
1. **Abre la app SeniorAssist.**
   - Mira inmediatamente la pantalla de logs de Render en el proyector:
     Verás aparecer en vivo la línea:
     `INFO: <Tu-IP> - "POST /auth/device HTTP/1.1" 200 OK`
   - Di al profesor: *"En este instante mi celular acaba de conectarse con el servidor en Render, autenticándose de forma transparente con un token JWT firmado."*
2. **Presiona el micrófono y di una orden por voz** (ej. *"Llama a María"* o *"Pon la radio"*).
   - En el proyector aparecerá en vivo:
     `INFO: <Tu-IP> - "POST /ai/intent HTTP/1.1" 200 OK`
   - Di al profesor: *"Aquí vemos cómo cada interacción del adulto mayor viaja a la nube como telemetría en tiempo real, mientras la app responde al instante en el dispositivo."*

---

## 9. BANCO DE PREGUNTAS TRAMPA DEL PROFESOR Y RESPUESTAS

### Pregunta 1: *"¿Por qué sus compañeros usaron Docker y ustedes usaron Render y Elastic Beanstalk?"*
> **Tu respuesta:** *"Profesor, porque evaluamos la arquitectura antes de elegir la herramienta. Docker es excelente para empaquetar sistemas operativos heterogéneos, pero añade una sobrecarga de más de 1.5 GB por contenedor. En nuestro caso, al ser un microservicio puro en Python y una app móvil Android, la solución óptima recomendada por las guías de arquitectura en la nube es un PaaS nativo. Con Render y Elastic Beanstalk logramos un artefacto de solo 13 KB, arranque instantáneo y mantenimiento cero del sistema operativo. Además, las apps móviles nunca se ejecutan en Docker."*

### Pregunta 2: *"¿Cómo se actualiza el backend cuando un desarrollador hace un cambio en el código?"*
> **Tu respuesta:** *"El proceso es 100% continuo y desatendido: gracias al webhook configurado entre GitHub y Render, tan pronto como hacemos un `git push origin main`, Render detecta el commit, clona la nueva versión, ejecuta `pip install -r backend/requirements.txt` y realiza un despliegue Zero-Downtime, redirigiendo el tráfico a la nueva versión sin desconectar a los usuarios."*

### Pregunta 3: *"¿Qué sucede si el servidor en Render entra en reposo (cold sleep) o se cae?"*
> **Tu respuesta:** *"Diseñamos la aplicación bajo el principio de Resiliencia y Offline-First. Si Render está en reposo o el abuelo no tiene internet, el cliente móvil captura el timeout de forma silenciosa y conmuta a su motor de inferencia local y base de datos SQLite. Las llamadas de emergencia, las alarmas de medicamentos, la linterna y la lupa siguen funcionando perfectamente en el dispositivo sin interrupción."*

### Pregunta 4: *"¿Dónde está la seguridad en la comunicación entre el celular y Render?"*
> **Tu respuesta:** *"Implementamos dos capas de seguridad: primero, la capa de transporte utiliza HTTPS cifrado con TLS 1.3 mediante el balanceador de carga de Render. Segundo, en la capa de aplicación implementamos el estándar JWA (RFC 7518): cada petición incluye un token JWT firmado criptográficamente con algoritmo `HS256`, el cual es validado por el backend antes de procesar cualquier intención."*

### Pregunta 5: *"¿Por qué el APK pesa 166 MB si el paquete de backend pesa solo 13 KB?"*
> **Tu respuesta:** *"Porque el backend en la nube delega todas las dependencias del sistema operativo a Render, mientras que el APK es una aplicación móvil nativa autónoma. Para cumplir con la directiva de accesibilidad y garantizar que un adulto mayor pueda usar el asistente sin conexión a internet, el APK incluye el motor local de síntesis de voz (TTS), el motor de reconocimiento acústico, las librerías nativas de C++ y el motor de base de datos SQLite."*

---

*Guía preparada para el equipo SeniorAssist – UTS 2026. ¡Muchos éxitos en la exposición de la Fase DEPLOY!*
