# INFORME TÉCNICO EXHAUSTIVO: CICLO DE VIDA DEVOPS EN 8 FASES
## Proyecto: SeniorAssist – Asistente Autónomo por Voz y Tutor de Alfabetización Digital
**Institución:** Unidades Tecnológicas de Santander (UTS)  
**Materia:** Nuevas Tecnologías de Desarrollo  
**Semestre:** 6°  
**Equipo de Desarrollo:** SeniorAssist DevOps Team  
**Versión de Entrega:** v1.0.0 (Release Oficial de Producción)  
**Fecha:** Octubre 2026  

---

## RESUMEN EJECUTIVO Y ARQUITECTURA GENERAL

**SeniorAssist** es una solución tecnológica integral diseñada para cerrar la brecha digital en adultos mayores mediante una interfaz por voz omnipresente, tutor de alfabetización guiado y herramientas de utilidad diaria (llamadas, WhatsApp asistido, alarmas de medicinas, botón SOS georreferenciado, linterna, lupa digital y radio en vivo).

Desde la perspectiva de Ingeniería de Software y Nuevas Tecnologías, SeniorAssist no es una aplicación aislada, sino un **ecosistema distribuido e híbrido** que consta de dos componentes principales:
1. **Cliente Móvil Android de Alta Accesibilidad:** Desarrollado en React Native con Expo y TypeScript, con diseño ergonómico WCAG 2.1 AAA, persistencia local en SQLite y capacidad de operación **Offline-First** (resiliencia total sin conexión).
2. **Backend Inteligente en la Nube:** Microservicios asíncronos en Python 3.10 con FastAPI, PyJWT y Uvicorn, responsables de la autenticación transparente por hardware (Zero-Login), el motor de procesamiento de lenguaje natural (NLU) estructurado con lista blanca estricta y la telemetría continua.

Para garantizar la calidad, repetibilidad, seguridad y alta disponibilidad de este ecosistema, se implementó un **Ciclo de Vida DevOps completo de 8 fases**, articulado bajo la filosofía *Shift-Left Security* (seguridad desde el diseño) y *Continuous Feedback* (retroalimentación continua).

---

## TABLA RESUMEN DE LAS 8 FASES DEVOPS EN SENIORASSIST

