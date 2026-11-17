# 8. Práctica: conexión SSH y montaje de EBS

Clase: 10/11/2026

[Volver al índice](LEEME.md)

> Antes de formatear, identifica el dispositivo correcto con `lsblk -f`. El comando `mkfs` elimina datos del volumen seleccionado. Los nombres de dispositivo pueden variar entre instancias.

## 1. Conexión a la instancia EC2

1. **Conectar por SSH a Amazon Linux 2023**
   ```bash
   ssh -i "mi-primera-llaves-ae.pem" ec2-user@ec2-54-87-193-187.compute-1.amazonaws.com
   ```
   - **Para qué sirve:** Inicia una sesión remota segura por SSH hacia la instancia utilizando tu archivo de llave privada (`.pem`).

---

## 2. Inspección de discos disponibles

2. **Listar dispositivos de bloque y tamaños**
   ```bash
   lsblk
   ```
   - **Para qué sirve:** Muestra los discos y particiones conectados al servidor con su tamaño (`20G` en `xvda` y `10G` en `xvdb`), tipo y punto de montaje.

3. **Verificar sistemas de archivos y UUID**
   ```bash
   lsblk -f
   ```
   - **Para qué sirve:** Lista los dispositivos junto con su tipo de sistema de archivos (`FSTYPE`), identificador `UUID` y espacio disponible. Permite comprobar que el disco nuevo (`xvdb`) está vacío y sin formato.

4. **Consultar metadatos del nuevo disco**
   ```bash
   sudo blkid /dev/sdb
   ```
   - **Para qué sirve:** Consulta el `UUID` y formato del disco `/dev/sdb`. Al estar recién creado, no devuelve información.

---

## 3. Formateo y montaje del nuevo volumen

5. **Crear el directorio de montaje**
   ```bash
   sudo mkdir -p /disco2
   ```
   - **Para qué sirve:** Crea la carpeta `/disco2` con permisos de administrador, la cual funcionará como punto de montaje para acceder al disco.

6. **Formatear el volumen con sistema de archivos XFS**
   ```bash
   sudo mkfs -t xfs /dev/sdb
   ```
   - **Para qué sirve:** Formatea el disco `/dev/sdb` asignándole el sistema de archivos **XFS** *(sin este paso previo, `mount` arroja error de superbloque/formato inválido)*.

7. **Montar el disco en el sistema**
   ```bash
   sudo mount /dev/sdb /disco2
   ```
   - **Para qué sirve:** Vincula el disco ya formateado dentro de `/disco2` para que el sistema operativo pueda leer y escribir en él.

---

## 4. Verificación y prueba de escritura

8. **Comprobar espacio disponible y tipo de formato**
   ```bash
   df -hT
   ```
   - **Para qué sirve:** Muestra el espacio libre y usado de todos los discos en formato legible (`GB`/`MB`) junto con su sistema de archivos (`xfs`), confirmando que `/disco2` está activo *(reemplaza a `df` y corrige el error de escritura `df -ht`)*.

9. **Crear un archivo de prueba en el volumen**
   ```bash
   echo "texto de prueba" | sudo tee /disco2/prueba.txt
   ```
   - **Para qué sirve:** Crea el archivo `prueba.txt` dentro del nuevo disco con permisos de administrador y escribe una línea de texto para validar la escritura.

10. **Leer el archivo creado**
    ```bash
    cat /disco2/prueba.txt
    ```
    - **Para qué sirve:** Muestra en pantalla el contenido de `prueba.txt` para confirmar que los datos se guardaron correctamente.

11. **Verificación final de montaje y formato**
    ```bash
    lsblk -f
    ```
    - **Para qué sirve:** Comprueba que `xvdb` ya cuenta con formato `xfs`, un `UUID` propio asignado y punto de montaje activo en `/disco2`.
