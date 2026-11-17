# 9. Taller de almacenamiento EBS y EFS

Fecha de clase: 2026-11-12

Última actualización: 2026-11-17

[Volver al índice](LEEME.md)

## 1. Objetivo
Aprovisionar y configurar almacenamiento en bloque dedicado (**Amazon EBS**) y almacenamiento de archivos en red compartido (**Amazon EFS**) sobre instancias **Amazon Linux 2023**, aplicando reglas de seguridad mediante **Security Groups** y validando el acceso a los mismos archivos desde dos servidores EC2.

---

## 2. Conceptos Clave
* **Amazon EBS (Elastic Block Store):** Almacenamiento en bloques. En este taller se utiliza un volumen dedicado a la primera instancia. Solo se formatea si es nuevo y no contiene un sistema de archivos; existen configuraciones Multi-Attach para determinados volúmenes io1/io2.
* **Amazon EFS (Elastic File System):** Sistema de archivos en red administrado basado en el protocolo **NFSv4** (puerto **TCP 2049**). Permite que **múltiples instancias EC2** lean y escriban los mismos archivos al mismo tiempo y crece automáticamente.
* **Security Group (Stateful):** Firewall virtual con memoria (si permite entrar tráfico, deja salir la respuesta). Por seguridad, el EFS no se abre al mundo (`0.0.0.0/0`), sino únicamente al **Security Group de las instancias EC2**.

---

## 3. Fase 1: Configuración en la Consola Web de AWS

### A. Configurar los Security Groups (VPC / EC2)
1. **Security Group para las instancias EC2 (`sg-ec2`):**
   * **Regla de entrada:** Puerto `22` (SSH) desde tu IP pública actual (`/32`) para conectarte por terminal.
2. **Security Group para el EFS (`sge-efs-ae`):**
   * **Regla de entrada:** Tipo `NFS` (Puerto `TCP 2049`) poniendo como **Origen** el ID del Security Group de tus EC2 (`sg-ec2`).

### B. Lanzar las dos instancias EC2 (Amazon Linux 2023)
1. **Instancia 1 (Principal):**
   * Seleccionar **Amazon Linux 2023**, tipo `t3.micro` y tu par de claves (`.pem`).
   * En **Configuración de red**, elegir la VPC por defecto y asignar `sg-ec2`.
   * En **Configurar almacenamiento**, mantener el disco raíz (`8 GiB`) y hacer clic en **Agregar nuevo volumen** para añadir un disco EBS de **`10 GiB`**.
2. **Instancia 2 (Secundaria):**
   * Lanzar una segunda instancia **Amazon Linux 2023** en la **misma VPC**, con el **mismo Security Group (`sg-ec2`)** y la misma llave `.pem`.

### C. Crear el Sistema de Archivos EFS
1. Ir al servicio **Amazon EFS** en la consola de AWS y hacer clic en **Crear sistema de archivos**.
2. Asignar un nombre, seleccionar la **misma VPC** de las instancias EC2 y hacer clic en **Personalizar**.
3. En el paso de **Acceso a la red**, reemplazar el Security Group por defecto de cada Zona de Disponibilidad por el grupo **`sge-efs-ae`** (puerto 2049 abierto).
4. Finalizar la creación y copiar el **ID del sistema de archivos** (ejemplo: `fs-02d737f8f33137fd6`).

---

> **Requisitos de red:** verifica que existan destinos de montaje EFS disponibles en las zonas usadas por las instancias, que DNS funcione y que las reglas de salida de EC2 permitan TCP 2049 hacia EFS.

## 4. Fase 2: Formatear y Montar el Disco EBS (10 GB) en Instancia 1

Conéctate por SSH a la **Instancia 1** y ejecuta los siguientes comandos:

1. **Identificar el nombre del disco nuevo de 10 GB:**
   ```bash
   lsblk
   lsblk -f
   ```
   > *Nota:* En instancias `t3`, los volúmenes se presentan como dispositivos NVMe. `/dev/nvme1n1` es solo el nombre del ejemplo: confirma el dispositivo y su tamaño con `lsblk` y el sistema de archivos con `lsblk -f` antes de continuar.

2. **Crear la carpeta que servirá como punto de montaje:**
   ```bash
   sudo mkdir -p /disco2
   ```