| Fase DevOps | Herramientas Principales | Qué se Creó / Modificó | Archivos Clave en el Repositorio | Cómo Sustentar al Profesor |
| :--- | :--- | :--- | :--- | :--- |
| **1. PLAN** | Jira, GitHub Projects, WCAG 2.1 AAA, IEEE 830 | Especificación de Requisitos (RF01-RF11), Matriz de Trazabilidad, Lista Blanca de Acciones. | `src/constants/actions.ts`, `CHANGELOG.md` | *"DevOps empieza con calidad y seguridad desde el diseño: definimos 11 RFs accesibles y una lista blanca para blindar la IA contra comandos no autorizados."* |
| **2. CODE** | TypeScript, React Native, Python 3.10, FastAPI, PyJWT, Git | Arquitectura MVVM, motor de voz continuo, autenticación Zero-Login (`HS256`), modo Offline-First. | `src/screens/`, `src/context/GlobalVoiceAssistantContext.tsx`, `backend/app/` | *"Separamos responsabilidades entre cliente móvil reactivo y backend asíncrono, garantizando que el abuelo nunca quede bloqueado si falla internet."* |
| **3. BUILD** | Gradle Wrapper, Metro Bundler, Java JDK 17, PowerShell | Compilación del bundle JS, ensamble del binario APK Android y empaquetado del ZIP de backend nativo. | `android/build.gradle`, `.github/workflows/build.yml`, `scripts/build_standalone_apk.ps1` | *"El pipeline de construcción es 100% reproducible: Metro genera el paquete JS optimizado y Gradle compila el APK firmado sin intervención manual."* |
| **4. TEST** | Pytest, TestClient, Node.js runner, Suite de Voz | 56 pruebas automatizadas: 40 de integridad de cliente, 8 de NLU/API backend y 8 de dialectos de voz. | `backend/tests/test_api_suite.py`, `scripts/test_voice_suite.js`, `scripts/verify_client_integrity.js` | *"Aplicamos Continuous Testing: ninguna línea llega a producción sin validar contratos de interfaz, seguridad de tokens y tolerancia a modismos colombianos."* |
| **5. RELEASE** | SemVer 2.0.0, Git Tagging, CertUtil SHA-256, Keep a Changelog | Tag formal `v1.0.0`, manifiesto de cambios estructurado y suma criptográfica SHA-256 inmutable. | `CHANGELOG.md`, `SHA256SUMS.txt`, `.github/workflows/release.yml` | *"La fase de Release garantiza inmutabilidad y trazabilidad: cada APK generado cuenta con un hash criptográfico verificable para evitar alteraciones."* |
| **6. DEPLOY** *(Nuestra Expo)* | Render (PaaS), AWS Elastic Beanstalk, GitHub Releases, Uvicorn | Despliegue PaaS nativo sin Docker en Render, pipeline para AWS y distribución de APK a cuidadores. | `render.yaml`, `Procfile`, `.ebextensions/`, `DEPLOYMENT_DEFENSE_GUIDE.md` | *"Cumplimos la restricción de cero Docker demostrando que PaaS nativo es técnicamente superior: paquete de 13 KB, arranque instantáneo y mantenimiento cero del SO."* |
| **7. OPERATE** | Ansible, Systemd, Nginx, Linux Daemons | Playbooks de automatización, demonios Systemd con auto-reinicio <1s y proxy inverso Nginx con SSL. | `ansible/playbook_operate.yml`, `ansible/templates/seniorassist.service.j2` | *"En DevOps la entrega no termina en el despliegue: Ansible automatiza servidores y Systemd recupera el servicio en menos de 1 segundo si ocurre un fallo."* |
| **8. MONITOR** | Datadog APM, AWS CloudWatch, Prometheus, Telemetry Client | Endpoints de métricas en `/monitoring/metrics`, alarmas de latencia p95 y telemetría de cliente móvil. | `backend/app/routers/monitoring.py`, `monitoring/datadog_agent.yaml`, `MonitoringService.ts` | *"Cerramos el bucle DevOps: monitoreamos latencia y errores de voz en tiempo real; los incidentes alimentan automáticamente el backlog de la fase de PLAN."* |

---

## DESGLOSE DETALLADO FASE POR FASE

```
       ┌───────────────────────────────────────────────────────────┐
       │                 CICLO DE VIDA DEVOPS SENIORASSIST         │
       └───────────────────────────────────────────────────────────┘
               ┌──────────┐      ┌──────────┐      ┌──────────┐
               │ 1. PLAN  │ ───► │ 2. CODE  │ ───► │ 3. BUILD │
               └──────────┘      └──────────┘      └──────────┘
                    ▲                                   │
                    │                                   ▼
               ┌──────────┐                        ┌──────────┐
               │8. MONITOR│                        │ 4. TEST  │
               └──────────┘                        └──────────┘
                    ▲                                   │
                    │                                   ▼
               ┌──────────┐      ┌──────────┐      ┌──────────┐
               │7. OPERATE│ ◄─── │6. DEPLOY │ ◄─── │5.RELEASE │
               └──────────┘      └──────────┘      └──────────┘
```

---

### FASE 1: PLAN (PLANIFICACIÓN Y REQUISITOS)

#### 1. ¿Qué se planificó y se definió?
Se establecieron los requisitos funcionales y no funcionales basados en la norma internacional **IEEE 830-1998** y los estándares de accesibilidad **WCAG 2.1 nivel AAA**. Se definieron 11 Requerimientos Funcionales (RF01 a RF11):
- **RF01:** Marcación y llamadas telefónicas asistidas con confirmación auditiva.
- **RF02:** Redacción y precarga de WhatsApp con formato telefónico internacional E.164.
- **RF03:** Recordatorios y pastillero digital con alarmas sonoras continuas y base de datos SQLite.
- **RF04:** Botón SOS con coordenadas GPS y llamada automática a contacto de emergencia.
- **RF05 - RF07:** Herramientas utilitarias: linterna de alto contraste, lupa digital con congelamiento de imagen y radio nacional AM/FM.
- **RF08 - RF09:** Tutor pedagógico y simuladores interactivos de WhatsApp y Cámara sin riesgo.
- **RF10 - RF11:** Asistente de voz omnipresente y adaptación pedagógica dinámica con IA.

