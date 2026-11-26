# Computación Grid y Cloud

Apuntes de clase organizados por temas, con ejemplos, comandos, diagramas y prácticas de AWS y Terraform.

## Ver los apuntes en línea

**[Abrir los apuntes en la web](https://apuntes-grid-cloud.vercel.app/)**

El sitio permite consultar los temas, diagramas e imágenes desde el navegador (incluso sin conexión si abres `index.html` localmente).

## Archivos del repositorio

- [Índice de temas](LEEME.md): acceso a los apuntes organizados en Markdown (`01-*.md` a `10-*.md`).
- [Apuntes de clase](Apuntes%20de%20clase.md): archivo de entrada para añadir nuevas clases por fecha.
- [Versión HTML](index.html): página publicada en Vercel (generada automáticamente).
- [Script de construcción y sincronización](scripts/construir.mjs): regenera `index.html` desde todos los temas Markdown y mantiene sincronizado `../cloud-u1-ps-ae/documentacion.md`.
- [Imágenes](imagenes/): material visual utilizado por los apuntes.

## Flujo de actualización (1 solo comando)

1. Edita el archivo Markdown del tema correspondiente (o crea uno nuevo siguiendo la numeración `11-nombre.md`).
2. Ejecuta el script desde la raíz de este repositorio:
   ```bash
   node scripts/construir.mjs
   ```
   Esto actualiza automáticamente:
   - **`index.html`** (menú lateral, buscador, contenido de todos los temas y diagramas SVG offline).
   - **`../cloud-u1-ps-ae/documentacion.md`** (documentación centralizada de Terraform sincronizada a partir de `06-terraform.md` y `10-talleres-terraform.md`, si el repositorio vecino existe en la misma carpeta padre).
3. Haz `git commit` y `git push` para que Vercel publique los cambios en la web.
