# Computación Grid y Cloud — Apuntes de clase

Este es el archivo principal para escribir los nuevos apuntes. Agrega una sección por fecha y conserva las clases anteriores.

## Cómo trabajar

- Usa fechas con el formato AAAA-MM-DD y agrega las clases nuevas al final.  
- Puedes corregir una clase anterior: al actualizar, deben revisarse también esas modificaciones.  
- Guarda las capturas en la carpeta `imagenes`, junto a este archivo. Usa nombres descriptivos, por ejemplo `2026-11-19-balanceador.png`.  
- Inserta imágenes con esta sintaxis: `![Descripción](imagenes/2026-11-19-balanceador.png)`. No incrustes imágenes en base64.  
- Para actualizar los archivos por temas y el HTML, pide: «Actualiza los apuntes organizados con los cambios del Markdown principal».  
- Guardar este archivo no actualiza automáticamente los documentos organizados ni el HTML.

## Punto de partida

Los apuntes anteriores, del 2026-10-15 al 2026-11-10, ya están en los archivos por temas. Este archivo comienza con los avances nuevos; no necesitas volver a copiar las clases anteriores.

Si quieres ampliar una clase anterior, agrega una sección con su fecha e indica que se trata de una corrección o ampliación.

## Registro de procesamiento

Este apartado lo mantiene el asistente al actualizar los documentos organizados.

- Archivo de entrada creado: 2026-11-17.  
- Última clase incluida en la organización inicial: 2026-11-10.  
- Clases procesadas desde este archivo: 2026-11-12 — Taller de almacenamiento EBS y EFS.  
- Última actualización de los documentos organizados: 2026-11-17.  
- Archivos actualizados: 03-redes-seguridad.md, 07-almacenamiento.md y 09-taller-ebs-efs.md; índice y HTML regenerados.  
- Se conserva una copia de referencia en `.control/entrada-procesada.md` para detectar futuras correcciones, incluso en fechas anteriores.  
- En cada actualización se registrarán las fechas incorporadas o corregidas. La última fecha no será el único criterio: también se revisarán cambios en clases anteriores.

---

## Plantilla para copiar

Copia el siguiente bloque debajo de «Nuevas clases», sustituye la fecha y el título y elimina los apartados que no necesites. La fecha de la plantilla no representa una clase registrada.

### AAAA-MM-DD — Nombre del tema

**Tipo de entrada:** clase nueva / ampliación / corrección de una clase anterior.

#### Conceptos principales

- **Concepto:** explicación con mis propias palabras.

#### Ejemplo del profesor

Describe el ejemplo y para qué sirve.

#### Práctica

**Objetivo:** qué se quiere conseguir.

1. Primer paso.  
2. Segundo paso.

```sh
# Escribe aquí los comandos utilizados.
```

**Resultado y comprobación:** qué ocurrió y cómo verificaste que funciona.

#### Imágenes

Añade aquí los enlaces a las capturas guardadas en `imagenes`.

#### Dudas pendientes

- ¿Qué necesito aclarar?

#### Resumen de la clase

- Primera idea importante.  
- Segunda idea importante.  
- Tercera idea importante.

---

## Nuevas clases

<!-- Agrega debajo las clases por fecha usando la plantilla anterior. De aquí para abajo se realizan las clases: -->

&nbsp;

### 2026-11-12 — Taller de almacenamiento EBS y EFS

Fue una clase prática y realizamo el siguiente taller:

# Guía Práctica: Montaje de Volúmenes EBS y Almacenamiento Compartido EFS en AWS

## 1\. Objetivo

Aprovisionar y configurar almacenamiento en bloque dedicado (**Amazon EBS**) y almacenamiento de archivos en red compartido (**Amazon EFS**) sobre instancias **Amazon Linux 2023**, aplicando reglas de seguridad mediante **Security Groups** y validando la sincronización de datos en tiempo real entre dos servidores EC2.

---

## 2\. Conceptos Clave

* **Amazon EBS (Elastic Block Store):** Disco duro virtual (almacenamiento en bloques) que se conecta a **una sola instancia** a la vez. Requiere formateo antes de usarse.  
* **Amazon EFS (Elastic File System):** Sistema de archivos en red administrado basado en el protocolo **NFSv4** (puerto **TCP 2049**). Permite que **múltiples instancias EC2** lean y escriban los mismos archivos al mismo tiempo y crece automáticamente.  
* **Security Group (Stateful):** Firewall virtual con memoria (si permite entrar tráfico, deja salir la respuesta). Por seguridad, el EFS no se abre al mundo (`0.0.0.0/0`), sino únicamente al **Security Group de las instancias EC2**.

