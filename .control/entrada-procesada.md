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
- Clases procesadas desde este archivo: 2026-11-12 — Taller de almacenamiento EBS y EFS; 2026-11-21 — Apuntes de Curso AWS (Módulos 1 al 4); 2026-11-26 — Aclaraciones de Terraform y Redes (variables.tf, outputs.tf, stateful/stateless, 0.0.0.0/0 y dependencia cíclica).
- Última actualización de los documentos organizados: 2026-11-26.
- Archivos actualizados: 03-redes-seguridad.md, 06-terraform.md, 12-talleres-terraform.md, LEEME.md, assets/app.js y scripts/construir.mjs; índice, documentación de Terraform y HTML regenerados.
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

```bash
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

### 2026-11-12 — Taller de almacenamiento EBS y EFS

Fue una clase prática y realizamo el siguiente taller:

# Guía Práctica: Montaje de Volúmenes EBS y Almacenamiento Compartido EFS en AWS

## 1. Objetivo
Aprovisionar y configurar almacenamiento en bloque dedicado (**Amazon EBS**) y almacenamiento de archivos en red compartido (**Amazon EFS**) sobre instancias **Amazon Linux 2023**, aplicando reglas de seguridad mediante **Security Groups** y validando la sincronización de datos en tiempo real entre dos servidores EC2.

---

## 2. Conceptos Clave
* **Amazon EBS (Elastic Block Store):** Disco duro virtual (almacenamiento en bloques) que se conecta a **una sola instancia** a la vez. Requiere formateo antes de usarse.
* **Amazon EFS (Elastic File System):** Sistema de archivos en red administrado basado en el protocolo **NFSv4** (puerto **TCP 2049**). Permite que **múltiples instancias EC2** lean y escriban los mismos archivos al mismo tiempo y crece automáticamente.
* **Security Group (Stateful):** Firewall virtual con memoria (si permite entrar tráfico, deja salir la respuesta). Por seguridad, el EFS no se abre al mundo (`0.0.0.0/0`), sino únicamente al **Security Group de las instancias EC2**.

---

## 3. Fase 1: Configuración en la Consola Web de AWS

### A. Configurar los Security Groups (VPC / EC2)
1. **Security Group para las instancias EC2 (`sg-ec2`):**
   * **Regla de entrada:** Puerto `22` (SSH) desde tu IP o `0.0.0.0/0` para conectarte por terminal.
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

## 4. Fase 2: Formatear y Montar el Disco EBS (10 GB) en Instancia 1

Conéctate por SSH a la **Instancia 1** y ejecuta los siguientes comandos:

1. **Identificar el nombre del disco nuevo de 10 GB:**
   ```bash
   lsblk -f
   ```
   > *Nota:* En instancias `t3`, el disco adicional aparece como `nvme1n1` sin formato (`FSTYPE` vacío).

2. **Crear la carpeta que servirá como punto de montaje:**
   ```bash
   sudo mkdir -p /disco2
   ```

3. **Formatear el disco con el sistema de archivos XFS:**
   ```bash
   sudo mkfs -t xfs /dev/nvme1n1
   ```
   > *Importante:* Si intentas montar sin formatear primero, Linux mostrará error de superbloque inválido.

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

## 6. Fase 4: Conectar la Instancia 2 y Comprobar Sincronización

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

3. **Escribir desde la Instancia 2 para validar sincronización bidireccional:**
   ```bash
   echo "Hola desde la segunda instancia" | sudo tee -a /efs1/prueba.txt
   cat /efs1/prueba.txt
   ```
   > Al ejecutar `cat /efs1/prueba.txt` nuevamente en la **Instancia 1**, ambas líneas aparecerán reflejadas al instante.

---

## 7. Resumen de Comandos Útiles de Verificación

| Comando | Función |
| :--- | :--- |
| `lsblk -f` | Lista discos conectados, formato (`xfs`), `UUID` y puntos de montaje. |
| `df -hT` | Muestra el espacio usado/disponible en GB/MB y el tipo de sistema (`xfs`, `nfs4`). |
| `ls -la /efs1` | Lista todos los archivos (incluidos ocultos) y permisos dentro del EFS. |
| `cat /efs1/prueba.txt` | Muestra en pantalla el contenido del archivo de texto. |


Adiconal a eso vimos otros conceptos:

### 1. Stateful vs. Stateless en Security Groups

La diferencia entre ambos términos se resume en si el firewall tiene **"memoria"** o no sobre las conexiones de red:

* **Stateful (Con estado):** Significa que el firewall tiene **memoria**. Así es como funcionan los **Security Groups** en AWS. Si tú permites que una petición entre (regla de entrada), el Security Group recuerda esa conexión y deja que la respuesta salga automáticamente, sin que tengas que crear una regla de salida. *(En otras palabras: si logra entrar, puede salir)*.


* **Stateless (Sin estado):** Significa que el firewall **no tiene memoria** (en AWS así funcionan las *Network ACLs*, no los Security Groups). Evalúa el tráfico de entrada y de salida por separado. Si dejas entrar tráfico, debes configurar manualmente otra regla de salida para permitir que la respuesta regrese.



---

### 2. ¿Por qué NO abrir al mundo (`0.0.0.0/0`) y SÍ a otro Security Group?

* **El problema de especificar "el mundo" (`0.0.0.0/0`):** La dirección `0.0.0.0/0` representa cualquier dirección IP de todo Internet. Si abres un puerto interno a todo el mundo, dejas tu servidor expuesto a rastreos automáticos y posibles ataques externos. Solo debe usarse en puertos que obligatoriamente tengan que ser públicos (como el puerto 80 o 443 de una página web).


* **La ventaja de apuntar a otro Security Group:** En AWS, en vez de escribir una IP en el origen (*Source*), puedes indicar el ID de otro Security Group. Por ejemplo, le dices al almacenamiento o base de datos: *"solo acepta conexiones que vengan de servidores que pertenezcan al Security Group de mis instancias EC2"*.


* **Más seguridad:** Únicamente tus servidores autorizados pueden comunicarse entre sí, bloqueando el resto de Internet.


* **Crecimiento automático:** Si luego creas 10 servidores nuevos y les asignas ese mismo Security Group, obtienen acceso inmediato sin que tengas que editar reglas ni añadir IPs una por una.





---

### 3. ¿Qué es NFS (Network File System)?

* **Qué es:** Es un **protocolo de red estándar** (muy utilizado en sistemas Linux y Unix) que permite a una computadora acceder, leer y escribir archivos en una carpeta remota a través de la red como si estuvieran en su propio disco local.


* **Cómo funciona:** Un servidor comparte ("exporta") una carpeta y los equipos clientes la conectan ("montan") dentro de su propio sistema de archivos.


* **Puerto clave:** En su versión moderna (**NFSv4**), utiliza exclusivamente el puerto **TCP 2049**.



---

### 4. ¿Qué es EFS (Amazon Elastic File System)?

* **Qué es:** Es el servicio de almacenamiento de archivos en red **totalmente administrado** (*serverless*) de AWS, construido por debajo sobre el protocolo **NFS (NFSv4)**.


* **Sus ventajas principales:**
* **Compartido entre muchos:** Cientos o miles de instancias EC2 pueden conectarse al mismo EFS y leer o modificar los mismos archivos al mismo tiempo.


* **Elástico:** No necesitas definir un tamaño fijo de disco; crece automáticamente cuando guardas archivos y se reduce cuando los borras, pagando solo por el espacio que ocupas.


* **Administrado y seguro:** AWS se encarga del hardware y replica los datos en varias Zonas de Disponibilidad para evitar pérdidas.





> **Cómo se conecta todo:** Para usar un **EFS** de forma segura con tus instancias EC2, abres el puerto **TCP 2049** (del protocolo **NFS**) en el Security Group del EFS y pones como origen el **Security Group de tus instancias EC2** (nunca `0.0.0.0/0`).
> 
>

---

### 2026-11-21 — Apuntes de Curso AWS
Modulo 1

Servicio Web:
Cualquier software generado, que utiliza internet y tiene un formato estandarizado como: XML o JSON para solicitud y respuesta de una API

Marco de adopción nube en AWS:
6 pilares CAF:

Capacidades empresariales
Negocio: Necesidades y Requerimientos
Gente: formación técnica y dotación 
Gobernanza: Objetivos empresariales

Capacidades técnicas
Plataforma: Entender y cominicar la naturaleza de los sistemas
Seguridad: cumplir objetivos de seguridad
Operaciones: Como se utilza el negocio


====================================================
Modulo 2

Modelos de precios de AWS

Informática:
    Cobra por hora o segundo
    Varia por tipo de instancia

Almacenamiento
    Cobra por GB

Transferencia de datos
    dependiendo si es la misma region es gratis sino:
        datos de salida se cobra
        datos de entrada
        normalmente se cobra por GB

Filosofia, paga por lo que utiliza
investigar esto: Pagar menos si usa mas como funciona esto y como se relaciona con Economías de escala

Costo total de propiedad (TCO): identifa costos directos e indirectos de un sistema
    util: 
        compara la infraestructura completa o específica de una carga de trabajo
        presupuestar y desarrollar caso de negocio

Calcualdora de costo mensual AWS: Crea estimaciones del costo de los casos prácticos en AWS

AWS Organizations
    ques es: Permite consolidar varias cuentas de AWS y administrarlas de forma centralizada
    4 pasos para: Investigar
    beneficios: 
        Agrupar cuentas y adjuntar políticas: AWS Organizations permite estructurar múltiples cuentas dentro de unidades organizativas (OU) y aplicarles políticas de control de servicios (SCP) de forma centralizada a todo el grupo.
        Automatización mediante API: Facilita la creación de nuevas cuentas de AWS y su incorporación automática a la estructura organizativa mediante llamadas programáticas a la API.
    Caracteristicas de seguridad:
        Agrupa cuentas de AWS en unidades organizativas
        Permite integración y compatibilidad con IAM
        Utiliza políticas de control de servicios
    Politicas de Control de servicios (SCP): control centralizado sobre las cuentas
    Cumplen con las directrices de control de acceso
    Caracteríticas:
        sintaxis similar a IAM
        No concede permisos
        especifican los permisos máximos para una organización

En AWS Academy (Módulo 2: Economía y Facturación de la Nube), estas siglas corresponden a las tres modalidades de pago disponibles al adquirir Instancias Reservadas (a plazos de 1 o 3 años), donde a mayor pago inicial, mayor es el descuento obtenido:

AURI (All Upfront Reserved Instance — Pago inicial completo): Se abona el 100 % del costo de la reserva al inicio del período, ofreciendo el máximo descuento disponible.

PURI (Partial Upfront Reserved Instance — Pago inicial parcial): Se paga una fracción por adelantado y el saldo restante se factura en cuotas mensuales con descuento durante la vigencia del contrato.

NURI (No Upfront Reserved Instance — Sin pago inicial): No requiere ningún pago por adelantado; el importe total se divide en pagos mensuales con un descuento menor que las opciones anteriores.

Panel de Amazon EC2: Muestra únicamente el estado operativo actual de las instancias, volúmenes y límites en la región, pero no ofrece informes históricos de facturación.   Panel de AWS Trusted Advisor: Inspecciona el entorno para brindar recomendaciones proactivas de optimización (ahorro de costos, seguridad, tolerancia a fallos, rendimiento y cuotas de servicio), pero no funciona como historial detallado de consumo facturado.   Registros de AWS CloudTrail almacenados en Amazon S3: Registran el historial de llamadas a la API y la actividad de los usuarios para auditoría y gobernanza, no los detalles financieros de facturación

AWS Cost Explorer (Explorador de costos de AWS) es la herramienta diseñada para visualizar, comprender y administrar los costos y el uso de los servicios de AWS a lo largo del tiempo.

En el marco de AWS Academy (Módulo 2: Economía y Facturación de la Nube), estos son los cuatro planes oficiales de soporte que ofrece AWS, ordenados de menor a mayor nivel de cobertura:

Basic: Es gratuito para todas las cuentas de AWS e incluye servicio al cliente 24/7 para consultas de facturación y cuentas, documentación, foros y comprobaciones básicas de AWS Trusted Advisor (sin soporte técnico especializado).

Developer: Pensado para entornos de prueba y desarrollo; ofrece soporte técnico por correo electrónico en horario laboral y tiempos de respuesta inferiores a 12 o 24 horas según la gravedad del caso.

Business: Diseñado para entornos de producción; brinda soporte técnico 24/7 por teléfono, chat y correo electrónico, acceso completo a las comprobaciones de AWS Trusted Advisor y tiempos de respuesta de menos de 1 hora si un sistema de producción cae.

Enterprise: Orientado a cargas de trabajo de misión crítica; incluye un Administrador Técnico de Cuentas (TAM) dedicado, soporte de conserjería para facturación y un tiempo de respuesta inferior a 15 minutos ante caídas críticas del negocio.

En AWS Academy (Módulo 2: Economía y Facturación de la Nube), existen diversos servicios de redes, seguridad, facturación y aprovisionamiento que no generan ningún costo adicional por sí mismos, aunque sí se factura el uso de los recursos subyacentes que despliegan o gestionan:Servicios sin costo adicional: Herramientas como Amazon VPC, AWS IAM, Facturación consolidada (Consolidated Billing), AWS Elastic Beanstalk, AWS Auto Scaling, AWS OpsWorks y AWS CloudFormation son gratuitas en cuanto a su uso y administración.   Cobro por recursos asociados: Si utilizas CloudFormation, Elastic Beanstalk o Auto Scaling para lanzar infraestructura, pagarás normalmente por los recursos de AWS que estos aprovisionen y consuman en tu cuenta (como instancias Amazon EC2, volúmenes Amazon EBS o bases de datos Amazon RDS). 


==============================================================

Modulo 3

Infraestructura global de AWS: un entorno flexible en al nube que se puede acceder en diferentes regiones

Region de AWS: zona geográfica
    Replicación: Controlada por usted
    Comuniación: Utiliza una red troncal 
    Es una ubicación física con varias zonas de disponibilidad
    Cada región está ubicada en un área geográfica independiente 

Zonas de disponibilidad:
    una region tiene varias zonas
        Zona:
            particion completamente aislada de AWS
            tienen centros de datos discretos, una zona puede estar compuesta por uno o más centros de datos 
            aislan errores
            se interconectan con otras zonas mediante redes privadas de alta velocidad
            usted elige la zona
            recomendación: replicar datos y recursos entre zonas para mayor resiliencia

Centros de datos AWS
    Brindan seguridad
    Almacenan y procesan datos
    Tienen: alimentación, redes, conectividad redundante e instalación independiente

Amazon CloudFront: una red de entrega de contenido (CDN) a usuarios finales con latencia reducida
Caches de borde regionales para contenido de acceso poco frecuente
Ubicaciones de borde: mantiene una red global de cientos de ubicaciones de borde distribuidas en ciudades de todo el mundo —incluidos muchos países y zonas donde no hay una Región completa

Caracteristicas de Infraestructura:
    Elasticidad: adaptación dinámica de la capacidad
    Escalabilidad: adapatación a admitir crecimiento

    Tolerancia a errores: hay un error sigue funcionando, redundancia integrada de los componentes

    Alta disponibilidad: activo 24/7 bajo cualquier circunstancia

================================================================================================================

Modulo 4

Seguridad

Modelo de responsabilidad compartida de AWS
Cliente: "Dentro o EN" de la Nube: 
                administración de app, 
                Configuracion: SO, red, firewall
                Grupos de seguridad
                Cifrado de datos

AWS: "De" la Nube:
        Software
        Computación, Almacenamiento, Base de datos, Redes
        Infraestructura del Hardware
        Regiones, disponibilidad, ubicaciones de borde
        Mantenimiento del hardware físico

AWS Indentity and Access Management (IAM):
        Def: Administrar acceso a los recursos de  AWS
        Recurso: una entidad en una cuenta donde se puede trabajar y que puede hacer
        Derechos de acceso: 
            Quien: obtener acceso del recurso
            A qué: recursos obtener acceso y que puede hacer el usuario con ese recurso
            Cómo: obtener accesos a los recursos

Componentes IAM
    Persona: persona que se autentica con cuenta

    Grupo: colecciones o conjunto de personas que tienen mismos permisos
        Un usuario puede tener varios grupos
        No hay grupo predeterminado
        los grupos no pueden estar anidados


    Política: documento que define acceso a recursos y nivel de acceso
        Tipos:
            Indentidad: 
                Acciones que puede o no puede hacer
                Se puede asociar una política a varias entidades
                Una entidad puede tener varias políticas asociadas a ella
                Consulta: que es una entidad en este contexto
            Recurso:
                Consultar
                que es eso de bucket de S3
            Consultar: que es esto de permisos: autorización, denegación y otra parte de explicito e implicito

    Rol: conjunto de permisos a fin de realizar solicitudes
        Asocia políticas de permisos al usuario IAM
        No está asociado de forma exclusiva a un usuario
        Está diseñado para que el rol lo pueda asumir una persona, apliacación o servicio
        Proporciona credenciales temporales

Puedes decirme si hay una manera jerarquica de estos componentes por ejemplo: 1. creo política con accesos -> 2. asocio la pólitica a un rol, dame un ejemplo algo asi pero con todos los componentes una especia de diagrama de flujo de un ejemplo de Nube AWS que involucre todo esto 

Analiza esto puede que este mal pero el flujo seria el siguiente: 1. Crear pólitca, 2. asociar polítca a un rol creado o existente, 3. Crear grupo y es grupo asocial al rol o diferentes roles, 4. crear usuario y asignarlo a algun grupo

Tipos de acceso para persona o usuario IAM
    Mediante programación:
        ID clave de acceso
        Clave de acceso remota
        Acceso a: CLI y SDK
    Mediante consola de administración:
        ID cuenta o alias 12 digitos
        Nombre de usuario IAM
        contraseña IAM
        Opcional: multifactor-auth(MFA) código de autentificación

MFA de IAM
    Proporciona más seguridad ya que requiere un código de autentificación

Usuario Raiz
En AWS Academy (Módulo 4: Seguridad en la nube de AWS), una práctica recomendada fundamental es evitar el uso del usuario raíz (root user) para tareas cotidianas y reservarlo exclusivamente para operaciones críticas a nivel de cuenta que requieren privilegios de propietario, entre las que destacan:Cambiar el plan de soporte de AWS (o cancelarlo).   Modificar la configuración principal de la cuenta (correo electrónico, contraseña o nombre de la cuenta).Cerrar la cuenta de AWS o restaurar permisos de un administrador de IAM.

En AWS Academy (Módulo 4: Seguridad en la nube de AWS), una práctica recomendada fundamental tras iniciar sesión por primera vez es eliminar las claves de acceso (Access Key ID y Secret Access Key) asociadas al usuario raíz (root user), activar la autenticación multifactor (MFA) y crear un usuario administrativo en AWS IAM para operar en el día a día. De este modo se impide que alguien pueda realizar llamadas mediante programación con privilegios ilimitados sobre toda la cuenta.

Autorización
    Asigna permisos mediante pólitica de IAM
    Permisos: determinan que recursos y operaciones pueden hacer
        por defecto: todo permiso denegado
    Práctica recomendada: principio de mínimo privilegio

Que es AWS CloudTrail
Habilitar informe facturación y uso

AWS Key Managment Service (KMS)
    Permite crear y administrar claves de cifrado
    Controla el uso de cifrado en servicios y aplicaciones
    Integra CloudTrail
    Utiliza modulos de seguridad HSM y FIPS 140-2 para proteger claves
    tipos de acceso que puede otorgar a un usuario:
        Acceso mediante programación
        Acceso a la consola de administración de AWS
    práticas recomendadas para proteger su cuenta:
        Administrar el acceso a los recursos de AWS
        Definir derechos de acceso detallados

Amazon Cognito
    Incorpora: control de acceso, inicio de sesión, registro en app y movil
    Escala a millones de usuarios
    Admite inicio de sesión con diferentes proveedores como: Facebook, Google, Amazon y empresariales como Microsoft Active Directory

AWS Shield
    Servicio administrado de protección contra ataques (DDoD)
    Protege aplicaciones que se ejecutan en AWS 
    Detección permanente y mitigaciones directas automáticas
    Uso: minimizar tiempo de inactividad y la latencia de la aplicación

Cifrado de datos en reposo
    cifrado codifica los datos con una clave secreta para que no sean legibles
        Aquel que tiene la clave secreta puede descodificar los datos
        AWS KMS puede administrar sus claves secretas
    Datos en reposo: datos almacenados fisicamente

Cifrado de datos en tránsito
    datos que migran a través de la red
    Investigar Transport Layer Security (TLS) protocolo estandar abierto

    investigar que es: HTTP y HTTPS

Prorgamas de conformidad
    Colabora con organismos de certifación y auditores independientes
    Clasificación:
        Certificaiones y acreditaciones:
        Leyes, regulaciones y privacidad
        Alineaciones y marcos de trabajo

AWS Config
    Evalúe, audite y analice configuraciones de recursos
    monitoreo de configuraciones
    Evaluación de configuraciones registradas vs deseadas
    Revisión de cambios de configuración
    Historial de configuración
    Simplifique auditoría y análisis de seguridad

AWS Artifact
    Recurso destinado a información con la conformidad
    Proporciona: informes de seguridad y conformidad
    Acceso a descargas: Certificaciones, Informes del sector de tarjetas de pago
---

### 2026-11-26 — Aclaraciones de Terraform y Redes

**Tipo de entrada:** ampliación y revisión de dudas de Terraform (Taller 12) y Security Groups.

#### Dudas y notas registradas

- ¿Qué son los archivos `variables.tf`? (investigar esta parte).
- `outputs.tf`: lo que quiero imprimir en consola como salida.
- Explicar de mejor manera qué es *stateful* y *stateless*.
- ¿Qué quiere decir `0.0.0.0` (y `0.0.0.0/0`)?
- ¿Qué es dependencia cíclica en el contexto de Terraform? *(Ejemplo planteado para revisar: primero crear instancias sin security groups y después colocar los security groups).*

> *Procesado el 2026-11-26: integrado y corregido en `03-redes-seguridad.md`, `06-terraform.md` y `12-talleres-terraform.md`.*
