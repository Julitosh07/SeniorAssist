# 🚀 GUÍA MAESTRA DE SUSTENTACIÓN: FASE DE DESPLIEGUE (DEPLOY)
**Proyecto:** SeniorAssist – Asistente Autónomo por Voz para Adultos Mayores  
**Materia:** Nuevas Tecnologías de Desarrollo – UTS  
**Fase Asignada para Exposición:** **FASE 6: DEPLOY**  
**Restricción Cumplida:** **100% CERO DOCKER (Despliegue Nativo PaaS + Distribución Móvil)**

---

## 1. El Pitch de Entrada (Cómo iniciar tu exposición)

> *"Buenos días profesor y compañeros. A nuestro grupo le correspondió exponer la fase de **DEPLOY (Despliegue)**.*
>
> *Para nuestro proyecto **SeniorAssist**, el despliegue presentaba un desafío muy particular que no se resuelve con una simple página web: tenemos un ecosistema híbrido compuesto por una **aplicación móvil Android de alta accesibilidad** y un **microservicio inteligente de procesamiento de voz en Python (FastAPI)**.*
>
> *Cumpliendo con la condición de **no utilizar contenedores Docker**, analizamos la arquitectura y seleccionamos las dos herramientas estándar de nivel empresarial para este tipo de arquitecturas:*
> 1. *Para el **Backend de Voz e IA:** **AWS Elastic Beanstalk** utilizando su plataforma nativa de Python 3.10 sobre Amazon Linux 2023.*
> 2. *Para la **Aplicación Móvil:** **Firebase App Distribution**, la herramienta oficial de Google para despliegue de binarios móviles a grupos de usuarios y cuidadores.*
>
> *A continuación les mostraremos por qué esta decisión es técnicamente superior a Docker para este proyecto y cómo funciona todo el flujo automatizado."*

---

## 2. Los 3 Argumentos de Oro: ¿Por qué NO usar Docker aquí?

Si el profesor pregunta: *¿Por qué decidieron no usar Docker y qué ventajas tuvieron al hacerlo así?*, responde con estos 3 puntos:

1. **Cero Sobrecarga de Recursos (Zero Overhead):**  
   * Docker añade capas de virtualización (cgroups, namespaces, overlayfs) y requiere empaquetar una imagen pesada de Linux de más de 1.5 GB.
   * Con **AWS Elastic Beanstalk nativo**, nuestro paquete de despliegue pesa solo **13.73 KB** (`dist/seniorassist-backend-deploy.zip`), porque el sistema operativo ya tiene el runtime de Python optimizado. El arranque en frío (Cold Start) es prácticamente instantáneo.
2. **PaaS Gestionado y Parcheo Automático:**  
   * En Docker, el desarrollador es responsable de parchar vulnerabilidades del sistema operativo en el Dockerfile.  
   * En **Elastic Beanstalk**, AWS se encarga automáticamente de los parches de seguridad del kernel de Linux, del balanceador de carga (Application Load Balancer) y del auto-escalado sin intervención manual.
3. **Las Apps Móviles NO se ejecutan en Docker:**  
   * Un celular de un adulto mayor no corre contenedores Docker. El binario Android (`.apk`) requiere un pipeline de entrega móvil que distribuya el archivo firmado directamente al dispositivo; para eso se utiliza **Firebase App Distribution**.

---

## 3. Diagrama de la Arquitectura de Despliegue