---

## 3\. Fase 1: Configuración en la Consola Web de AWS

### A. Configurar los Security Groups (VPC / EC2)

1. **Security Group para las instancias EC2 (`sg-ec2`):**  
   * **Regla de entrada:** Puerto `22` (SSH) desde tu IP o `0.0.0.0/0` para conectarte por terminal.  
2. **Security Group para el EFS (`sge-efs-ae`):**  
   * **Regla de entrada:** Tipo `NFS` (Puerto `TCP 2049`) poniendo como **Origen** el ID del Security Group de tus EC2 (`sg-ec2`).

### B. Lanzar las dos instancias EC2 (Amazon Linux 2023\)

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

## 4\. Fase 2: Formatear y Montar el Disco EBS (10 GB) en Instancia 1

Conéctate por SSH a la **Instancia 1** y ejecuta los siguientes comandos:

1. **Identificar el nombre del disco nuevo de 10 GB:**

```sh
lsblk -f
```

   > *Nota:* En instancias `t3`, el disco adicional aparece como `nvme1n1` sin formato (`FSTYPE` vacío).

2. **Crear la carpeta que servirá como punto de montaje:**

```sh
sudo mkdir -p /disco2
```

3. **Formatear el disco con el sistema de archivos XFS:**

```sh
sudo mkfs -t xfs /dev/nvme1n1
```

   > *Importante:* Si intentas montar sin formatear primero, Linux mostrará error de superbloque inválido.

4. **Montar el disco en la carpeta `/disco2`:**

```sh
sudo mount /dev/nvme1n1 /disco2
```

5. **Comprobar el montaje y realizar prueba de escritura:**

```sh
df -hT
echo "texto de prueba" | sudo tee /disco2/prueba.txt
cat /disco2/prueba.txt
```

---

## 5\. Fase 3: Instalar y Montar Amazon EFS en Instancia 1

En la misma terminal SSH de la **Instancia 1**:

1. **Instalar la librería oficial de utilidades EFS y crear la carpeta `/efs1`:**

```sh
sudo dnf install -y amazon-efs-utils
sudo mkdir -p /efs1
```

2. **Montar el EFS usando su ID (cifrado con TLS):**

```sh
sudo mount -t efs -o tls fs-02d737f8f33137fd6:/ /efs1
```

3. **Verificar el montaje y crear un archivo compartido:**

```sh
df -hT /efs1
echo "Hola desde EC2 en Amazon EFS" | sudo tee /efs1/prueba.txt
cat /efs1/prueba.txt
```

---

## 6\. Fase 4: Conectar la Instancia 2 y Comprobar Sincronización

Abre una segunda ventana de terminal, conéctate por SSH a la **Instancia 2** y enlázala al mismo EFS:

1. **Instalar utilidades EFS, crear `/efs1` y montar el mismo EFS:**

```sh
sudo dnf install -y amazon-efs-utils
sudo mkdir -p /efs1
sudo mount -t efs -o tls fs-02d737f8f33137fd6:/ /efs1
```

2. **Listar y leer el archivo creado desde la Instancia 1:**

```sh
ls -la /efs1
cat /efs1/prueba.txt
```

3. **Escribir desde la Instancia 2 para validar sincronización bidireccional:**

```sh
echo "Hola desde la segunda instancia" | sudo tee -a /efs1/prueba.txt
cat /efs1/prueba.txt
```

   > Al ejecutar `cat /efs1/prueba.txt` nuevamente en la **Instancia 1**, ambas líneas aparecerán reflejadas al instante.

---

## 7\. Resumen de Comandos Útiles de Verificación

| Comando | Función |
| :---- | :---- |
| `lsblk -f` | Lista discos conectados, formato (`xfs`), `UUID` y puntos de montaje. |
| `df -hT` | Muestra el espacio usado/disponible en GB/MB y el tipo de sistema (`xfs`, `nfs4`). |
| `ls -la /efs1` | Lista todos los archivos (incluidos ocultos) y permisos dentro del EFS. |
| `cat /efs1/prueba.txt` | Muestra en pantalla el contenido del archivo de texto. |

