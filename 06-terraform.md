# 6. Infraestructura como código con Terraform

Clase: 05/11/2026

Última actualización: 2026-11-26

[Volver al índice](LEEME.md)

**Terraform** es una herramienta de código abierto de **Infraestructura como Código (IaC)** creada por HashiCorp. Permite definir, crear, actualizar y eliminar (CRUD) recursos en la nube mediante archivos de configuración (extensión `.tf`, normalmente con `main.tf` como archivo principal) de manera **declarativa**: defines tus intenciones (el *estado deseado*), no el paso a paso manual.

---

## 1. ¿Cómo funciona internamente?

En lugar de entrar a la consola web de AWS y hacer clic para crear servidores o firewalls, escribes archivos `.tf` en lenguaje **HCL** (*HashiCorp Configuration Language*). Terraform se comunica con las APIs de AWS mediante un plugin llamado **Provider** y registra todo lo que crea en un **archivo de estado**.

```mermaid
%% diagram:flujo-terraform
flowchart LR
    A["Archivos .tf (Código deseado)"] --> B["Terraform CLI"]
    B --> C["Provider AWS (Plugin)"]
    C --> D["API de AWS (Recursos reales)"]
    B <--> E["terraform.tfstate (Estado actual)"]
```

### Archivos especiales que genera Terraform

| Archivo / Carpeta | ¿Para qué sirve? | ¿Se sube a Git? |
| :--- | :--- | :--- |
| `main.tf` | Archivo principal con los recursos (`resource`) y el proveedor (`provider`). | **Sí** |
| `variables.tf` | Declara las **variables de entrada** (`variable`) para parametrizar el proyecto sin escribir valores fijos. *(Convención oficial en plural; Terraform lee cualquier `*.tf`, por eso `variable.tf` también funciona).* | **Sí** |
| `outputs.tf` | Declara las **salidas** (`output`) que se muestran en consola al desplegar y se exponen para otros módulos o scripts. | **Sí** |
| `terraform.tfvars` *(opcional)* | Asigna valores concretos a las variables definidas en `variables.tf` (por ejemplo, distintos valores para desarrollo vs. producción). | Depende (no si tiene secretos) |
| `.terraform/` | Carpeta oculta donde `terraform init` descarga el plugin del proveedor (ej. `hashicorp/aws`). | **No** |
| `.terraform.lock.hcl` | Archivo candado que fija la versión exacta del proveedor para despliegues reproducibles. | **Sí** (recomendado) |
| `terraform.tfstate` | **Archivo de estado.** Mapea tu código con los recursos reales en AWS (IDs, IPs, etc.). Permite saber qué actualizar o destruir. | **No** (puede contener datos sensibles) |
| `terraform.tfstate.backup` | Respaldo automático del estado inmediatamente anterior al último cambio. | **No** |

> **Regla clave de organización:** Terraform lee **todos los archivos `.tf`** de la carpeta como un solo bloque lógico. Separar en `main.tf`, `variables.tf` y `outputs.tf` no cambia la ejecución, pero mantiene el código limpio, reutilizable y fácil de mantener.

---

## 2. Anatomía del código HCL (Bloques fundamentales)

### 2.1 Bloque `provider` (Proveedor)
Define **con qué nube o plataforma** se conecta Terraform y en qué región operará.

```hcl
provider "aws" {
  region = "us-east-1"
}
```

- `"aws"`: nombre del proveedor oficial de Amazon Web Services.
- `region`: región geográfica de despliegue (`us-east-1` = Norte de Virginia).

### 2.2 Bloque `resource` (Recurso)
Es el bloque principal. Cada `resource` declara **un objeto real de infraestructura** en AWS (una instancia EC2, un Security Group, una regla de red, etc.).

```hcl
resource "<TIPO_DE_RECURSO>" "<NOMBRE_LOCAL>" {
  argumento_1 = "valor_1"
  argumento_2 = "valor_2"
}
```

Es clave distinguir **tres nombres distintos**:

1. **Tipo de recurso (`<TIPO_DE_RECURSO>`):** Definido por el proveedor AWS (no se puede inventar). Indica *qué servicio de AWS* se creará (`aws_instance`, `aws_security_group`, etc.).
2. **Nombre local (`<NOMBRE_LOCAL>`):** Lo eliges libremente. Solo existe **dentro de Terraform** para referenciar el recurso desde otros bloques (ej. `mi_instancia`, `mi-sg`).
3. **Nombre en AWS (`name` o `tags.Name`):** Es el argumento interno que define cómo aparecerá el recurso en la consola web de AWS.

#### Tipos de `resource` usados en los talleres de clase