Se implementó el principio de **Shift-Left Security**: definir desde el primer día una **Lista Blanca de 16 Acciones Estrictas (`ALLOWED_ACTIONS`)** para impedir que un comando de voz desconocido o ambiguo ejecute operaciones peligrosas en el dispositivo.

#### 2. Herramientas Utilizadas
- **Jira & GitHub Projects:** Gestión ágil de historias de usuario, sprints y criterios de aceptación.
- **WCAG 2.1 AAA Contrast Checker:** Validación de contraste de colores ($\ge 7:1$) y tipografía ergonómica ($\ge 18$sp base, $\ge 64$dp botones).
- **Diagramas de Arquitectura C4:** Modelado de capas de contexto, contenedores y componentes.

#### 3. Archivos Clave para Mostrar en el Repositorio
- [`src/constants/actions.ts`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/src/constants/actions.ts): Declaración tipada de `ALLOWED_ACTIONS` (`CALL_CONTACT`, `SEND_WHATSAPP`, `CREATE_ALARM`, `TRIGGER_SOS`, etc.).
- [`CHANGELOG.md`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/CHANGELOG.md): Matriz de funcionalidades y pautas de accesibilidad y seguridad.

#### 4. Argumentación y Defensa ante el Profesor
> *"Profesor, en SeniorAssist la fase de PLAN no fue solo hacer una lista de deseos. Aplicamos el principio DevOps de 'Shift-Left': planificamos la seguridad y la accesibilidad desde la arquitectura. La lista blanca de acciones definida en `src/constants/actions.ts` asegura matemáticamente que ningún modelo de IA o comando de voz pueda ejecutar código arbitrario ni salirse de las 16 funciones autorizadas."*

---

### FASE 2: CODE (CODIFICACIÓN Y CONTROL DE VERSIONES)

#### 1. ¿Qué se programó y qué arquitectura se implementó?
El desarrollo se dividió en dos mundos complementarios:
- **Frontend Móvil (React Native + Expo):** Arquitectura MVVM (Model-View-ViewModel) con Context API global. Interfaz accesible de gran escala, soporte de modo oscuro/claro de alto contraste y motor de contingencia **Offline-First**. Si el teléfono no tiene internet, las llamadas, la linterna, la lupa y las alarmas locales en SQLite siguen funcionando al 100%.
- **Backend de IA y Autenticación (FastAPI en Python 3.10):** Servicio asíncrono de alto rendimiento. Implementa autenticación transparente **Zero-Login** según el estándar **JWA (RFC 7518)** con firmas criptográficas **`HS256`** (HMAC-SHA256). El adulto mayor no tiene que escribir usuarios ni contraseñas; el teléfono se autentica mediante su identificador único de hardware (`device_id`).

#### 2. Herramientas y Buenas Prácticas
- **Lenguajes:** TypeScript 5.x (cliente con tipado estricto) y Python 3.10+ (backend con Pydantic).
- **Frameworks:** React Native 0.76, Expo SDK 52, FastAPI, Uvicorn, PyJWT.
- **Control de Versiones:** Git con flujo de ramas y estándar de **Conventional Commits** (`feat:`, `ci:`, `chore:`, `test:`).
- **Almacenamiento Seguro:** `expo-secure-store` utilizando el **Android Keystore** cifrado con hardware.

#### 3. Archivos Clave para Mostrar en el Repositorio
- [`App.tsx`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/App.tsx): Punto de entrada con handshake de autenticación transparente y manejo del botón físico atrás de Android.
- [`src/context/GlobalVoiceAssistantContext.tsx`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/src/context/GlobalVoiceAssistantContext.tsx): Orquestador de escucha omnipresente y streaming asíncrono de telemetría a la nube.
- [`backend/app/main.py`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/backend/app/main.py): Aplicación principal FastAPI con routers modulares y CORS configurado.
- [`backend/app/security/jwt_handler.py`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/backend/app/security/jwt_handler.py): Generación y validación de tokens JWT bajo algoritmo criptográfico JWA `HS256`.