Adiconal a eso vimos otros conceptos:

### 1\. Stateful vs. Stateless en Security Groups

La diferencia entre ambos términos se resume en si el firewall tiene **"memoria"** o no sobre las conexiones de red:

* **Stateful (Con estado):** Significa que el firewall tiene **memoria**. Así es como funcionan los **Security Groups** en AWS. Si tú permites que una petición entre (regla de entrada), el Security Group recuerda esa conexión y deja que la respuesta salga automáticamente, sin que tengas que crear una regla de salida. *(En otras palabras: si logra entrar, puede salir)*.

* **Stateless (Sin estado):** Significa que el firewall **no tiene memoria** (en AWS así funcionan las *Network ACLs*, no los Security Groups). Evalúa el tráfico de entrada y de salida por separado. Si dejas entrar tráfico, debes configurar manualmente otra regla de salida para permitir que la respuesta regrese.

---

### 2\. ¿Por qué NO abrir al mundo (`0.0.0.0/0`) y SÍ a otro Security Group?

* **El problema de especificar "el mundo" (`0.0.0.0/0`):** La dirección `0.0.0.0/0` representa cualquier dirección IP de todo Internet. Si abres un puerto interno a todo el mundo, dejas tu servidor expuesto a rastreos automáticos y posibles ataques externos. Solo debe usarse en puertos que obligatoriamente tengan que ser públicos (como el puerto 80 o 443 de una página web).

* **La ventaja de apuntar a otro Security Group:** En AWS, en vez de escribir una IP en el origen (*Source*), puedes indicar el ID de otro Security Group. Por ejemplo, le dices al almacenamiento o base de datos: *"solo acepta conexiones que vengan de servidores que pertenezcan al Security Group de mis instancias EC2"*.

* **Más seguridad:** Únicamente tus servidores autorizados pueden comunicarse entre sí, bloqueando el resto de Internet.

* **Crecimiento automático:** Si luego creas 10 servidores nuevos y les asignas ese mismo Security Group, obtienen acceso inmediato sin que tengas que editar reglas ni añadir IPs una por una.

---

### 3\. ¿Qué es NFS (Network File System)?

* **Qué es:** Es un **protocolo de red estándar** (muy utilizado en sistemas Linux y Unix) que permite a una computadora acceder, leer y escribir archivos en una carpeta remota a través de la red como si estuvieran en su propio disco local.

* **Cómo funciona:** Un servidor comparte ("exporta") una carpeta y los equipos clientes la conectan ("montan") dentro de su propio sistema de archivos.

* **Puerto clave:** En su versión moderna (**NFSv4**), utiliza exclusivamente el puerto **TCP 2049**.

---

### 4\. ¿Qué es EFS (Amazon Elastic File System)?

* **Qué es:** Es el servicio de almacenamiento de archivos en red **totalmente administrado** (*serverless*) de AWS, construido por debajo sobre el protocolo **NFS (NFSv4)**.

* **Sus ventajas principales:**

* **Compartido entre muchos:** Cientos o miles de instancias EC2 pueden conectarse al mismo EFS y leer o modificar los mismos archivos al mismo tiempo.

* **Elástico:** No necesitas definir un tamaño fijo de disco; crece automáticamente cuando guardas archivos y se reduce cuando los borras, pagando solo por el espacio que ocupas.

* **Administrado y seguro:** AWS se encarga del hardware y replica los datos en varias Zonas de Disponibilidad para evitar pérdidas.

> **Cómo se conecta todo:** Para usar un **EFS** de forma segura con tus instancias EC2, abres el puerto **TCP 2049** (del protocolo **NFS**) en el Security Group del EFS y pones como origen el **Security Group de tus instancias EC2** (nunca `0.0.0.0/0`).

&nbsp;

### 2026-11-17 —&nbsp;

&nbsp;

que son los archivos:  [variables.tf](http://variables.tf), investigar esta parte

[outputs.tf](http://outputs.tf): lo que quiero imprimir en consola como salida

Explicame de mejor manera que es statefull y stateless

que quiere decir 0.0.0.0


que es dependencia ciclica en el contexto que estamos viendo, por ejemplo primero crear instancias sin security gruops y despues colocar los security groups

&nbsp;

