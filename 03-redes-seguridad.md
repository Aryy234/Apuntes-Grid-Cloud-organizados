# 3. Redes y seguridad: VPC y Security Groups

Clase: 20/10/2026

[Volver al índice](LEEME.md)

**VPC ID:** Es el identificador único que AWS asigna a una Virtual Private Cloud, es decir, una red lógica aislada dentro de la nube donde despliegas tus recursos (servidores, bases de datos, etc.). Sirve para referenciar esa red específica en configuraciones, APIs y otros servicios. 

**Security Groups:** 

Son firewalls virtuales que *controlan el tráfico de entrada y salida (se configuran)* de tus instancias (como EC2), permitiendo solo los puertos, protocolos y orígenes que definen. Son *stateful*: si permites una conexión de entrada, la respuesta sale automáticamente sin regla adicional.

**Regla de entrada (Inbound):** Define qué tráfico externo puede llegar a tu instancia, indicando protocolo, puerto y origen; por ejemplo, SSH (TCP puerto 22) permite conectarte de forma remota a un servidor Linux, idealmente restringido a tu IP.

**Regla de salida (Outbound):** Define qué tráfico puede salir de tu instancia hacia otros destinos (internet, otras redes o servicios); por defecto en AWS permite todo el tráfico saliente. La regla de salida que se crea por defecto es la de internet

## Ampliación de clase — 2026-11-12 y 2026-11-26

Última actualización: 2026-11-26

### Stateful vs. Stateless (con memoria vs. sin memoria)

*(Nota ortográfica: se escribe **stateful**, con una sola `l`.)*

La diferencia entre ambos mecanismos es si el firewall **recuerda las conexiones activas** (mantiene una tabla de estado) o si evalúa cada paquete por separado:

| Característica | **Stateful** (Con estado) | **Stateless** (Sin estado) |
| :--- | :--- | :--- |
| **Servicio en AWS** | **Security Group** (a nivel de instancia / interfaz de red). | **Network ACL (NACL)** (a nivel de subred). |
| **¿Tiene memoria?** | **Sí.** Registra las conexiones permitidas. | **No.** Evalúa cada paquete como si fuera nuevo. |
| **Tráfico de respuesta** | **Automático:** si entra una petición permitida, la respuesta puede salir aunque no exista regla de salida para ella. | **Manual:** debes permitir explícitamente la entrada **y** también la salida de retorno (puertos efímeros `1024–65535`). |
| **Tipo de reglas** | Solo reglas de **permitir (`Allow`)**; todo lo demás se bloquea por defecto. | Reglas numeradas de **permitir (`Allow`) y denegar (`Deny`)**. |
| **Analogía rápida** | Un guardia con registro: si te dejó entrar, te deja salir automáticamente. | Un peaje sin memoria: revisa permiso al entrar y vuelve a revisarlo al salir. |

> **Ejemplo real del Taller 12:** El Security Group del EFS (`mi-sg-efs-14`) solo define una regla de **entrada** (`TCP 2049` desde las EC2) y **ninguna regla de salida**. Aun así el EFS responde a las instancias porque el Security Group es *stateful*.

### ¿Qué significa `0.0.0.0/0` y `0.0.0.0`?

Conviene distinguir la notación CIDR usada en AWS/Terraform (`0.0.0.0/0`) de la dirección sin máscara (`0.0.0.0`):

- **`0.0.0.0/0` (Notación CIDR — «cualquier dirección IPv4»):** El prefijo `/0` indica que **0 bits están fijos**, por lo que abarca todo el rango IPv4 (`0.0.0.0` a `255.255.255.255`). En la práctica se traduce como **«todo Internet / cualquier origen o destino»**.
  - En **entrada (`ingress`)**: acepta tráfico desde cualquier IPv4 (normal para puertos web públicos `80`/`443`; evitarlo en producción para SSH `22` o NFS `2049`).
  - En **salida (`egress`)**: permite que la instancia salga hacia cualquier IPv4 (por ejemplo, descargar paquetes o actualizaciones).
  - **Matiz clave:** Abrir `0.0.0.0/0` en un Security Group **no crea acceso a Internet por sí solo** si la instancia está en una subred privada sin Internet Gateway ni IP pública; simplemente no filtra ninguna IPv4.
  - **Comparación útil:** Una única IP exacta usa `/32` (ej. `203.0.113.10/32` para solo tu equipo); el equivalente de `0.0.0.0/0` en IPv6 es `::/0`.