#### 4. Argumentación y Defensa ante el Profesor
> *"Profesor, un error común en proyectos universitarios es hacer que la app móvil dependa ciegamente del servidor. En SeniorAssist codificamos bajo el principio de Resiliencia: si el abuelo está en el campo sin señal, la app conmuta a modo local sin fallar. Y en cuanto a seguridad, implementamos Zero-Login con tokens JWT firmados con HS256, eliminando la barrera cognitiva de recordar contraseñas."*

---

### FASE 3: BUILD (CONSTRUCCIÓN Y AUTOMATIZACIÓN DE COMPILACIÓN)

#### 1. ¿Qué se compila y qué artefactos se generan?
La fase de BUILD transforma el código fuente en paquetes ejecutables optimizados:
- **Artefacto Móvil Android:** Metro Bundler minifica y empaqueta el código TypeScript en el bundle optimizado `index.android.bundle`. Luego, el motor de construcción **Gradle Wrapper** compila el código nativo en Java/Kotlin, las librerías C++ y los recursos gráficos, produciendo el binario firmado `SeniorAssist.apk` de 166 MB.
- **Artefacto Backend Cloud:** Script de PowerShell (`package_backend_deploy.ps1`) que valida la sintaxis de Python, excluye archivos de desarrollo (`__pycache__`, `.pytest_cache`) y comprime el backend en un paquete liviano `seniorassist-backend-deploy.zip` de solo 13 KB con el `Procfile` y la configuración de infraestructura.

#### 2. Herramientas Utilizadas
- **Gradle 8.x con Gradle Wrapper (`gradlew`):** Gestión determinista de dependencias nativas Android.
- **Metro Bundler:** Empaquetador de JavaScript de React Native con optimización de árboles de código (Tree-Shaking).
- **GitHub Actions:** Workflow automatizado `.github/workflows/build.yml` que compila en la nube con máquinas Ubuntu y runners de Java 17.
- **PowerShell / Batch Scripts:** Scripts locales de un clic (`scripts/build_standalone_apk.bat` y `scripts/package_backend_deploy.bat`).

#### 3. Archivos Clave para Mostrar en el Repositorio
- [`.github/workflows/build.yml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.github/workflows/build.yml): Pipeline CI con jobs paralelos `build-android` y `build-backend`.
- [`android/build.gradle`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/android/build.gradle) y [`android/app/build.gradle`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/android/app/build.gradle): Configuración de compilación con SDK objetivo 34 y NDK.
- [`scripts/build_standalone_apk.ps1`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/scripts/build_standalone_apk.ps1): Script automatizado de exportación de assets y ejecución de Gradle.
- [`SeniorAssist.apk`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/SeniorAssist.apk): Binario Android final compilado y funcional.

#### 4. Argumentación y Defensa ante el Profesor
> *"Profesor, un pipeline de BUILD profesional debe ser determinista e independiente de la máquina del desarrollador. Usamos Gradle Wrapper (`gradlew`) para fijar la versión exacta de Gradle y Metro Bundler para minificar el código. Además, nuestro script `package_backend_deploy.ps1` crea un artefacto de backend de solo 13 KB, lo que ahorra ancho de banda y acelera el despliegue a segundos."*

---

### FASE 4: TEST (PRUEBAS CONTINUAS Y VALIDACIÓN DE CALIDAD)

#### 1. ¿Qué se prueba y cómo se estructura la suite?
Se diseñó una estrategia de **Continuous Testing** compuesta por **56 pruebas automatizadas** divididas en 3 niveles:
1. **Pruebas de Integridad de Cliente (40 pruebas):** Validadas mediante Node.js en `scripts/verify_client_integrity.js`. Verifican contratos de tipos TypeScript, persistencia en SQLite, compatibilidad de pantallas y cumplimiento de las directivas de contraste WCAG AAA.
2. **Pruebas de Backend y Seguridad (8 pruebas):** Ejecutadas con **Pytest** y `FastAPI TestClient` en `backend/tests/test_api_suite.py`. Validan el endpoint de salud `/health`, la autenticación transparente `/auth/device`, el rechazo inmediato de tokens JWT alterados o corruptos y la cobertura de la lista blanca de NLU (`test_nlu_whitelist_full_coverage`).
3. **Pruebas de Dialectos y Robustez de Voz (8 pruebas):** Ejecutadas en `scripts/test_voice_suite.js`. Simulan entradas de voz con modismos coloquiales colombianos ("llama a mi mami", "pon la radio", "manda mensaje a Carlos diciendo que ya llegué") garantizando que el motor de inferencia extraiga la entidad correcta con confianza $\ge 0.90$.

#### 2. Herramientas Utilizadas
- **Pytest:** Framework estándar de pruebas unitarias y de integración en Python.
- **FastAPI TestClient (sobre Starlette y HTTPX):** Pruebas de API en memoria sin necesidad de levantar puertos de red.
- **Node.js Test Runner & Jest:** Ejecución de suites sintéticas de JavaScript y TypeScript.
- **GitHub Actions (`test.yml`):** Puerta de calidad (Quality Gate) que bloquea cualquier commit que falle una sola prueba.

#### 3. Archivos Clave para Mostrar en el Repositorio
- [`.github/workflows/test.yml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.github/workflows/test.yml): Pipeline de ejecución de pruebas en cada Push y Pull Request.
- [`backend/tests/test_api_suite.py`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/backend/tests/test_api_suite.py): Suite completa de pruebas de backend.
- [`scripts/test_voice_suite.js`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/scripts/test_voice_suite.js): Suite de pruebas de lenguaje natural y modismos.
- [`scripts/verify_client_integrity.js`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/scripts/verify_client_integrity.js): Validación de integridad de componentes cliente.

