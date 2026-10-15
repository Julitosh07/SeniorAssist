# ⚙️ FASE 7: OPERATE - Automatización de Infraestructura con Ansible
**Proyecto:** SeniorAssist  
**Materia:** Nuevas Tecnologías de Desarrollo – UTS  

## 1. Propósito de la Fase OPERATE
La fase **OPERATE** garantiza que, una vez desplegado el sistema, la infraestructura se mantenga **estable, segura, auto-recuperable y con alta disponibilidad (99.9% uptime)**.

## 2. Herramientas Implementadas
* **Ansible:** Automatización de configuración sin agentes (Agentless) sobre SSH.
* **Systemd:** Demonio de Linux para gestión de ciclo de vida del proceso ASGI y reinicio automático en menos de 1 segundo si ocurre una caída.
* **Nginx:** Reverse Proxy con terminación SSL, balanceo de carga, compresión gzip y protección de tasa de peticiones (Rate Limiting).
* **UFW (Uncomplicated Firewall):** Blindaje perimetral abriendo exclusivamente los puertos 22 (SSH), 80 (HTTP) y 443 (HTTPS).
* **Logrotate:** Rotación y compresión semanal de registros para evitar saturación de almacenamiento en disco.

## 3. Estructura de Archivos
* `ansible/inventory.ini`: Lista de servidores gestionados (Producción y Staging).
* `ansible/playbook_operate.yml`: Playbook principal con 13 tareas automatizadas.
* `ansible/templates/seniorassist.service.j2`: Plantilla del servicio Systemd.
* `ansible/templates/nginx_seniorassist.conf.j2`: Plantilla del proxy inverso Nginx.

## 4. Ejecución del Playbook
Para aprovisionar o actualizar cualquier servidor en producción:
```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook_operate.yml
```
