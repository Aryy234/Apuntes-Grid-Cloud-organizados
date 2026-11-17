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