#### 4. Argumentación y Defensa ante el Profesor
> *"Profesor, en DevOps la calidad no es negociable. Nuestro pipeline de TEST evalúa 56 escenarios automáticos. No solo probamos que el backend responda 200 OK, sino que probamos casos negativos: enviamos tokens falsos para validar que el sistema los rechace con 401 Unauthorized y probamos frases coloquiales colombianas para asegurar que el adulto mayor sea comprendido siempre."*

---

### FASE 5: RELEASE (GESTIÓN DE VERSIONES Y EMPAQUETADO)

#### 1. ¿Cómo se versiona y cómo se garantiza la integridad?
La fase de RELEASE formaliza la entrega del software bajo estándares internacionales:
- **Versionamiento Semántico (SemVer 2.0.0):** Se asignó formalmente la versión `v1.0.0` utilizando tags anotados de Git (`git tag -a v1.0.0 -m "Release v1.0.0"`).
- **Historial de Cambios (Keep a Changelog):** Documento `CHANGELOG.md` estructurado con secciones estándar: *Added* (nuevas funcionalidades), *Accessibility* (WCAG AAA), *Security* (JWA HS256) e *Infrastructure* (DevOps pipelines).
- **Garantía Criptográfica de Inmutabilidad (SHA-256):** Se calculó el hash criptográfico del binario compilado y se registró en `SHA256SUMS.txt`. Esto permite verificar que el APK instalado en el celular del usuario final es idéntico bit por bit al generado en el pipeline, descartando inyecciones de código o corrupción durante la descarga.

#### 2. Herramientas Utilizadas
- **Git Tags & Git Releases:** Marcado formal de versiones en el árbol de commits.
- **CertUtil / OpenSSL / sha256sum:** Herramientas criptográficas para el cálculo de firmas SHA-256.
- **GitHub Releases:** Plataforma de almacenamiento y distribución inmutable de binarios y notas de versión.
- **PowerShell Automation:** Script `scripts/create_release.ps1` que sincroniza el tag, el changelog y los hashes.