| Tipo de recurso | Servicio AWS | ¿Para qué sirve? |
| :--- | :--- | :--- |
| `aws_security_group` | EC2 / VPC | Crea un firewall virtual que agrupa reglas de tráfico entrante y saliente. |
| `aws_vpc_security_group_ingress_rule` | EC2 / VPC | Crea una **regla de entrada** desacoplada y la vincula a un Security Group (práctica recomendada por AWS). |
| `aws_vpc_security_group_egress_rule` | EC2 / VPC | Crea una **regla de salida** desacoplada y la vincula a un Security Group. |
| `aws_instance` | EC2 | Aprovisiona una máquina virtual (instancia EC2) con AMI, tamaño, llave SSH y red. |

### 2.3 Archivo `variables.tf` y bloque `variable` (Variables de entrada)
El archivo **`variables.tf`** centraliza los parámetros configurables del proyecto para evitar valores fijos (*hardcoded*) en `main.tf` y reutilizar la misma infraestructura cambiando solo datos (región, AMI, tipo de instancia, llave SSH o cantidad).

```hcl
variable "cantidad_instancias" {
  description = "Cantidad de instancias"
  type        = number
  default     = 2
}
```

| Campo | Obligatorio | ¿Para qué sirve? |
| :--- | :--- | :--- |
| `"nombre"` | Sí | Identificador de la variable. Se lee en el código como `var.<nombre>` (ej. `var.cantidad_instancias`). |
| `description` | No (recomendado) | Documenta qué valor representa la variable. |
| `type` | No (recomendado) | Restringe el tipo de dato: `string`, `number`, `bool`, `list(...)`, `map(...)`, etc. |
| `default` | No | Valor por defecto. Si se omite, Terraform lo pedirá por terminal al ejecutar `plan` o `apply`. |

**¿Cómo recibe sus valores una variable?** (de menor a mayor prioridad):
1. Valor `default` dentro de `variables.tf`.
2. Variables de entorno (`TF_VAR_<nombre>`).
3. Archivo `terraform.tfvars` (se carga automáticamente si existe).
4. Bandera en terminal: `terraform apply -var="cantidad_instancias=3"`.

### 2.4 Archivo `outputs.tf` y bloque `output` (Salidas)
El archivo **`outputs.tf`** define qué valores generados por AWS quieres **imprimir en consola** al terminar `terraform apply` (o volver a consultar con `terraform output`), sin tener que buscarlos en la consola web. Además, permite **exponer esos datos** para que otros módulos de Terraform o scripts externos los consuman.

```hcl
output "ip_publica_instancias" {
  description = "Direcciones IP públicas de las instancias creadas"
  value       = aws_instance.mi_instancia-efs[*].public_ip
}
```

| Campo | Obligatorio | ¿Para qué sirve? |
| :--- | :--- | :--- |
| `"nombre"` | Sí | Nombre con el que se imprimirá la salida en terminal. |
| `description` | No | Explica qué información devuelve la salida. |
| `value` | Sí | Atributo o expresión de los recursos que se quiere mostrar. |
| `sensitive` | No | Si es `true`, oculta el valor en la consola (útil para contraseñas o tokens). |

### 2.5 Expresiones y conceptos clave en HCL

- **Referencias y dependencias implícitas:** Al escribir `vpc_security_group_ids = [aws_security_group.mi-sg.id]`, Terraform detecta automáticamente que **primero debe crear el Security Group** y luego la instancia EC2, sin definir el orden a mano.
- **Meta-argumento `count` e interpolación `${...}`:** Con `count = var.cantidad_instancias`, Terraform crea *N* copias del recurso usando un índice `count.index` que inicia en `0`. Al escribir `"Mi instancia EFS - ${count.index + 1}"`, genera nombres numerados (`1`, `2`, ...).
- **Expresión *Splat* (`[*]`):** Cuando un recurso usa `count`, se convierte en una lista. La sintaxis `aws_instance.mi_instancia-efs[*].public_ip` recorre todas las instancias y extrae una lista con el atributo `public_ip` de cada una.
- **Funciones nativas (`length()`):** `length(aws_instance.mi_instancia-efs)` devuelve cuántos elementos fueron creados en esa lista de instancias.

### 2.6 Dependencia lineal vs. Dependencia cíclica (`Error: Cycle`)

Internamente, Terraform construye un **grafo de dependencias** (DAG) para saber en qué orden crear y destruir recursos.

- **Dependencia lineal (normal):** El recurso `B` necesita un dato de `A`, pero `A` no necesita nada de `B` (`A -> B`).
  - *Ejemplo:* `aws_instance` usa `aws_security_group.mi-sg.id`. Terraform crea primero el Security Group y luego la instancia EC2.
- **Dependencia cíclica (error):** Dos o más recursos **se necesitan mutuamente para poder crearse** (`A <-> B`). Terraform no puede decidir cuál va primero y aborta con `Error: Cycle`.

