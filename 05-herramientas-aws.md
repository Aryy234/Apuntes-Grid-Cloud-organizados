# 5. Consola, AWS CLI y SDK

Clase: 27/10/2026

[Volver al índice](LEEME.md)

**Mecanismos de acceso e interacción con AWS** (o *Herramientas de gestión e interfaces de AWS*)

* **AWS Web (Consola de administración):** Interfaz gráfica accesible desde cualquier navegador para configurar y supervisar tus recursos visualmente. Es ideal para tareas exploratorias, monitoreo en tiempo real y administraciones manuales sin tocar la terminal.

* **AWS CLI por consola:** Herramienta que permite interactuar con los servicios de AWS ejecutando comandos directos en la terminal. Permite automatizar despliegues por medio de scripts y ejecutar operaciones repetitivas con rapidez.

  * Configuración inicial  
    * access key  
    * secret key  
    * session token


```bash
aws ec2 run-instances --image-id ami-XXXXXXXX --instance-type t3.micro --key-name MiKeyPair --count 1
```

* --image-id: Sistema operativo que usará el servidor (ID de la AMI).  
* --instance-type: Capacidad de hardware (CPU y RAM, ej. t3.micro).  
* --key-name: Nombre de tu clave SSH registrada en AWS (sin extensión .pem).  
* --count: Número de servidores que se van a crear.

* **SDK (Software Development Kit):** Conjunto de librerías para lenguajes específicos (Python, Node.js, Java) que integra AWS dentro de tus programas. Facilita que tus aplicaciones se conecten, envíen datos o controlen la infraestructura desde su propio código.
