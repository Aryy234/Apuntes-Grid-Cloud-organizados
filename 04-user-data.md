# 4. Automatización inicial con User Data

Clase: 22/10/2026

[Volver al índice](LEEME.md)

**User Data:** permite pasar un script o configuración a una instancia (en AWS EC2), que se ejecuta solo en el primer arranque.

**Configuración:**

```bash
#!/bin/bash
sudo dnf update -y
sudo dnf install -y httpd
sudo systemctl enable --now httpd
IP=$(hostname -I | awk '{print $1}')
USUARIO=$(whoami)
HOSTNAME=$(hostname)
FECHA=$(date)
sudo tee /var/www/html/index.html > /dev/null << EOF
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mi primer servidor en AWS</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    h1 { color: #38bdf8; }
    p { color: #94a3b8; }
  </style>
</head>
<body>
  <h1>¡Hola Ariel Elizalde desde EC2!</h1>
  <h1>IP: $IP</h1>
  <h1>Usuario: $USUARIO</h1>
  <h1>Hostname: $HOSTNAME</h1>
  <h1>Fecha: $FECHA</h1>
  <p>Apache está funcionando en mi instancia de AWS.</p>
</body>
</html>
EOF
```

 Las “instrucciones” son comandos automáticos (bash o cloud-config) como instalar paquetes, crear usuarios o levantar servicios, para que la instancia se configure sola.


**cloud-init.log** (`/var/log/cloud-init.log`): Registro detallado de los eventos internos de cloud-init, el servicio que ejecuta la configuración inicial de la instancia; sirve para diagnosticar qué etapas se ejecutaron y cuáles fallaron.

**cloud-init-output.log** (`/var/log/cloud-init-output.log`): Captura la salida estándar y los errores de los comandos de tu script de User Data; es el primero que se revisa para depurar fallos del script.