#### ¿Dónde ocurre en nuestro contexto (Taller 12: EC2 + EFS)?

Ocurre cuando **dos Security Groups se referencian entre sí mediante reglas inline** (dentro de cada bloque `aws_security_group`):
1. `SG_Instancias` define un `egress` hacia `SG_EFS.id` (necesita que `SG_EFS` exista primero).
2. `SG_EFS` define un `ingress` desde `SG_Instancias.id` (necesita que `SG_Instancias` exista primero).

```mermaid
%% diagram:dependencia-ciclica
flowchart LR
    SG1["SG Instancias (con egress inline)"] <-->|"Ciclo: ambos se necesitan primero"| SG2["SG EFS (con ingress inline)"]
```

**Solución (aplicada en el Taller 12):** Crear primero ambos Security Groups **vacíos** (sin reglas *inline*) y después agregar las reglas como **recursos separados** (`aws_vpc_security_group_ingress_rule` y `aws_vpc_security_group_egress_rule`). Así ambos IDs ya existen cuando se crean las reglas y el ciclo desaparece.

> **Corrección importante sobre EC2 y Security Groups:** Crear una instancia EC2 que referencia un Security Group **NO es una dependencia cíclica**, sino una dependencia lineal (`SG -> EC2`): no hace falta crear la instancia sin SG y asociarlo después, porque el SG no depende de la instancia. La estrategia de «crear primero los recursos base vacíos y vincularlos después» aplica precisamente al caso de **dos Security Groups que se referencian mutuamente** (o si una regla del SG intentara leer la IP privada de la propia instancia que usa ese SG).

---

## 3. Guía de comandos en terminal (Ciclo de vida)

Todos los comandos de Terraform se ejecutan **dentro de la carpeta del proyecto** que contiene los archivos `.tf`.

```mermaid
%% diagram:ciclo-comandos
flowchart LR
    C0["0. aws configure"] --> C1["1. terraform init"]
    C1 --> C2["2. fmt / validate"]
    C2 --> C3["3. terraform plan"]
    C3 --> C4["4. terraform apply"]
    C4 --> C5["5. output / show"]
    C5 --> C6["6. terraform destroy"]
```

1. **Configurar credenciales de AWS**
   ```bash
   aws configure
   ```
   - Guarda `AWS Access Key ID`, `AWS Secret Access Key`, región (`us-east-1`) y formato (`json`). En AWS Academy / Learner Lab recuerda incluir también el `aws_session_token` en `~/.aws/credentials`.

2. **Inicializar el proyecto (primera vez o al agregar proveedores)**
   ```bash
   terraform init
   ```
   - Descarga el plugin del proveedor AWS en `.terraform/` y crea `.terraform.lock.hcl`.

3. **Formatear y validar sintaxis (sin tocar AWS)**
   ```bash
   terraform fmt
   terraform validate
   ```
   - `fmt` indenta y ordena el código automáticamente; `validate` verifica que la sintaxis HCL y las referencias sean válidas.

4. **Previsualizar el plan de ejecución**
   ```bash
   terraform plan
   ```
   - Compara tus `.tf` contra `terraform.tfstate` y AWS. Símbolos del plan:
     - `+` (**create**): se creará un recurso nuevo.
     - `~` (**update in-place**): se modificará sin destruirlo.
     - `-` (**destroy**): se eliminará.
     - `-/+` (**replace**): se destruirá y recreará (ej. al cambiar la AMI de una EC2).

5. **Aplicar los cambios en AWS**
   ```bash
   terraform apply
   ```
   - Muestra el plan, pide confirmación (`yes`), crea los recursos en AWS, actualiza `terraform.tfstate` e imprime los `outputs`. (Con `-auto-approve` omite la confirmación manual).

6. **Inspeccionar el despliegue actual**
   ```bash
   terraform output
   terraform state list
   terraform show
   ```
   - `output` vuelve a mostrar las salidas (como IPs públicas); `state list` enumera los recursos gestionados; `show` muestra todos los atributos guardados en el estado.

7. **Destruir la infraestructura al terminar el laboratorio**
   ```bash
   terraform destroy
   ```
   - Elimina todos los recursos registrados en el estado respetando el orden inverso de dependencias. Es fundamental ejecutarlo al terminar cada práctica para evitar costos o consumo de créditos.

---

## Conceptos relacionados

- [Talleres prácticos de Terraform: Taller 8 (EC2) y Taller 12 (EC2 + SG EFS)](12-talleres-terraform.md).
- [Redes y seguridad: VPC y Security Groups](03-redes-seguridad.md).
- [Consola, AWS CLI y SDK](05-herramientas-aws.md).
