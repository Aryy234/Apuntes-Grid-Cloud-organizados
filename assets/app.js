/* ==========================================================================
   Computación Grid y Cloud — Interactive Study App (Zero Dependencies)
   ========================================================================== */

(() => {
  'use strict';

  const STORAGE_KEYS = {
    theme: 'gridcloud_theme',
    studied: 'gridcloud_studied_topics',
    knownCards: 'gridcloud_known_flashcards'
  };

  /* Safe localStorage helpers (works offline & in restricted contexts) */
  const storage = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignore storage errors silently
      }
    }
  };

  /* Normalize text for accent-insensitive search */
  const normalizeText = (str) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  /* ========================================================================
     Flashcards Bank (36 tarjetas: 3 por cada uno de los 12 temas)
     ======================================================================== */
  const FLASHCARDS = [
    // Tema 01
    {
      id: 'fc-01-1',
      topicId: '01-fundamentos',
      topicLabel: '1. Fundamentos Cloud',
      q: '¿Cuáles son los 3 modelos de servicio en la nube y un ejemplo de cada uno?',
      a: 'IaaS (Infraestructura como servicio, ej. servidor virtual EC2), PaaS (Plataforma como servicio, ej. bases de datos o APIs administradas) y SaaS (Software como servicio para usuario final, ej. Gmail u Outlook).'
    },
    {
      id: 'fc-01-2',
      topicId: '01-fundamentos',
      topicLabel: '1. Fundamentos Cloud',
      q: '¿Cuál es la diferencia clave entre CAPEX y OPEX?',
      a: 'CAPEX es gasto de capital (inversión inicial en activos físicos que se deprecian en años). OPEX es gasto operativo continuo del día a día (pago por uso en la nube, deducible en el mismo período fiscal).'
    },
    {
      id: 'fc-01-3',
      topicId: '01-fundamentos',
      topicLabel: '1. Fundamentos Cloud',
      q: '¿En qué se diferencian una Región de AWS, una Zona de Disponibilidad (AZ) y una Ubicación de Borde?',
      a: 'Una Región es un área geográfica física (ej. us-east-1) con varias AZ aisladas para tolerancia a fallos. Una Ubicación de Borde (Edge Location) guarda contenido en caché cerca del usuario mediante Amazon CloudFront.'
    },
    // Tema 02
    {
      id: 'fc-02-1',
      topicId: '02-ec2',
      topicLabel: '2. Servicios AWS y EC2',
      q: '¿Qué es una AMI (Amazon Machine Image) en Amazon EC2?',
      a: 'Es una imagen de máquina virtual preconfigurada (sistema operativo y software) que sirve como plantilla reutilizable para lanzar instancias idénticas de forma rápida y consistente.'
    },
    {
      id: 'fc-02-2',
      topicId: '02-ec2',
      topicLabel: '2. Servicios AWS y EC2',
      q: '¿Qué significan AURI, PURI y NURI en Instancias Reservadas de EC2?',
      a: 'AURI (All Upfront: pago 100% inicial, máximo descuento), PURI (Partial Upfront: pago inicial parcial + cuotas, descuento intermedio) y NURI (No Upfront: $0 inicial en cuotas mensuales, menor descuento que AURI/PURI).'
    },
    {
      id: 'fc-02-3',
      topicId: '02-ec2',
      topicLabel: '2. Servicios AWS y EC2',
      q: '¿gp2/gp3 e io1/io2 son familias de instancias EC2?',
      a: 'No. Son tipos de volúmenes de almacenamiento Amazon EBS (gp2/gp3 = propósito general; io1/io2 = IOPS aprovisionadas de alto rendimiento).'
    },
    // Tema 03
    {
      id: 'fc-03-1',
      topicId: '03-redes-seguridad',
      topicLabel: '3. Redes y Seguridad',
      q: '¿Qué diferencia a un Security Group (stateful) de una Network ACL (stateless)?',
      a: 'Un Security Group es stateful: si permites tráfico de entrada, la respuesta sale automáticamente. Una Network ACL es stateless: evalúa entrada y salida por separado y exige permitir ambos sentidos.'
    },
    {
      id: 'fc-03-2',
      topicId: '03-redes-seguridad',
      topicLabel: '3. Redes y Seguridad',
      q: '¿Cuál es la diferencia técnica entre HTTP y HTTPS?',
      a: 'HTTP (puerto TCP 80) transmite datos en texto plano sin cifrar. HTTPS (puerto TCP 443) añade una capa de cifrado TLS extremo a extremo y verifica la identidad del sitio con certificados digitales.'
    },
    {
      id: 'fc-03-3',
      topicId: '03-redes-seguridad',
      topicLabel: '3. Redes y Seguridad',
      q: '¿Para qué sirve AWS Shield y qué niveles ofrece?',
      a: 'Es el servicio administrado de protección contra ataques DDoS. Tiene dos niveles: Shield Standard (gratuito y activo por defecto en todas las cuentas) y Shield Advanced (protección avanzada de pago).'
    },
    // Tema 04
    {
      id: 'fc-04-1',
      topicId: '04-user-data',
      topicLabel: '4. User Data',
      q: '¿Cuándo se ejecuta un script de User Data en una instancia EC2?',
      a: 'Por defecto se ejecuta automáticamente solo durante el primer arranque de la instancia para instalar paquetes, crear archivos o iniciar servicios.'
    },
    {
      id: 'fc-04-2',
      topicId: '04-user-data',
      topicLabel: '4. User Data',
      q: '¿Qué archivo de log revisas primero para depurar un error en tu script de User Data?',
      a: '/var/log/cloud-init-output.log porque captura la salida estándar y los errores exactos de los comandos de tu script (mientras /var/log/cloud-init.log registra los eventos internos de cloud-init).'
    },
    {
      id: 'fc-04-3',
      topicId: '04-user-data',
      topicLabel: '4. User Data',
      q: '¿Qué comando activa e inicia inmediatamente Apache (httpd) en Amazon Linux 2023?',
      a: 'sudo systemctl enable --now httpd'
    },
    // Tema 05
    {
      id: 'fc-05-1',
      topicId: '05-herramientas-aws',
      topicLabel: '5. Consola, CLI y SDK',
      q: '¿Cuáles son los 3 mecanismos principales para interactuar con AWS?',
      a: 'Consola de administración web (interfaz gráfica), AWS CLI (comandos y scripts desde terminal) y AWS SDK (librerías para Python, Node.js, Java, etc. integradas en tu código).'
    },
    {
      id: 'fc-05-2',
      topicId: '05-herramientas-aws',
      topicLabel: '5. Consola, CLI y SDK',
      q: '¿Qué credenciales requiere el acceso mediante programación (AWS CLI / SDK)?',
      a: 'Un Access Key ID (ID de clave de acceso) y una Secret Access Key (clave de acceso secreta), más un Session Token si se usan credenciales temporales.'
    },
    {
      id: 'fc-05-3',
      topicId: '05-herramientas-aws',
      topicLabel: '5. Consola, CLI y SDK',
      q: 'En el comando aws ec2 run-instances, ¿para qué sirven --image-id y --key-name?',
      a: '--image-id especifica el ID de la AMI (sistema operativo) y --key-name indica el nombre del par de claves SSH registrado en AWS (sin la extensión .pem).'
    },
    // Tema 06
    {
      id: 'fc-06-1',
      topicId: '06-terraform',
      topicLabel: '6. Terraform',
      q: '¿Qué significa que Terraform sea declarativo?',
      a: 'Que defines el estado final deseado de la infraestructura (intenciones) en archivos .tf, en lugar de escribir el paso a paso imperativo de cómo crear cada recurso.'
    },
    {
      id: 'fc-06-2',
      topicId: '06-terraform',
      topicLabel: '6. Terraform',
      q: '¿Cuál es el nombre habitual del archivo principal de Terraform y su extensión?',
      a: 'El archivo principal suele llamarse main.tf y los archivos de configuración usan la extensión .tf.'
    },
    {
      id: 'fc-06-3',
      topicId: '06-terraform',
      topicLabel: '6. Terraform',
      q: '¿Qué operaciones de ciclo de vida permite automatizar Terraform sobre infraestructura?',
      a: 'Permite definir, crear, actualizar y eliminar (CRUD) infraestructura como código (IaC) de forma automatizada.'
    },
    // Tema 07
    {
      id: 'fc-07-1',
      topicId: '07-almacenamiento',
      topicLabel: '7. Almacenamiento',
      q: '¿Qué diferencia a Amazon EBS, Amazon EFS y Amazon S3?',
      a: 'EBS es almacenamiento en bloques persistente (típico disco de una EC2); EFS es un sistema de archivos compartido en red vía NFS (múltiples EC2 a la vez); S3 es almacenamiento de objetos en buckets accesible por Internet.'
    },
    {
      id: 'fc-07-2',
      topicId: '07-almacenamiento',
      topicLabel: '7. Almacenamiento',
      q: '¿Qué puerto y protocolo usa Amazon EFS para montar archivos compartidos?',
      a: 'Utiliza el protocolo NFS (NFSv4) sobre el puerto TCP 2049.'
    },
    {
      id: 'fc-07-3',
      topicId: '07-almacenamiento',
      topicLabel: '7. Almacenamiento',
      q: '¿Qué caracteriza a un Bucket de Amazon S3 por defecto?',
      a: 'Tiene un nombre único a nivel mundial, es totalmente privado por defecto y permite adjuntar directamente una política basada en recursos (Bucket Policy).'
    },
    // Tema 08
    {
      id: 'fc-08-1',
      topicId: '08-practica-ebs',
      topicLabel: '8. Práctica EBS',
      q: '¿Por qué debes ejecutar lsblk -f antes de usar mkfs en un volumen EBS?',
      a: 'Para verificar qué dispositivo está realmente vacío y sin sistema de archivos (FSTYPE/UUID), ya que mkfs borra todos los datos existentes del volumen seleccionado.'
    },
    {
      id: 'fc-08-2',
      topicId: '08-practica-ebs',
      topicLabel: '8. Práctica EBS',
      q: '¿Cuál es la secuencia correcta de comandos para preparar y montar un volumen EBS vacío en /disco2?',
      a: '1) sudo mkdir -p /disco2  2) sudo mkfs -t xfs /dev/<dispositivo>  3) sudo mount /dev/<dispositivo> /disco2'
    },
    {
      id: 'fc-08-3',
      topicId: '08-practica-ebs',
      topicLabel: '8. Práctica EBS',
      q: '¿Para qué sirve el comando df -hT tras montar un disco?',
      a: 'Muestra el espacio usado y disponible en formato legible (GB/MB) junto con el tipo de sistema de archivos (ej. xfs o nfs4), confirmando que el montaje está activo.'
    },
    // Tema 09
    {
      id: 'fc-09-1',
      topicId: '09-taller-ebs-efs',
      topicLabel: '9. Taller EBS y EFS',
      q: '¿Cómo se debe configurar el Security Group del EFS para no abrirlo a todo Internet?',
      a: 'En la regla de entrada del Security Group del EFS se permite NFS (TCP 2049) poniendo como Origen el ID del Security Group de las instancias EC2 (ej. sg-ec2), en lugar de 0.0.0.0/0.'
    },
    {
      id: 'fc-09-2',
      topicId: '09-taller-ebs-efs',
      topicLabel: '9. Taller EBS y EFS',
      q: '¿Qué paquete se instala en Amazon Linux 2023 para montar EFS con cifrado TLS?',
      a: 'amazon-efs-utils (con sudo dnf install -y amazon-efs-utils) y luego se monta usando: sudo mount -t efs -o tls <fs-id>:/ /efs1.'
    },
    {
      id: 'fc-09-3',
      topicId: '09-taller-ebs-efs',
      topicLabel: '9. Taller EBS y EFS',
      q: 'Si reinicias la EC2 después de un montaje manual con mount, ¿se borran los datos del disco EBS/EFS?',
      a: 'No se borran los datos almacenados; solo se pierde el punto de montaje automático hasta configurarlo en /etc/fstab (o volver a montarlo).'
    },
    // Tema 10
    {
      id: 'fc-10-1',
      topicId: '10-economia-facturacion',
      topicLabel: '10. Economía y Facturación',
      q: '¿Cuáles son los 3 factores fundamentales de costo en AWS?',
      a: '1) Informática (por hora/segundo y tipo de instancia), 2) Almacenamiento (por GB al mes) y 3) Transferencia de datos (entrada suele ser gratis; salida hacia Internet u otra Región se cobra por GB).'
    },
    {
      id: 'fc-10-2',
      topicId: '10-economia-facturacion',
      topicLabel: '10. Economía y Facturación',
      q: '¿Qué herramienta oficial sirve para consultar el historial financiero de costos en AWS (y por qué NO es el panel de EC2)?',
      a: 'AWS Cost Explorer analiza y proyecta el historial financiero de costos. El panel de EC2 solo muestra el estado operativo actual de instancias y volúmenes.'
    },
    {
      id: 'fc-10-3',
      topicId: '10-economia-facturacion',
      topicLabel: '10. Economía y Facturación',
      q: '¿Qué plan de soporte de AWS incluye un TAM dedicado y respuesta crítica en menos de 15 minutos?',
      a: 'El plan Enterprise (pensado para cargas de misión crítica; incluye TAM, Conserjería de facturación y acceso completo a AWS Trusted Advisor).'
    },
    // Tema 11
    {
      id: 'fc-11-1',
      topicId: '11-seguridad-iam',
      topicLabel: '11. Seguridad, IAM y Gobernanza',
      q: 'En el Modelo de Responsabilidad Compartida, ¿qué protege AWS y qué protege el Cliente?',
      a: 'AWS protege la seguridad "DE" la nube (hardware físico, centros de datos, infraestructura global y virtualización). El Cliente protege la seguridad "EN" la nube (sus datos, cifrado, IAM, sistema operativo y Security Groups).'
    },
    {
      id: 'fc-11-2',
      topicId: '11-seguridad-iam',
      topicLabel: '11. Seguridad, IAM y Gobernanza',
      q: '¿Cuál es el orden de evaluación de permisos en AWS IAM si hay conflicto entre Allow y Deny?',
      a: '1) Denegación implícita por defecto. 2) Autorización explícita (Allow). 3) Denegación explícita (Deny), que SIEMPRE gana sobre cualquier Allow.'
    },
    {
      id: 'fc-11-3',
      topicId: '11-seguridad-iam',
      topicLabel: '11. Seguridad, IAM y Gobernanza',
      q: '¿Cuál es la diferencia entre AWS CloudTrail, AWS Config y AWS KMS?',
      a: 'CloudTrail audita quién hizo qué llamada a la API; AWS Config monitorea el historial y cambios de configuración de recursos; AWS KMS crea y administra claves de cifrado para datos en reposo.'
    },
    // Tema 12
    {
      id: 'fc-12-1',
      topicId: '12-talleres-terraform',
      topicLabel: '12. Talleres Terraform',
      q: 'En Terraform, ¿por qué conviene usar aws_vpc_security_group_ingress_rule/egress_rule (Taller 12) en vez de reglas inline (Taller 8)?',
      a: 'Porque desacoplan cada regla como un recurso independiente, evitan conflictos o recreaciones accidentales del Security Group y siguen la recomendación oficial actual de AWS y Terraform.'
    },
    {
      id: 'fc-12-2',
      topicId: '12-talleres-terraform',
      topicLabel: '12. Talleres Terraform',
      q: 'En el Taller 12, ¿qué hace count = var.cantidad_instancias junto con ${count.index + 1} y el operador [*] en outputs.tf?',
      a: 'count crea múltiples instancias idénticas; ${count.index + 1} numera sus etiquetas Name (1, 2, ...); y el operador splat [*] extrae una lista de atributos (como id o public_ip) de todas las instancias creadas.'
    },
    {
      id: 'fc-12-3',
      topicId: '12-talleres-terraform',
      topicLabel: '12. Talleres Terraform',
      q: '¿Qué archivo de Terraform guarda el mapeo con los recursos reales en AWS y por qué no debe subirse a Git?',
      a: 'terraform.tfstate (y su respaldo .backup). No deben subirse a Git —ni tampoco las llaves privadas .pem— porque exponen información interna de infraestructura y posibles credenciales o secretos.'
    }
  ];

  /* ========================================================================
     DOM References
     ======================================================================== */
  const docEl = document.documentElement;
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const menuToggleBtn = document.getElementById('menuToggle');
  const sidebarCloseBtn = document.getElementById('sidebarClose');
  const themeToggleBtn = document.getElementById('themeToggle');
  const topbarCurrent = document.getElementById('topbarCurrent');
  const readingProgress = document.getElementById('readingProgress');
  const backToTopBtn = document.getElementById('backToTop');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const articles = Array.from(document.querySelectorAll('article.topic-card'));
  const filterChips = Array.from(document.querySelectorAll('.filter-chip'));

  // Progress elements
  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');
  const heroProgressStat = document.getElementById('heroProgressStat');
  const heroCardsStat = document.getElementById('heroCardsStat');

  // State
  let studiedTopics = new Set(storage.get(STORAGE_KEYS.studied, []));
  let knownCards = new Set(storage.get(STORAGE_KEYS.knownCards, []));

  /* ========================================================================
     1. Theme Toggle (Light / Dark)
     ======================================================================== */
  const updateThemeIcon = (theme) => {
    if (!themeToggleBtn) return;
    themeToggleBtn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
    );
    themeToggleBtn.innerHTML =
      theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  };

  const applyTheme = (theme) => {
    docEl.setAttribute('data-theme', theme);
    storage.set(STORAGE_KEYS.theme, theme);
    updateThemeIcon(theme);
  };

  const currentTheme = docEl.getAttribute('data-theme') || 'light';
  updateThemeIcon(currentTheme);

  themeToggleBtn?.addEventListener('click', () => {
    const next = docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  /* ========================================================================
     2. Mobile Sidebar Drawer
     ======================================================================== */
  const setDrawer = (open) => {
    if (!sidebar || !sidebarBackdrop) return;
    sidebar.classList.toggle('open', open);
    sidebarBackdrop.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
    menuToggleBtn?.setAttribute('aria-expanded', String(open));
  };

  menuToggleBtn?.addEventListener('click', () => setDrawer(true));
  sidebarCloseBtn?.addEventListener('click', () => setDrawer(false));
  sidebarBackdrop?.addEventListener('click', () => setDrawer(false));

  navItems.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 960) setDrawer(false);
    });
  });

  /* ========================================================================
     3. Sidebar Category Filters
     ======================================================================== */
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      navItems.forEach((item) => {
        const cats = (item.dataset.cats || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        item.classList.toggle('hidden', !show);
      });
    });
  });

  /* ========================================================================
     4. Study Progress Management
     ======================================================================== */
  const updateProgressUI = () => {
    const total = articles.length;
    const count = studiedTopics.size;
    const pct = total ? Math.round((count / total) * 100) : 0;

    if (progressText) progressText.textContent = `${count} / ${total}`;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (heroProgressStat) heroProgressStat.textContent = `${count}/${total}`;
    if (heroCardsStat) heroCardsStat.textContent = `${knownCards.size}/${FLASHCARDS.length}`;

    navItems.forEach((item) => {
      const id = item.getAttribute('href')?.replace('#', '');
      item.classList.toggle('studied', studiedTopics.has(id));
    });

    articles.forEach((art) => {
      const isStudied = studiedTopics.has(art.id);
      art.classList.toggle('is-studied', isStudied);
      const btn = art.querySelector('.study-toggle-btn');
      if (btn) {
        btn.classList.toggle('studied', isStudied);
        btn.innerHTML = isStudied
          ? '<span>✓</span> Estudiado'
          : '<span>○</span> Marcar estudiado';
      }
    });
  };

  const toggleStudiedTopic = (topicId) => {
    if (studiedTopics.has(topicId)) {
      studiedTopics.delete(topicId);
    } else {
      studiedTopics.add(topicId);
    }
    storage.set(STORAGE_KEYS.studied, Array.from(studiedTopics));
    updateProgressUI();
  };

  /* ========================================================================
     5. Automatic Article Enrichment (Clean HTML -> Rich Interactive UI)
     ======================================================================== */
  const highlightBash = (code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      .split('\n')
      .map((line) => {
        if (/^\s*#/.test(line)) {
          return `<span class="tok-comment">${line}</span>`;
        }
        return line
          .replace(/(".*?"|'.*?')/g, '<span class="tok-str">$1</span>')
          .replace(/(\s--?[a-zA-Z0-9-]+)/g, '<span class="tok-flag">$1</span>')
          .replace(
            /^(\s*)(sudo|aws|terraform|git|ssh|lsblk|blkid|mkdir|mkfs|mount|df|echo|tee|cat|ls|dnf|systemctl)\b/,
            '$1<span class="tok-cmd">$2</span>'
          );
      })
      .join('\n');
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  };

  const CATEGORY_LABELS = {
    clase: { text: 'Clase', cls: 'badge-clase' },
    practica: { text: 'Práctica / Taller', cls: 'badge-practica' },
    aws: { text: 'Curso AWS Academy', cls: 'badge-aws' }
  };

  articles.forEach((article, idx) => {
    const topicId = article.id;
    const h1 = article.querySelector('h1');

    // A. Build Meta Bar (Badges + Study Button)
    const metaBar = document.createElement('div');
    metaBar.className = 'topic-meta-bar';

    const badgesWrap = document.createElement('div');
    badgesWrap.className = 'topic-badges';

    const cats = (article.dataset.cats || 'clase').split(' ').filter(Boolean);
    cats.forEach((cat) => {
      const info = CATEGORY_LABELS[cat];
      if (!info) return;
      const span = document.createElement('span');
      span.className = `badge ${info.cls}`;
      span.textContent = info.text;
      badgesWrap.appendChild(span);
    });

    if (article.dataset.date) {
      const dateBadge = document.createElement('span');
      dateBadge.className = 'badge badge-date';
      dateBadge.textContent = article.dataset.date;
      badgesWrap.appendChild(dateBadge);
    }

    const studyBtn = document.createElement('button');
    studyBtn.type = 'button';
    studyBtn.className = 'study-toggle-btn';
    studyBtn.addEventListener('click', () => toggleStudiedTopic(topicId));

    metaBar.appendChild(badgesWrap);
    metaBar.appendChild(studyBtn);
    article.insertBefore(metaBar, article.firstChild);

    // B. Build Internal TOC for H2 headings (if >= 2)
    const h2s = Array.from(article.querySelectorAll('h2'));
    if (h2s.length >= 2 && h1) {
      const details = document.createElement('details');
      details.className = 'topic-toc';

      const summary = document.createElement('summary');
      summary.textContent = `Contenido de este tema (${h2s.length} secciones)`;
      details.appendChild(summary);

      const list = document.createElement('ul');
      list.className = 'topic-toc-list';

      h2s.forEach((h2, hIdx) => {
        if (!h2.id) h2.id = `${topicId}-sec-${hIdx + 1}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${h2.id}`;
        a.textContent = h2.textContent.trim();
        li.appendChild(a);
        list.appendChild(li);
      });

      details.appendChild(list);
      h1.insertAdjacentElement('afterend', details);
    }

    // C. Wrap tables in .table-wrapper
    article.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('table-wrapper')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    // D. Enhance Code Blocks (<pre>) with Copy Button & Bash Highlighting
    article.querySelectorAll('pre').forEach((pre) => {
      const codeEl = pre.querySelector('code');
      const rawText = codeEl ? codeEl.textContent : pre.textContent;
      const langClass = codeEl?.className.match(/language-(\w+)/);
      const lang = langClass ? langClass[1] : 'código';

      if (codeEl && lang === 'bash') {
        codeEl.innerHTML = highlightBash(rawText);
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block';

      const header = document.createElement('div');
      header.className = 'code-header';

      const langLabel = document.createElement('span');
      langLabel.className = 'code-lang';
      langLabel.textContent = lang;

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'Copiar';
      copyBtn.addEventListener('click', async () => {
        try {
          await copyToClipboard(rawText.trim());
          copyBtn.textContent = '✓ Copiado';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copiar';
            copyBtn.classList.remove('copied');
          }, 1800);
        } catch {
          copyBtn.textContent = 'Error';
        }
      });

      header.appendChild(langLabel);
      header.appendChild(copyBtn);
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });

    // E. Semantic Blockquotes
    article.querySelectorAll('blockquote').forEach((bq) => {
      const txt = normalizeText(bq.textContent);
      if (txt.includes('mkfs') || txt.includes('destruir') || txt.includes('elimina datos')) {
        bq.classList.add('callout-danger');
      } else if (txt.includes('correccion') || txt.includes('importante') || txt.includes('requisitos')) {
        bq.classList.add('callout-warning');
      } else if (txt.includes('parentesis') || txt.includes('aws academy')) {
        bq.classList.add('callout-aws');
      }
    });

    // F. Make Images & Diagrams Zoomable (Lightbox)
    article.querySelectorAll('img').forEach((img) => {
      const figure = document.createElement('div');
      figure.className = 'zoomable-media';
      figure.setAttribute('role', 'button');
      figure.setAttribute('tabindex', '0');
      figure.setAttribute('aria-label', `Ampliar imagen: ${img.alt || 'Material de clase'}`);

      const hint = document.createElement('span');
      hint.className = 'zoom-hint';
      hint.textContent = '🔍 Ampliar';

      img.parentNode.insertBefore(figure, img);
      figure.appendChild(img);
      figure.appendChild(hint);

      const triggerZoom = () => openLightboxImage(img.src, img.alt || 'Material de clase');
      figure.addEventListener('click', triggerZoom);
      figure.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerZoom();
        }
      });
    });

    article.querySelectorAll('.diagram-box').forEach((box) => {
      const hint = document.createElement('span');
      hint.className = 'zoom-hint';
      hint.textContent = '🔍 Ampliar diagrama';
      box.appendChild(hint);
      box.addEventListener('click', () => {
        const svg = box.querySelector('svg');
        if (svg) openLightboxSvg(svg, svg.getAttribute('aria-label') || 'Diagrama de arquitectura');
      });
    });

    // G. Prev / Next Topic Footer Navigation
    const prevArt = articles[idx - 1];
    const nextArt = articles[idx + 1];
    const footerNav = document.createElement('nav');
    footerNav.className = 'topic-footer-nav';
    footerNav.setAttribute('aria-label', 'Navegación entre temas');

    if (prevArt) {
      const prevTitle = prevArt.querySelector('h1')?.textContent || 'Tema anterior';
      const a = document.createElement('a');
      a.className = 'topic-nav-btn prev';
      a.href = `#${prevArt.id}`;
      a.innerHTML = `<span class="topic-nav-label">← Tema anterior</span><span class="topic-nav-title">${prevTitle}</span>`;
      footerNav.appendChild(a);
    }

    if (nextArt) {
      const nextTitle = nextArt.querySelector('h1')?.textContent || 'Tema siguiente';
      const a = document.createElement('a');
      a.className = 'topic-nav-btn next';
      a.href = `#${nextArt.id}`;
      a.innerHTML = `<span class="topic-nav-label">Siguiente tema →</span><span class="topic-nav-title">${nextTitle}</span>`;
      footerNav.appendChild(a);
    }

    article.appendChild(footerNav);
  });

  updateProgressUI();

  /* ========================================================================
     6. Scroll-Spy, Reading Progress & Back-to-Top
     ======================================================================== */
  const setActiveTopic = (id) => {
    navItems.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
    });
    const activeArticle = articles.find((a) => a.id === id);
    if (activeArticle && topbarCurrent) {
      topbarCurrent.textContent = activeArticle.querySelector('h1')?.textContent || '';
    }
  };

  const updateScrollSpy = () => {
    const offset = window.scrollY + 140;
    let currentId = articles[0]?.id;
    for (const art of articles) {
      if (art.offsetTop <= offset) {
        currentId = art.id;
      } else {
        break;
      }
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) {
      currentId = articles[articles.length - 1]?.id || currentId;
    }
    if (currentId) setActiveTopic(currentId);
  };

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    if (readingProgress) readingProgress.style.width = `${pct}%`;
    if (backToTopBtn) backToTopBtn.classList.toggle('visible', scrollTop > 420);
    updateScrollSpy();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ========================================================================
     7. Lightbox (Images & SVG Diagrams with Zoom Controls)
     ======================================================================== */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxStage = document.getElementById('lightboxStage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxZoomIn = document.getElementById('lightboxZoomIn');
  const lightboxZoomOut = document.getElementById('lightboxZoomOut');
  const lightboxZoomReset = document.getElementById('lightboxZoomReset');
  const lightboxClose = document.getElementById('lightboxClose');
  let lightboxZoom = 100;

  const setLightboxZoom = (pct) => {
    lightboxZoom = Math.min(260, Math.max(60, pct));
    const media = lightboxStage?.firstElementChild;
    if (media) {
      media.style.width = `${lightboxZoom}%`;
      media.style.maxWidth = 'none';
    }
    if (lightboxZoomReset) lightboxZoomReset.textContent = `${lightboxZoom}%`;
  };

  const openLightbox = (node, caption) => {
    if (!lightboxModal || !lightboxStage) return;
    lightboxStage.innerHTML = '';
    lightboxStage.appendChild(node);
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightboxZoom = 100;
    node.style.width = '100%';
    node.style.maxWidth = '100%';
    if (lightboxZoomReset) lightboxZoomReset.textContent = '100%';
    lightboxModal.classList.add('open');
    document.body.classList.add('no-scroll');
  };

  const openLightboxImage = (src, alt) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    openLightbox(img, alt);
  };

  const openLightboxSvg = (svgEl, caption) => {
    const clone = svgEl.cloneNode(true);
    clone.removeAttribute('height');
    openLightbox(clone, caption);
  };

  const closeLightbox = () => {
    lightboxModal?.classList.remove('open');
    document.body.classList.remove('no-scroll');
    if (lightboxStage) lightboxStage.innerHTML = '';
  };

  lightboxZoomIn?.addEventListener('click', () => setLightboxZoom(lightboxZoom + 30));
  lightboxZoomOut?.addEventListener('click', () => setLightboxZoom(lightboxZoom - 30));
  lightboxZoomReset?.addEventListener('click', () => setLightboxZoom(100));
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });

  /* ========================================================================
     8. Instant Search Modal (Ctrl + K)
     ======================================================================== */
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchTriggers = document.querySelectorAll('[data-open-search]');
  const searchCloseBtn = document.getElementById('searchClose');

  // Build search index from live articles
  const searchIndex = [];
  articles.forEach((art) => {
    const topicTitle = art.querySelector('h1')?.textContent.trim() || art.id;
    const nodes = art.querySelectorAll('h1, h2, h3, p, li, tr, pre');
    nodes.forEach((el) => {
      if (el.closest('.topic-toc') || el.closest('.topic-footer-nav')) return;
      const rawText =
        el.tagName === 'TR'
          ? Array.from(el.querySelectorAll('th, td'))
              .map((cell) => cell.textContent.replace(/\s+/g, ' ').trim())
              .filter(Boolean)
              .join(' · ')
          : el.textContent;
      const text = rawText.replace(/\s+/g, ' ').trim();
      if (text.length < 4) return;
      searchIndex.push({
        topicId: art.id,
        topicTitle,
        text,
        norm: normalizeText(text),
        el
      });
    });
  });

  let selectedResultIdx = -1;
  let currentMatches = [];

  const openSearch = () => {
    if (!searchModal) return;
    searchModal.classList.add('open');
    document.body.classList.add('no-scroll');
    setTimeout(() => {
      searchInput?.focus();
      searchInput?.select();
    }, 40);
  };

  const closeSearch = () => {
    searchModal?.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  const jumpToSearchResult = (match) => {
    closeSearch();
    if (!match?.el) return;
    match.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    match.el.classList.remove('search-jump-highlight');
    void match.el.offsetWidth; // restart animation
    match.el.classList.add('search-jump-highlight');
  };

  const renderSearchResults = (query) => {
    if (!searchResults) return;
    const q = normalizeText(query.trim());
    selectedResultIdx = -1;

    if (!q) {
      currentMatches = [];
      searchResults.innerHTML =
        '<div class="search-empty">Escribe una palabra clave (ej. <strong>CAPEX</strong>, <strong>AURI</strong>, <strong>Security Group</strong>, <strong>EFS</strong>, <strong>IAM</strong> o <strong>CloudTrail</strong>).</div>';
      return;
    }

    const terms = q.split(/\s+/).filter(Boolean);
    currentMatches = searchIndex
      .filter((item) => terms.every((t) => item.norm.includes(t)))
      .slice(0, 20);

    if (!currentMatches.length) {
      searchResults.innerHTML =
        '<div class="search-empty">No se encontraron coincidencias para esa búsqueda.</div>';
      return;
    }

    searchResults.innerHTML = '';
    currentMatches.forEach((match, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-result-item';
      const snippet =
        match.text.length > 155 ? `${match.text.slice(0, 155)}…` : match.text;

      // Safe highlight without raw HTML injection
      const safeSnippet = snippet
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const regex = new RegExp(
        `(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'ig'
      );
      const highlighted = safeSnippet.replace(regex, '<mark>$1</mark>');

      btn.innerHTML = `<div class="search-result-topic">${match.topicTitle}</div><div class="search-result-snippet">${highlighted}</div>`;
      btn.addEventListener('click', () => jumpToSearchResult(match));
      btn.addEventListener('mouseenter', () => {
        selectedResultIdx = idx;
        updateSelectedResult();
      });
      searchResults.appendChild(btn);
    });
  };

  const updateSelectedResult = () => {
    const items = searchResults?.querySelectorAll('.search-result-item') || [];
    items.forEach((el, i) => el.classList.toggle('selected', i === selectedResultIdx));
    if (items[selectedResultIdx]) {
      items[selectedResultIdx].scrollIntoView({ block: 'nearest' });
    }
  };

  searchTriggers.forEach((btn) => btn.addEventListener('click', openSearch));
  searchCloseBtn?.addEventListener('click', closeSearch);
  searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  searchInput?.addEventListener('input', (e) => renderSearchResults(e.target.value));
  searchInput?.addEventListener('keydown', (e) => {
    if (!currentMatches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedResultIdx = (selectedResultIdx + 1) % currentMatches.length;
      updateSelectedResult();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedResultIdx =
        (selectedResultIdx - 1 + currentMatches.length) % currentMatches.length;
      updateSelectedResult();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = currentMatches[selectedResultIdx >= 0 ? selectedResultIdx : 0];
      jumpToSearchResult(target);
    }
  });

  renderSearchResults('');

  /* ========================================================================
     9. Study Mode: Flashcards (33 tarjetas con flip 3D y progreso)
     ======================================================================== */
  const flashcardsModal = document.getElementById('flashcardsModal');
  const flashcardsTriggers = document.querySelectorAll('[data-open-flashcards]');
  const flashcardsClose = document.getElementById('flashcardsClose');
  const fcTopicFilter = document.getElementById('fcTopicFilter');
  const fcOnlyPending = document.getElementById('fcOnlyPending');
  const fcShuffleBtn = document.getElementById('fcShuffleBtn');
  const fcCardInner = document.getElementById('fcCardInner');
  const fcCounter = document.getElementById('fcCounter');
  const fcKnownStats = document.getElementById('fcKnownStats');
  const fcFrontTag = document.getElementById('fcFrontTag');
  const fcBackTag = document.getElementById('fcBackTag');
  const fcQuestion = document.getElementById('fcQuestion');
  const fcAnswer = document.getElementById('fcAnswer');
  const fcPrevBtn = document.getElementById('fcPrevBtn');
  const fcNextBtn = document.getElementById('fcNextBtn');
  const fcFlipBtn = document.getElementById('fcFlipBtn');
  const fcKnownBtn = document.getElementById('fcKnownBtn');

  let deck = [...FLASHCARDS];
  let cardIdx = 0;

  const rebuildDeck = (shouldShuffle = false) => {
    const topic = fcTopicFilter?.value || 'all';
    const onlyPending = Boolean(fcOnlyPending?.checked);

    deck = FLASHCARDS.filter((card) => {
      if (topic !== 'all' && card.topicId !== topic) return false;
      if (onlyPending && knownCards.has(card.id)) return false;
      return true;
    });

    if (shouldShuffle) {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }

    cardIdx = 0;
    renderFlashcard();
  };

  const renderFlashcard = (preserveFlip = false) => {
    if (!preserveFlip) fcCardInner?.classList.remove('flipped');
    if (fcKnownStats) {
      fcKnownStats.textContent = `Dominadas: ${knownCards.size} / ${FLASHCARDS.length}`;
    }
    if (heroCardsStat) {
      heroCardsStat.textContent = `${knownCards.size}/${FLASHCARDS.length}`;
    }

    if (!deck.length) {
      if (fcCounter) fcCounter.textContent = '0 / 0';
      if (fcFrontTag) fcFrontTag.textContent = '¡Excelente!';
      if (fcBackTag) fcBackTag.textContent = '¡Excelente!';
      if (fcQuestion) {
        fcQuestion.textContent = 'Ya dominaste todas las tarjetas de este filtro.';
      }
      if (fcAnswer) {
        fcAnswer.textContent = 'Desactiva "Solo pendientes" o elige otro tema para seguir practicando.';
      }
      if (fcKnownBtn) fcKnownBtn.classList.remove('active');
      return;
    }

    const card = deck[cardIdx];
    const isKnown = knownCards.has(card.id);
    if (fcCounter) fcCounter.textContent = `Tarjeta ${cardIdx + 1} de ${deck.length}`;
    if (fcFrontTag) fcFrontTag.textContent = `Pregunta · ${card.topicLabel}`;
    if (fcBackTag) fcBackTag.textContent = `Respuesta · ${card.topicLabel}`;
    if (fcQuestion) fcQuestion.textContent = card.q;
    if (fcAnswer) fcAnswer.textContent = card.a;
    if (fcKnownBtn) {
      fcKnownBtn.classList.toggle('active', isKnown);
      fcKnownBtn.textContent = isKnown ? '✓ Dominada' : '○ Marcar dominada';
    }
  };

  const openFlashcards = () => {
    if (!flashcardsModal) return;
    rebuildDeck(false);
    flashcardsModal.classList.add('open');
    document.body.classList.add('no-scroll');
  };

  const closeFlashcards = () => {
    flashcardsModal?.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  flashcardsTriggers.forEach((btn) => btn.addEventListener('click', openFlashcards));
  flashcardsClose?.addEventListener('click', closeFlashcards);
  flashcardsModal?.addEventListener('click', (e) => {
    if (e.target === flashcardsModal) closeFlashcards();
  });

  fcTopicFilter?.addEventListener('change', () => rebuildDeck(false));
  fcOnlyPending?.addEventListener('change', () => rebuildDeck(false));
  fcShuffleBtn?.addEventListener('click', () => rebuildDeck(true));

  const flipCard = () => fcCardInner?.classList.toggle('flipped');
  fcCardInner?.addEventListener('click', flipCard);
  fcFlipBtn?.addEventListener('click', flipCard);

  fcPrevBtn?.addEventListener('click', () => {
    if (!deck.length) return;
    cardIdx = (cardIdx - 1 + deck.length) % deck.length;
    renderFlashcard();
  });

  fcNextBtn?.addEventListener('click', () => {
    if (!deck.length) return;
    cardIdx = (cardIdx + 1) % deck.length;
    renderFlashcard();
  });

  fcKnownBtn?.addEventListener('click', () => {
    if (!deck.length) return;
    const card = deck[cardIdx];
    if (knownCards.has(card.id)) {
      knownCards.delete(card.id);
    } else {
      knownCards.add(card.id);
    }
    storage.set(STORAGE_KEYS.knownCards, Array.from(knownCards));
    renderFlashcard(true);
  });

  /* ========================================================================
     10. Global Keyboard Shortcuts
     ======================================================================== */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchModal?.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (lightboxModal?.classList.contains('open')) closeLightbox();
      else if (searchModal?.classList.contains('open')) closeSearch();
      else if (flashcardsModal?.classList.contains('open')) closeFlashcards();
      else if (sidebar?.classList.contains('open')) setDrawer(false);
      return;
    }

    if (flashcardsModal?.classList.contains('open')) {
      if (e.key === ' ' && document.activeElement?.tagName !== 'SELECT' && document.activeElement?.tagName !== 'BUTTON') {
        e.preventDefault();
        flipCard();
      } else if (e.key === 'ArrowRight') {
        fcNextBtn?.click();
      } else if (e.key === 'ArrowLeft') {
        fcPrevBtn?.click();
      }
    }
  });
})();