```text
                      DISPARADOR DEL PIPELINE (Git Tag / Release)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
      [RAMA BACKEND CLOUD]                             [RAMA CLIENTE MÓVIL]
                 │                                               │
    Artefacto: seniorassist-backend-deploy.zip       Artefacto: SeniorAssist.apk (166 MB)
    Contiene: Procfile, .ebextensions, code          Firmado con SHA-256
                 │                                               │
                 ▼                                               ▼
      AWS ELASTIC BEANSTALK                            FIREBASE APP DISTRIBUTION
  (PaaS Python 3.10 Nativo)                       (Plataforma de Entrega Continua Móvil)
                 │                                               │
        Auto-Scaling Group + ALB                                 ▼
        Balanceador HTTPS Seguro                       Notificación instantánea a
                 │                                     cuidadores y celulares de prueba
                 ▼                                               │
     Instancias EC2 Amazon Linux                                 ▼
      Uvicorn ASGI Server (Puerto 5000)                Instalación con 1 toque en Android
```

---

## 4. Archivos Clave que debes abrir en Visual Studio Code durante la exposición

Ten listos estos 4 archivos para proyectarlos en pantalla cuando estés explicando:

### 1. [`Procfile`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/Procfile)
* **Qué decir:** *"Este es el archivo estándar de orquestación PaaS. Le indica a AWS el comando exacto para levantar el servidor ASGI Uvicorn en el puerto 5000 sin tocar Docker."*
* **Contenido:** `web: uvicorn backend.app.main:app --host 0.0.0.0 --port 5000`

### 2. [`.ebextensions/01_fastapi.config`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.ebextensions/01_fastapi.config)
* **Qué decir:** *"Aquí configuramos la infraestructura de AWS como código (IaC). Declaramos el PYTHONPATH y la clave secreta para la firma criptográfica de los tokens JWT de los adultos mayores."*

### 3. [`.github/workflows/deploy.yml`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/.github/workflows/deploy.yml)
* **Qué decir:** *"Este es nuestro pipeline de CI/CD para la fase DEPLOY. Muestra dos jobs en paralelo: `deploy-backend-aws` que sube el código a Elastic Beanstalk mediante la acción oficial de AWS, y `deploy-mobile-firebase` que compila y distribuye el APK."*

### 4. [`dist/seniorassist-backend-deploy.zip`](file:///d:/UNIVERSIDAD/SEMESTRE_6/NUEVAS_TECNOLOGIAS/SeniorAssist/dist/seniorassist-backend-deploy.zip)
* **Qué decir:** *"Y este es el paquete empaquetado final que generamos con nuestro script automatizado. Pesa solo 13 KB, lo que demuestra la eficiencia de un despliegue nativo frente a imágenes pesadas de contenedores."*

---

## 5. Preguntas Trampa del Profesor y Cómo Responderlas

### Pregunta 1: *"¿Cómo se actualiza la aplicación si hago un cambio en el código?"*
> **Tu respuesta:** *"Profesor, gracias a nuestro pipeline en GitHub Actions (`deploy.yml`), el proceso es totalmente desatendido: al publicar un nuevo release o hacer un merge en la rama de producción, el pipeline empaqueta el nuevo ZIP y ejecuta un despliegue 'Rolling' en AWS (actualizando las instancias sin caída del servicio) y envía una actualización silenciosa por Firebase a los teléfonos de los abuelos."*

### Pregunta 2: *"¿Cómo garantizan que la comunicación entre el móvil y el backend desplegado sea segura?"*
> **Tu respuesta:** *"Utilizamos dos niveles de seguridad: primero, la capa de transporte utiliza HTTPS mediante el balanceador de carga de AWS. Segundo, cada petición del móvil viaja con un token JWT firmado criptográficamente con algoritmo JWA `HS256`, el cual es validado por el backend antes de ejecutar cualquier comando de voz."*

### Pregunta 3: *"¿Qué pasa si el servidor de AWS se cae mientras el abuelo usa la app?"*
> **Tu respuesta:** *"Diseñamos la aplicación bajo el principio DevOps de 'Resiliencia y Graceful Degradation': el cliente móvil detecta la pérdida de conexión y conmuta inmediatamente a modo Offline-First. Las alarmas locales en SQLite, la linterna, la lupa y las llamadas de emergencia siguen funcionando al 100% de forma autónoma en el dispositivo."*
