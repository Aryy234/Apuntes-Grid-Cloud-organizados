# Computación Grid y Cloud

Apuntes organizados · 15 de octubre al 26 de noviembre de 2026

Abre **index.html** en el navegador para leer todos los temas. También puedes consultar cada archivo Markdown por separado. Mantén la carpeta `imagenes` junto a los documentos; contiene las 11 imágenes originales, sin pérdida de calidad. No se necesita conexión a internet.

## Índice

1. [Fundamentos de computación en la nube](01-fundamentos.md) *(+ Complemento Curso AWS: Módulos 1 y 3)*
2. [Servicios de AWS y Amazon EC2](02-ec2.md) *(+ Complemento Curso AWS: Módulo 2)*
3. [Redes y seguridad: VPC y Security Groups](03-redes-seguridad.md) *(+ Complemento Curso AWS: Módulo 4)*
4. [Automatización inicial con User Data](04-user-data.md)
5. [Consola, AWS CLI y SDK](05-herramientas-aws.md) *(+ Complemento Curso AWS: Módulo 4)*
6. [Infraestructura como código con Terraform](06-terraform.md)
7. [Almacenamiento: EBS, EFS y NFS](07-almacenamiento.md) *(+ Complemento Curso AWS: Módulos 2 y 4)*
8. [Práctica: conexión SSH y montaje de EBS](08-practica-ebs.md)
9. [Taller de almacenamiento EBS y EFS](09-taller-ebs-efs.md)
10. [Economía, Facturación y Soporte en AWS (Curso AWS — Módulo 2)](10-economia-facturacion.md)
11. [Seguridad, IAM y Gobernanza en AWS (Curso AWS — Módulos 2 y 4)](11-seguridad-iam.md)
12. [Talleres prácticos de Terraform (EC2 y EFS)](12-talleres-terraform.md)

## Actualización del 2026-11-26

Se amplió el tema [06-terraform.md](06-terraform.md) con teoría HCL, estado, rol de `variables.tf` y `outputs.tf`, explicación de **dependencia cíclica (`Error: Cycle`)** y guía de comandos; se reforzó [03-redes-seguridad.md](03-redes-seguridad.md) con **stateful vs. stateless** y **`0.0.0.0/0` vs. `0.0.0.0`**; y se incorporó [12-talleres-terraform.md](12-talleres-terraform.md) documentando los talleres prácticos (`taller8-ae2` y `taller12-efs-ae`) del repositorio `cloud-u1-ps-ae`. Además, `scripts/construir.mjs` regenera `index.html` (con flashcards, búsqueda y diagramas SVG) y sincroniza automáticamente la documentación con `cloud-u1-ps-ae`.

## Actualización del 2026-11-21

Se integraron y clasificaron los apuntes de los **Módulos 1 al 4 del Curso de AWS (AWS Academy)** registrados el 2026-11-21:
- Se añadieron bloques complementarios en los temas `01`, `02`, `03`, `05` y `07` indicando que pertenecen al curso de AWS.
- Se crearon los temas `10-economia-facturacion.md` y `11-seguridad-iam.md` con las consultas resueltas y el diagrama de flujo de componentes de IAM.
- [Escribir nuevos apuntes](Apuntes%20de%20clase.md).

## Actualización del 2026-11-17

Se incorporó la clase del 2026-11-12 al taller 09 y a los temas 03 y 07. Las aclaraciones técnicas tienen enlaces a documentación de AWS.

## Cambios de organización

Se extrajeron las imágenes incrustadas, se separaron los temas, se eliminaron espacios y repeticiones, y se repararon los bloques de código. Se corrigieron las denominaciones de IaaS y EFS y la confusión entre tipos de volúmenes EBS y familias EC2. El contenido sigue siendo material de clase: no se ha realizado una revisión técnica exhaustiva. El documento original permanece intacto.
