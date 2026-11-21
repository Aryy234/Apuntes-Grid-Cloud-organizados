# 10. Economía, Facturación y Soporte en AWS (Curso AWS — Módulo 2)

Fecha de apuntes: 2026-11-21

[Volver al índice](LEEME.md)

> **Paréntesis:** Estos apuntes pertenecen al **Módulo 2 del curso de AWS (AWS Academy: Economía y Facturación de la Nube)** y complementan los conceptos económicos vistos en [1. Fundamentos de computación en la nube](01-fundamentos.md) (CAPEX vs. OPEX y economías de escala) y [2. Servicios de AWS y Amazon EC2](02-ec2.md).

---

## 1. Tres factores fundamentales de costo en AWS

La filosofía principal de AWS es **pagar solo por lo que se utiliza**, sin contratos obligatorios a largo plazo. Los tres impulsores de costo principales son:

1. **Informática (Cómputo):**
   * Se cobra por **hora o por segundo** de ejecución.
   * El precio varía según el **tipo y familia de instancia** (vCPU y RAM).
2. **Almacenamiento:**
   * Se cobra normalmente por **GB almacenado** al mes.
3. **Transferencia de datos:**
   * **Datos de entrada (desde Internet hacia AWS):** Generalmente **gratuitos**.
   * **Datos de salida (desde AWS hacia Internet o hacia otra Región):** **Se cobran por GB** (de forma agregada).
   * **Entre servicios dentro de la misma Zona de Disponibilidad (con IP privada):** Suele ser gratuito o de bajo costo si cruza zonas.

---

## 2. Filosofía de precios y Economías de Escala

*(Resolución de la nota de investigación: «¿Cómo funciona "pagar menos si usa más" y cómo se relaciona con Economías de escala?»).*

* **Paga menos cuando usas más (Descuentos por volumen):** En servicios de almacenamiento (como Amazon S3) o transferencia de datos, AWS aplica precios escalonados por niveles (*tiers*). Cuantos más GB consumas al mes, **más barato te cuesta cada GB adicional**.
* **Paga menos cuando reservas:** Si comprometes capacidad por 1 o 3 años (**AURI, PURI, NURI** en EC2 o RDS), obtienes hasta un 72 % de descuento frente al pago bajo demanda.
* **Relación con las Economías de Escala (Paga aún menos a medida que AWS crece):** Como AWS agrupa el consumo de millones de clientes en todo el mundo, compra hardware, energía y ancho de banda a costos unitarios mucho más bajos que cualquier empresa individual. AWS traslada ese ahorro reduciendo periódicamente los precios de sus servicios para todos los clientes.

---

## 3. Costo Total de Propiedad (TCO) y Calculadora de Precios

* **Costo Total de Propiedad (TCO — *Total Cost of Ownership*):** Es una estimación financiera que identifica tanto los **costos directos** (servidores, licencias) como los **costos indirectos** (electricidad, refrigeración, espacio físico, personal de mantenimiento) de mantener un sistema local frente a llevarlo a la nube.
  * **Para qué es útil:** Para comparar una infraestructura *on-premises* contra AWS, presupuestar cargas de trabajo y construir un **caso de negocio** para la gerencia.
* **Calculadora de precios de AWS (*AWS Pricing Calculator*):** Herramienta web gratuita que permite crear **estimaciones detalladas del costo mensual** de arquitecturas y casos prácticos antes de desplegarlos en AWS.

---

## 4. Servicios sin costo adicional vs. recursos que sí cobran

En AWS existen servicios de gestión, seguridad, red y aprovisionamiento cuyo uso es **gratuito por sí mismo**, pero **sí pagas por los recursos subyacentes** que estos crean o utilizan:

| Servicios gratuitos (sin costo adicional) | Qué sí genera cobro al usarlos |
| --- | --- |
| **Amazon VPC** (Red virtual privada) | Componentes opcionales como NAT Gateway o VPN. |
| **AWS IAM** (Identidades y accesos) | Totalmente gratuito. |
| **Facturación consolidada** (*Consolidated Billing* en AWS Organizations) | El consumo real de cada cuenta miembro. |
| **AWS Auto Scaling**, **AWS CloudFormation**, **AWS Elastic Beanstalk**, **AWS OpsWorks** | Las instancias **Amazon EC2**, volúmenes **Amazon EBS**, balanceadores o bases de datos **Amazon RDS** que estas herramientas aprovisionen automáticamente. |

---

## 5. Herramientas de monitoreo de costos vs. estado operativo

Es importante no confundir qué herramienta sirve para ver **facturas** y cuál para **operaciones o auditoría**:

| Herramienta | Función principal | ¿Muestra historial financiero de facturación? |
| --- | --- | --- |
| **AWS Cost Explorer** (Explorador de costos) | Visualizar, analizar y proyectar los **costos y el consumo** de AWS a lo largo del tiempo mediante gráficos y filtros. | **Sí** (es la herramienta oficial de análisis de costos). |
| **Panel de Amazon EC2** | Muestra el estado operativo actual de las instancias, volúmenes y límites de la región. | **No.** |
| **AWS Trusted Advisor** | Inspecciona tu cuenta y da recomendaciones automáticas en **5 categorías**: optimización de costos, seguridad, tolerancia a fallos, rendimiento y límites/cuotas de servicio. | **No** (da consejos de ahorro, no historial de facturas). |
| **AWS CloudTrail (en S3)** | Registra quién hizo qué llamada a la API y cuándo para **auditoría de seguridad**. | **No.** |

---

## 6. Planes de Soporte de AWS (AWS Support)

AWS ofrece **4 planes oficiales de soporte**, ordenados de menor a mayor cobertura:

| Plan | Para quién está pensado | Cobertura y canales | AWS Trusted Advisor | Tiempo de respuesta crítico y TAM |
| --- | --- | --- | --- | --- |
| **1. Basic** | Todas las cuentas (incluido **gratis** por defecto). | Atención 24/7 solo para facturación y cuenta; foros y documentación. *(Sin soporte técnico)*. | Solo comprobaciones básicas. | Sin SLA técnico. No incluye TAM. |
| **2. Developer** | Entornos de **prueba y desarrollo**. | Soporte técnico por **correo electrónico** en horario laboral. | Solo comprobaciones básicas. | `< 24 h` (sistema afectado) / `< 12 h` (sistema deteriorado). No incluye TAM. |
| **3. Business** | Entornos de **producción**. | Soporte técnico **24/7 por teléfono, chat y correo**. | **Acceso completo** a todas las comprobaciones. | **`< 1 hora`** si un sistema de producción cae. No incluye TAM. |
| **4. Enterprise** | Cargas de trabajo de **misión crítica** para la empresa. | Soporte 24/7 completo + **Conserjería de facturación**. | **Acceso completo** a todas las comprobaciones. | **`< 15 minutos`** ante caída crítica. **Incluye un TAM** (*Technical Account Manager* — Administrador Técnico de Cuentas dedicado). |
