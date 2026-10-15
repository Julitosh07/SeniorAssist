# 📊 FASE 8: MONITOR - Observabilidad, Métricas y Cierre del Bucle DevOps
**Proyecto:** SeniorAssist  
**Materia:** Nuevas Tecnologías de Desarrollo – UTS  

---

## 1. Propósito de la Fase MONITOR
En DevOps, la fase **MONITOR** no es el final estático del proceso, sino el **conector que cierra el bucle infinito devolviendo información a la fase PLAN**. 

Permite supervisar en tiempo real:
1. **La experiencia del adulto mayor:** Si el reconocimiento de voz tarda demasiado, si alguna palabra coloquial no fue entendida o si la app se cerró inesperadamente.
2. **La salud del microservicio en la nube:** Uso de memoria, CPU, tiempo de respuesta de la API y peticiones bloqueadas por seguridad.

---

## 2. Herramientas Escogidas
* **Datadog / Prometheus:** Recopilación de métricas estandarizadas en `/monitoring/metrics`.
* **AWS CloudWatch:** Paneles de control y alarmas automáticas si la latencia supera los 1.5 segundos.
* **Sentry / Crashlytics:** Captura de excepciones no controladas y métrica de estabilidad móvil (*Crash-Free Rate*).

---

## 3. Indicadores de Nivel de Servicio (SLIs) y Objetivos (SLOs)

| Métrica / SLI | Objetivo (SLO) | Justificación en SeniorAssist |
|---|---|---|
| **Latencia P95 de Procesamiento de Voz** | **$< 2.0$ segundos** | Estipulado en el documento IEEE 830 para evitar que el abuelo piense que el sistema se trabó. |
| **Tasa Libre de Caídas (Crash-Free Rate)** | **$> 99.5\%$** | Un adulto mayor no sabe cómo reabrir o forzar cierre de una app colgada. |
| **Disponibilidad de la API (Uptime)** | **$99.9\%$** | Alta disponibilidad para garantizar atención de emergencias SOS. |
| **Tasa de Error 5xx** | **$< 1.0\%$** | Estabilidad del servidor ante peticiones concurrentes. |

---

## 4. El Bucle de Retroalimentación (Feedback Loop de MONITOR hacia PLAN)
```text
  [MONITOR] Detecta palabras no reconocidas por el NLU o lentitud en una función
      │
      ▼
  [TELEMETRÍA] Se agrupan los eventos en Sentry / CloudWatch
      │
      ▼
  [NUEVO SPRINT EN PLAN] Se crean historias de usuario en Jira para el release v1.1.0
      │
      ▼
  [BUCLE INFINITO CONTINÚA] (CODE -> BUILD -> TEST -> RELEASE -> DEPLOY -> OPERATE)
```