3. **Formatear únicamente el volumen nuevo y vacío con XFS:**

   > `mkfs` puede destruir los datos existentes. No lo ejecutes sobre el disco raíz ni sobre un volumen que ya contenga datos. Sustituye el dispositivo del ejemplo por el que hayas identificado.
   ```bash
   sudo mkfs -t xfs /dev/nvme1n1
   ```
   > *Importante:* Un volumen nuevo sin sistema de archivos necesita formateo para este uso. Uno restaurado desde una instantánea puede estar ya formateado: no lo vuelvas a formatear.

4. **Montar el disco en la carpeta `/disco2`:**
   ```bash
   sudo mount /dev/nvme1n1 /disco2
   ```

5. **Comprobar el montaje y realizar prueba de escritura:**
   ```bash
   df -hT
   echo "texto de prueba" | sudo tee /disco2/prueba.txt
   cat /disco2/prueba.txt
   ```

---

## 5. Fase 3: Instalar y Montar Amazon EFS en Instancia 1

En la misma terminal SSH de la **Instancia 1**:

1. **Instalar la librería oficial de utilidades EFS y crear la carpeta `/efs1`:**
   ```bash
   sudo dnf install -y amazon-efs-utils
   sudo mkdir -p /efs1
   ```

2. **Montar el EFS usando su ID (cifrado con TLS):**

   El ID mostrado es el ejemplo de clase. Sustitúyelo en ambas instancias por el ID de tu sistema de archivos.
   ```bash
   sudo mount -t efs -o tls fs-02d737f8f33137fd6:/ /efs1
   ```

3. **Verificar el montaje y crear un archivo compartido:**
   ```bash
   df -hT /efs1
   echo "Hola desde EC2 en Amazon EFS" | sudo tee /efs1/prueba.txt
   cat /efs1/prueba.txt
   ```

---

## 6. Fase 4: Conectar la Instancia 2 y Comprobar el Acceso Compartido

Abre una segunda ventana de terminal, conéctate por SSH a la **Instancia 2** y enlázala al mismo EFS:

1. **Instalar utilidades EFS, crear `/efs1` y montar el mismo EFS:**
   ```bash
   sudo dnf install -y amazon-efs-utils
   sudo mkdir -p /efs1
   sudo mount -t efs -o tls fs-02d737f8f33137fd6:/ /efs1
   ```

2. **Listar y leer el archivo creado desde la Instancia 1:**
   ```bash
   ls -la /efs1
   cat /efs1/prueba.txt
   ```

3. **Escribir desde la Instancia 2 para validar lectura y escritura compartidas:**
   ```bash
   echo "Hola desde la segunda instancia" | sudo tee -a /efs1/prueba.txt
   cat /efs1/prueba.txt
   ```
   > Al ejecutar `cat /efs1/prueba.txt` nuevamente en la **Instancia 1**, deben verse ambas líneas tras completar la escritura. Se accede al mismo sistema de archivos; no se sincronizan dos discos locales.

---

## 7. Resumen de Comandos Útiles de Verificación

| Comando | Función |
| :--- | :--- |
| `lsblk -f` | Lista discos conectados, formato (`xfs`), `UUID` y puntos de montaje. |
| `df -hT` | Muestra el espacio usado/disponible en GB/MB y el tipo de sistema (`xfs`, `nfs4`). |
| `ls -la /efs1` | Lista todos los archivos (incluidos ocultos) y permisos dentro del EFS. |
| `cat /efs1/prueba.txt` | Muestra en pantalla el contenido del archivo de texto. |

## 8. Alcance del taller

Los comandos realizan montajes manuales. Para volver a montar automáticamente después de un reinicio se requiere una configuración adicional, como `/etc/fstab`. Un montaje manual no implica que los datos almacenados se borren al reiniciar.

## 9. Conceptos relacionados

- [Stateful, stateless y reglas entre Security Groups](03-redes-seguridad.md).
- [Comparación entre EBS, EFS y NFS](07-almacenamiento.md).

## Fuentes de las aclaraciones

- [AWS: preparar y montar volúmenes EBS](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-using-volumes.html).
- [AWS: reglas de red para EFS](https://docs.aws.amazon.com/efs/latest/ug/network-access.html).
- [AWS: destinos de montaje EFS](https://docs.aws.amazon.com/efs/latest/ug/accessing-fs.html).