#### 3. Archivos Clave para Mostrar en el Repositorio
- [`CHANGELOG.md`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/CHANGELOG.md): Documento oficial de cambios de la versión `v1.0.0`.
- [`SHA256SUMS.txt`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/SHA256SUMS.txt): Manifiesto de sumas de verificación criptográfica del APK.
- [`.github/workflows/release.yml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.github/workflows/release.yml): Pipeline que se activa al crear un Tag `v*` y publica automáticamente la release en GitHub.
- [`scripts/create_release.ps1`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/scripts/create_release.ps1): Automatización de etiquetado y cálculo de hashes.

#### 4. Argumentación y Defensa ante el Profesor
> *"Profesor, en un entorno de producción regulado nadie descarga un archivo ejecutable sin conocer su huella digital. En la fase de RELEASE publicamos el Tag `v1.0.0` y el archivo `SHA256SUMS.txt`. Si el hash del APK en el teléfono coincide con el hash del repositorio, tenemos la garantía matemática de que el software no fue manipulado por intermediarios (Integrity & Non-Repudiation)."*

---

### FASE 6: DEPLOY (DESPLIEGUE CONTINUO - FASE DE EXPOSICIÓN)

*(Nota: Esta fase cuenta además con un documento dedicado y exhaustivo en `Documentos/SeniorAssist_Fase_6_DEPLOY_Guia_Exposicion.md`).*

#### 1. ¿Cómo se desplegó y qué estrategia se utilizó?
Cumpliendo rigurosamente la directiva técnica de **NO USAR CONTENEDORES DOCKER**, se diseñó una arquitectura de despliegue dual:
- **Backend Inteligente en la Nube:** Desplegado de forma nativa sobre **Render Cloud Application Services** (PaaS basado en Python 3.10) con endpoint público seguro HTTPS (`https://seniorassist.onrender.com/`). Además, se dejó completamente configurada la infraestructura como código para **AWS Elastic Beanstalk** (`.ebextensions/01_fastapi.config` y `Procfile`).
- **Demostración de Microservicios Nativos:** Se creó el script consolidado `backend/microservicios_demo.py`, que levanta de forma nativa en la máquina dos microservicios desacoplados: Microservicio de Autenticación (puerto 8001) y Microservicio de IA/Voz (puerto 8002), demostrando arquitectura de microservicios sin necesidad de Docker.
- **Distribución de la App Móvil:** El binario compilado `SeniorAssist.apk` se distribuye a través de **GitHub Releases** y el pipeline automatizado de **Firebase App Distribution** (`.github/workflows/deploy.yml`), permitiendo a cuidadores y usuarios descargar la aplicación con un solo toque.

#### 2. Herramientas Utilizadas
- **Render (Cloud PaaS):** Hosting nativo en la nube con webhook automático enlazado a GitHub (`git push origin main`).
- **AWS Elastic Beanstalk (PaaS Empresarial):** Orquestación nativa sobre Amazon Linux 2023 con Application Load Balancer y Auto-Scaling Group.
- **Procfile:** Declaración del comando de ejecución ASGI: `web: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`.
- **render.yaml:** Infraestructura como Código (IaC) declarativa para Render.
- **Firebase App Distribution / GitHub Releases:** Canales oficiales de entrega continua móvil.

#### 3. Archivos Clave para Mostrar en el Repositorio
- [`render.yaml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/render.yaml): Manifiesto de IaC que define el servicio web en Render, Python runtime y variables de entorno.
- [`Procfile`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/Procfile): Archivo de orquestación PaaS universal para AWS Elastic Beanstalk y Render.
- [`.ebextensions/01_fastapi.config`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.ebextensions/01_fastapi.config): Configuración de infraestructura como código para AWS.
- [`backend/microservicios_demo.py`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/backend/microservicios_demo.py): Script de demostración de microservicios nativos.
- [`.github/workflows/deploy.yml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.github/workflows/deploy.yml): Pipeline de Continuous Deployment con jobs paralelos.
- [`DEPLOYMENT_DEFENSE_GUIDE.md`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/DEPLOYMENT_DEFENSE_GUIDE.md): Guía de sustentación específica de la fase.

#### 4. Argumentación y Defensa ante el Profesor
> *"Profesor, a nuestro equipo le correspondió exponer DEPLOY. Demostramos que Docker no es una camisa de fuerza. Al utilizar PaaS nativo con Render y AWS Elastic Beanstalk, logramos un artefacto de solo 13 KB frente a una imagen Docker de 1.5 GB, eliminamos el tiempo de arranque en frío (Cold Start) y dejamos el parchado del sistema operativo en manos del proveedor de nube. En la app móvil, el binario viaja directo al teléfono del usuario final mediante GitHub Releases y Firebase."*

---

### FASE 7: OPERATE (OPERACIÓN, ALTA DISPONIBILIDAD Y RESILIENCIA)

#### 1. ¿Cómo se opera y mantiene el sistema en producción?
La fase de OPERATE asegura que el software continúe funcionando de forma confiable después del despliegue:
- **Aprovisionamiento y Configuración Automatizada con Ansible:** Se diseñó un playbook declarativo (`ansible/playbook_operate.yml`) que automatiza la configuración de servidores Linux: instalación de paquetes del sistema, creación de un usuario sin privilegios de root (`seniorassist`), clonación de código, instalación de dependencias en entorno virtual y configuración de seguridad.
- **Auto-recuperación ante Fallos (Self-Healing) con Systemd:** Se implementó una unidad de servicio Systemd (`seniorassist.service.j2`) con la directiva `Restart=always` y `RestartSec=1s`. Si el proceso del backend llega a caer por falta de memoria o una excepción imprevista, el kernel de Linux lo reinicia automáticamente en menos de un segundo sin intervención humana.
- **Proxy Inverso y Terminación SSL con Nginx:** Configuración de Nginx (`nginx_seniorassist.conf.j2`) como escudo frontal frente a internet, manejando compresión Gzip, límites de tamaño de peticiones y redirección HTTP a HTTPS.

#### 2. Herramientas Utilizadas
- **Ansible:** Motor de automatización y Configuration Management sin agentes (Agentless vía SSH).
- **Systemd (Linux Daemon Manager):** Gestión de ciclo de vida del servicio, control de recursos y supervisión de procesos.
- **Nginx:** Servidor web de alto rendimiento y Reverse Proxy.
- **Jinja2:** Motor de plantillas para parametrizar servicios y hosts en Ansible.

#### 3. Archivos Clave para Mostrar en el Repositorio
- [`ansible/playbook_operate.yml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/ansible/playbook_operate.yml): Playbook principal de aprovisionamiento y orquestación operativa.
- [`ansible/templates/seniorassist.service.j2`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/ansible/templates/seniorassist.service.j2): Plantilla de unidad Systemd con políticas de reinicio automático y límites de seguridad.
- [`ansible/templates/nginx_seniorassist.conf.j2`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/ansible/templates/nginx_seniorassist.conf.j2): Plantilla de proxy inverso Nginx.
- [`ansible/inventory.ini`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/ansible/inventory.ini): Inventario de servidores de producción.
- [`ansible/README.md`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/ansible/README.md): Guía de operaciones y mantenimiento.

#### 4. Argumentación y Defensa ante el Profesor
> *"Profesor, en DevOps la responsabilidad del equipo no acaba cuando el código corre en la nube. En la fase de OPERATE utilizamos Ansible para lograr 'Infraestructura Inmutable y Reproducible': podemos levantar un servidor idéntico en 2 minutos con un solo comando. Y con Systemd garantizamos Alta Disponibilidad (High Availability): si el servidor falla, el sistema operativo lo resucita en un segundo."*

---

### FASE 8: MONITOR (MONITOREO, OBSERVABILIDAD Y RETROALIMENTACIÓN)

#### 1. ¿Qué métricas se recolectan y cómo se cierra el ciclo DevOps?
La fase de MONITOR proporciona visibilidad en tiempo real de la salud y el rendimiento del sistema mediante el paradigma de **Observabilidad (Métricas, Trazas y Logs)**:
- **Métricas de APM en el Backend:** Endpoint `/monitoring/metrics` que expone métricas en formato estándar de Prometheus y Datadog: total de peticiones (`seniorassist_requests_total`), errores de autenticación (`seniorassist_auth_failures_total`), latencia de inferencia de voz (`seniorassist_voice_latency_seconds`) y uso de CPU y memoria.
- **Telemetría de la Experiencia del Adulto Mayor:** Servicio cliente `MonitoringService.ts` en la app móvil. Mide de forma pasiva la latencia de red en cada comando de voz, el impacto en la batería y la tasa de comandos no reconocidos.
- **Reglas de Alertas Proactivas:** Archivo `monitoring/alerts.yaml` que dispara alertas críticas si la latencia percentil 95 supera los 2.0 segundos (inaceptable para un adulto mayor) o si la tasa de errores HTTP 5xx supera el 1%.
- **Dashboard en CloudWatch / Datadog:** Configuración `monitoring/dashboard_cloudwatch.json` con widgets visuales de tráfico, distribución de códigos de estado HTTP y tiempos de respuesta.
- **Continuous Feedback Loop hacia PLAN:** Si las métricas revelan que ciertas frases de voz tienen baja confianza de reconocimiento, se genera automáticamente una nueva historia de usuario en Jira para ajustar el modelo NLU en el siguiente sprint de PLAN.

#### 2. Herramientas Utilizadas
- **Datadog APM & Distributed Tracing:** Monitoreo de trazas de extremo a extremo y perfilado de rendimiento.
- **AWS CloudWatch:** Tableros de control de infraestructura y métricas de red.
- **Prometheus Exporter:** Formato abierto de recolección de series de tiempo.
- **FastAPI Custom Middleware:** Interceptores HTTP para cómputo de tiempos de respuesta en microsegundos.

#### 3. Archivos Clave para Mostrar en el Repositorio
- [`backend/app/routers/monitoring.py`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/backend/app/routers/monitoring.py): Endpoints `/monitoring/metrics` y `/monitoring/health`.
- [`src/services/MonitoringService.ts`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/src/services/MonitoringService.ts): Agente de telemetría y calidad de servicio en el dispositivo móvil.
- [`monitoring/alerts.yaml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/monitoring/alerts.yaml): Reglas de alerta para Prometheus y Datadog.
- [`monitoring/dashboard_cloudwatch.json`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/monitoring/dashboard_cloudwatch.json): Definición del tablero de visualización ejecutiva.
- [`monitoring/datadog_agent.yaml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/monitoring/datadog_agent.yaml): Manifiesto de integración del agente de APM.

#### 4. Argumentación y Defensa ante el Profesor
> *"Profesor, el monitoreo es la fase que convierte la línea recta en el círculo infinito de DevOps. Si no monitoreamos, no sabemos si el usuario está satisfecho. Con Datadog y nuestro endpoint `/monitoring/metrics` medimos la latencia de cada orden de voz. Si un abuelo dice 'Llama a mi hija' y la respuesta tarda más de 2 segundos, el sistema emite una alerta y esa métrica alimenta la fase de PLAN para optimizar los algoritmos en la siguiente versión."*

---

## GUÍA DE PREGUNTAS TRAMPA GLOBALES DEL PROFESOR Y CÓMO RESPONDERLAS

### Pregunta 1: *"¿Por qué dicen que esto es DevOps y no simplemente desarrollo tradicional de software?"*
> **Respuesta:** *"Profesor, el desarrollo tradicional termina cuando el programador entrega el código y dice 'en mi máquina funciona'. En SeniorAssist implementamos DevOps porque automatizamos la cadena completa de valor: cada cambio en el código pasa por pruebas automáticas (TEST), se empaqueta sin intervención manual (BUILD y RELEASE), se despliega con infraestructura como código (DEPLOY), se opera con auto-recuperación (OPERATE) y se monitorea con telemetría en tiempo real (MONITOR) para retroalimentar la planificación (PLAN). Todo está conectado mediante Git y pipelines CI/CD."*

### Pregunta 2: *"¿Dónde está la trazabilidad en su proyecto si quiero auditar un cambio?"*
> **Respuesta:** *"La trazabilidad es total a través de Git y los artefactos generados. Cada commit sigue la convención de Conventional Commits. La versión `v1.0.0` está respaldada por un Tag inmutable, un `CHANGELOG.md` que documenta cada función y el archivo `SHA256SUMS.txt` que contiene el hash criptográfico exacto del APK. Cualquier persona puede comparar el hash del binario descargado con el registrado en GitHub y verificar que es auténtico e inalterado."*

### Pregunta 3: *"Si la aplicación móvil no tiene internet, ¿el proyecto se cae o deja de funcionar?"*
> **Respuesta:** *"No, profesor. Diseñamos la arquitectura bajo el principio de 'Graceful Degradation' y 'Offline-First'. El cliente móvil tiene un motor local de inferencia, una base de datos local SQLite para los medicamentos y acceso directo al hardware del teléfono para llamadas, linterna y lupa. Si Render o internet no responden, la app sigue funcionando de forma transparente y almacena la telemetría localmente hasta que se restablezca la conexión."*

---

*Documento generado por el equipo SeniorAssist – UTS 2026. Todos los derechos reservados.*