- **`0.0.0.0` (sin `/0`, en servidores o aplicaciones):** Cuando un servidor web o proceso escucha (*bind*) en `0.0.0.0:80`, significa que acepta conexiones en **todas las interfaces de red** de esa máquina (a diferencia de `127.0.0.1`, que solo responde en local).

### Permitir NFS desde otro Security Group

En el grupo del destino de montaje EFS, permite entrada `TCP 2049` usando como origen el **ID del Security Group de las EC2** (nunca `0.0.0.0/0`). En las EC2, permite la salida correspondiente. Referenciar otro Security Group evita listar IPs una por una y otorga acceso automático si agregas más instancias con ese mismo grupo.

[Ver taller completo](09-taller-ebs-efs.md).

Fuentes: [AWS: Security Groups y ACL](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Security.html), [AWS: seguridad de red EFS](https://docs.aws.amazon.com/efs/latest/ug/network-access.html).

---

## Complemento — Curso AWS Academy (Módulo 4: Seguridad de red y datos)

*(Apuntes del curso oficial de AWS Academy que complementan la seguridad de red y protección de aplicaciones. Para identidad, permisos IAM y gobernanza, consulta el tema [11. Seguridad, IAM y Gobernanza en AWS](11-seguridad-iam.md)).*

### 1. Ubicación de VPC y Security Groups en el Modelo de Responsabilidad Compartida

* **Responsabilidad del cliente (Seguridad «EN» la nube):** Configurar correctamente los **Security Groups**, las reglas de firewall, las tablas de ruteo de la VPC, el sistema operativo y el cifrado de los datos.
* **Responsabilidad de AWS (Seguridad «DE» la nube):** Proteger el cableado físico, los switches, routers físicos y los centros de datos donde corre la red virtual.

### 2. Cifrado de datos en tránsito: TLS, HTTP y HTTPS

*(Resolución de la nota de investigación del Módulo 4 sobre datos que viajan por la red).*

* **Datos en tránsito:** Son todos los datos que se están moviendo activamente a través de una red (por ejemplo, entre el navegador de un cliente y tu instancia EC2, o entre una EC2 y Amazon EFS).
* **TLS (Transport Layer Security):** Es el protocolo estándar abierto (sucesor de SSL) que **cifra la comunicación en red** extremo a extremo para que nadie pueda interceptar ni alterar la información en el camino. *(En el taller 09 lo usamos al montar EFS con `-o tls`)*.
* **HTTP vs. HTTPS:**
  * **HTTP** (*Hypertext Transfer Protocol* — Puerto **TCP 80**): Envía la información en **texto plano** sin cifrar; cualquiera que intercepte la red puede leer contraseñas o datos.
  * **HTTPS** (*HTTP Secure* — Puerto **TCP 443**): Es exactamente HTTP pero protegido por una capa de **TLS**. Cifra todo el tráfico entre el usuario y el servidor y verifica la identidad del sitio mediante certificados digitales.

### 3. AWS Shield (Protección de red contra ataques DDoS)

* **¿Qué es?** Servicio administrado de protección contra ataques de **Denegación de Servicio Distribuido (DDoS)** *(corregido de «DDoD» en el apunte original)*.
* **Cómo funciona:** Monitorea el tráfico de red de forma permanente y aplica mitigaciones automáticas e inmediatas para evitar que tráfico malicioso sature tus servidores, minimizando la latencia y el tiempo de inactividad.
* **Niveles:** *AWS Shield Standard* (gratuito y activo por defecto en todas las cuentas) y *AWS Shield Advanced* (protección avanzada de pago).
