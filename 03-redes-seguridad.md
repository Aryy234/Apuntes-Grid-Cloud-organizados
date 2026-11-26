# 3. Redes y seguridad: VPC y Security Groups

Clase: 20/10/2026

[Volver al índice](LEEME.md)

**VPC ID:** Es el identificador único que AWS asigna a una Virtual Private Cloud, es decir, una red lógica aislada dentro de la nube donde despliegas tus recursos (servidores, bases de datos, etc.). Sirve para referenciar esa red específica en configuraciones, APIs y otros servicios. 

**Security Groups:** 

Son firewalls virtuales que *controlan el tráfico de entrada y salida (se configuran)* de tus instancias (como EC2), permitiendo solo los puertos, protocolos y orígenes que definen. Son *stateful*: si permites una conexión de entrada, la respuesta sale automáticamente sin regla adicional.

**Regla de entrada (Inbound):** Define qué tráfico externo puede llegar a tu instancia, indicando protocolo, puerto y origen; por ejemplo, SSH (TCP puerto 22) permite conectarte de forma remota a un servidor Linux, idealmente restringido a tu IP.

**Regla de salida (Outbound):** Define qué tráfico puede salir de tu instancia hacia otros destinos (internet, otras redes o servicios); por defecto en AWS permite todo el tráfico saliente. La regla de salida que se crea por defecto es la de internet

## Ampliación de clase — 2026-11-12

Última actualización: 2026-11-17

### Stateful y stateless

| Control | Comportamiento | Tráfico de respuesta |
| --- | --- | --- |
| Security Group | Stateful: sigue el estado de las conexiones. | La respuesta de una conexión permitida se autoriza automáticamente. |
| Network ACL | Stateless: evalúa entrada y salida por separado. | Deben permitirse ambos sentidos, incluidos los puertos de retorno necesarios. |

### Permitir NFS desde otro Security Group

En el grupo del destino de montaje EFS, permite entrada TCP 2049 con el grupo de EC2 como origen. En EC2, permite la salida correspondiente. La referencia al grupo evita enumerar individualmente las IP de las instancias asociadas; también deben cumplirse las rutas y los demás controles de red.

`0.0.0.0/0` abarca todas las direcciones IPv4. Una regla así no crea por sí sola acceso desde Internet: también depende de la conectividad. En este taller, restringe SSH a tu IP y NFS al grupo de EC2.

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
