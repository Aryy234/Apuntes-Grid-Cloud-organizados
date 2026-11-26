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





    

