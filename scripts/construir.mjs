#!/usr/bin/env node
/**
 * Script de construcción y sincronización para Apuntes Grid & Cloud.
 *
 * Uso:
 *   node scripts/construir.mjs
 *
 * Qué hace:
 *   1. Lee automáticamente todos los archivos NN-*.md en orden (01, 02, ..., 12, ...).
 *   2. Regenera index.html preservando el diseño interactivo completo
 *      (assets/styles.css + assets/app.js: modo oscuro, búsqueda Ctrl+K,
 *      progreso de estudio, filtros por categoría, flashcards y visor SVG).
 *   3. Sincroniza ../cloud-u1-ps-ae/documentacion.md combinando 06-terraform.md
 *      y 12-talleres-terraform.md (si el repositorio vecino existe).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const TERRAFORM_REPO = path.resolve(ROOT, "..", "cloud-u1-ps-ae");
const WEB_URL = "https://apuntes-grid-cloud.vercel.app/";

// Metadatos de navegación, categorías y fechas por tema (para nuevos temas usa valores por defecto)
const TOPIC_META = {
  "01-fundamentos": {
    cats: "clase aws",
    date: "15/10/2026 · AWS Mód. 1 y 3",
    navTitle: "Fundamentos de computación en la nube",
    fcLabel: "01. Fundamentos Cloud",
  },
  "02-ec2": {
    cats: "clase aws",
    date: "15/10/2026 · AWS Mód. 2",
    navTitle: "Servicios de AWS y Amazon EC2",
    fcLabel: "02. Servicios AWS y EC2",
  },
  "03-redes-seguridad": {
    cats: "clase aws",
    date: "20/10/2026 · AWS Mód. 4 · Act. 26/11",
    navTitle: "Redes y seguridad: VPC y Security Groups",
    fcLabel: "03. Redes y Seguridad",
  },
  "04-user-data": {
    cats: "clase practica",
    date: "22/10/2026",
    navTitle: "Automatización inicial con User Data",
    fcLabel: "04. User Data",
  },
  "05-herramientas-aws": {
    cats: "clase aws",
    date: "27/10/2026 · AWS Mód. 1 y 4",
    navTitle: "Consola, AWS CLI y SDK",
    fcLabel: "05. Consola, CLI y SDK",
  },
  "06-terraform": {
    cats: "clase",
    date: "05/11/2026 · Act. 26/11",
    navTitle: "Infraestructura como código con Terraform",
    fcLabel: "06. Terraform",
  },
  "07-almacenamiento": {
    cats: "clase aws",
    date: "10/11/2026 · AWS Mód. 2 y 4",
    navTitle: "Almacenamiento: EBS, EFS y NFS",
    fcLabel: "07. Almacenamiento",
  },
  "08-practica-ebs": {
    cats: "practica",
    date: "10/11/2026",
    navTitle: "Práctica: conexión SSH y montaje de EBS",
    fcLabel: "08. Práctica EBS",
  },
  "09-taller-ebs-efs": {
    cats: "practica",
    date: "12/11/2026 · Act. 17/11",
    navTitle: "Taller de almacenamiento EBS y EFS",
    fcLabel: "09. Taller EBS y EFS",
  },
  "10-economia-facturacion": {
    cats: "aws",
    date: "21/11/2026 · AWS Mód. 2",
    navTitle: "Economía, Facturación y Soporte (AWS)",
    fcLabel: "10. Economía y Facturación",
  },
  "11-seguridad-iam": {
    cats: "aws",
    date: "21/11/2026 · AWS Mód. 2 y 4",
    navTitle: "Seguridad, IAM y Gobernanza (AWS)",
    fcLabel: "11. Seguridad, IAM y Gobernanza",
  },
  "12-talleres-terraform": {
    cats: "practica",
    date: "26/11/2026 · Talleres 8 y 12",
    navTitle: "Talleres prácticos de Terraform (EC2 y EFS)",
    fcLabel: "12. Talleres Terraform",
  },
};

// ---------- Diagramas SVG 100% offline (integrados con .diagram-box y Lightbox) ----------

const SVG_DIAGRAMS = {
  "iam-flujo": `<div class="diagram-box">
<svg viewBox="0 0 880 430" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de flujo jerárquico de componentes AWS IAM">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#087795"/>
    </marker>
  </defs>
  <rect x="270" y="15" width="340" height="72" rx="10" fill="#124d64" stroke="#087795" stroke-width="2"/>
  <text x="440" y="43" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="16" font-weight="bold">1. Política de IAM (Documento JSON)</text>
  <text x="440" y="66" text-anchor="middle" fill="#d8e9f0" font-family="system-ui,sans-serif" font-size="13">Define permisos: Allow / Deny sobre acciones y recursos</text>

  <path d="M 350 87 L 220 148" stroke="#087795" stroke-width="2.5" fill="none" marker-end="url(#arrow)"/>
  <text x="245" y="115" text-anchor="middle" fill="#124d64" font-family="system-ui,sans-serif" font-size="12" font-weight="bold">Se adjunta a</text>

  <path d="M 530 87 L 660 148" stroke="#087795" stroke-width="2.5" fill="none" marker-end="url(#arrow)"/>
  <text x="635" y="115" text-anchor="middle" fill="#124d64" font-family="system-ui,sans-serif" font-size="12" font-weight="bold">Se adjunta a</text>

  <rect x="40" y="152" width="360" height="70" rx="10" fill="#eef5f8" stroke="#087795" stroke-width="2"/>
  <text x="220" y="180" text-anchor="middle" fill="#124d64" font-family="system-ui,sans-serif" font-size="15" font-weight="bold">2A. Grupo de IAM (ej. Desarrolladores)</text>
  <text x="220" y="202" text-anchor="middle" fill="#203044" font-family="system-ui,sans-serif" font-size="13">Agrupa usuarios con los mismos permisos</text>

  <rect x="40" y="262" width="360" height="65" rx="10" fill="#ffffff" stroke="#124d64" stroke-width="2"/>
  <text x="220" y="290" text-anchor="middle" fill="#124d64" font-family="system-ui,sans-serif" font-size="15" font-weight="bold">3A. Usuario de IAM (Persona, ej. Ariel)</text>
  <text x="220" y="311" text-anchor="middle" fill="#203044" font-family="system-ui,sans-serif" font-size="13">Pertenece al grupo y hereda sus políticas</text>

  <path d="M 220 262 L 220 226" stroke="#087795" stroke-width="2.2" fill="none" marker-end="url(#arrow)"/>
  <text x="268" y="248" text-anchor="middle" fill="#124d64" font-family="system-ui,sans-serif" font-size="12">Pertenece a</text>

  <rect x="480" y="152" width="360" height="70" rx="10" fill="#eef5f8" stroke="#087795" stroke-width="2"/>
  <text x="660" y="180" text-anchor="middle" fill="#124d64" font-family="system-ui,sans-serif" font-size="15" font-weight="bold">2B. Rol de IAM (Credenciales temporales)</text>
  <text x="660" y="202" text-anchor="middle" fill="#203044" font-family="system-ui,sans-serif" font-size="13">Sin dueño fijo; se asume cuando se necesita</text>

  <rect x="480" y="262" width="360" height="65" rx="10" fill="#ffffff" stroke="#124d64" stroke-width="2"/>
  <text x="660" y="290" text-anchor="middle" fill="#124d64" font-family="system-ui,sans-serif" font-size="15" font-weight="bold">3B. Servicio AWS / App (ej. Instancia EC2)</text>
  <text x="660" y="311" text-anchor="middle" fill="#203044" font-family="system-ui,sans-serif" font-size="13">Asume el Rol para operar sin guardar claves fijas</text>

  <path d="M 660 262 L 660 226" stroke="#087795" stroke-width="2.2" fill="none" marker-end="url(#arrow)"/>
  <text x="705" y="248" text-anchor="middle" fill="#124d64" font-family="system-ui,sans-serif" font-size="12">Asume el rol</text>

  <rect x="220" y="355" width="440" height="62" rx="10" fill="#142a39" stroke="#087795" stroke-width="2"/>
  <text x="440" y="382" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="15" font-weight="bold">4. Recurso Protegido en AWS (ej. Bucket Amazon S3 / RDS)</text>
  <text x="440" y="403" text-anchor="middle" fill="#d8e9f0" font-family="system-ui,sans-serif" font-size="13">Recibe las peticiones autorizadas del Usuario o del Rol</text>

  <path d="M 220 327 L 340 355" stroke="#087795" stroke-width="2.2" fill="none" marker-end="url(#arrow)"/>
  <path d="M 660 327 L 540 355" stroke="#087795" stroke-width="2.2" fill="none" marker-end="url(#arrow)"/>
</svg>
</div>`,

  "flujo-terraform": `<div class="diagram-box">
<svg viewBox="0 0 880 205" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Flujo interno de Terraform: archivos .tf, Provider AWS, API y terraform.tfstate">
  <defs>
    <marker id="arr-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 1 L10 5 L0 9 z" fill="#087795"/>
    </marker>
  </defs>
  <rect x="12" y="24" width="175" height="68" rx="10" fill="#eef5f8" stroke="#124d64" stroke-width="1.8"/>
  <text x="99" y="53" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#122b3a">Archivos .tf</text>
  <text x="99" y="73" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#465b6e">Código deseado (HCL)</text>

  <line x1="187" y1="58" x2="233" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-t)"/>

  <rect x="238" y="24" width="165" height="68" rx="10" fill="#122b3a" stroke="#122b3a" stroke-width="1.8"/>
  <text x="320" y="53" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#ffffff">Terraform CLI</text>
  <text x="320" y="73" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#cfe4ee">Planifica y aplica</text>

  <line x1="403" y1="58" x2="449" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-t)"/>

  <rect x="454" y="24" width="175" height="68" rx="10" fill="#eef5f8" stroke="#124d64" stroke-width="1.8"/>
  <text x="541" y="53" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#122b3a">Provider AWS</text>
  <text x="541" y="73" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#465b6e">Plugin en .terraform/</text>

  <line x1="629" y1="58" x2="675" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-t)"/>

  <rect x="680" y="24" width="188" height="68" rx="10" fill="#e6f4ea" stroke="#1e6b43" stroke-width="1.8"/>
  <text x="774" y="53" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#124229">API de AWS</text>
  <text x="774" y="73" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#2c5e43">EC2, SG y recursos reales</text>

  <line x1="320" y1="97" x2="320" y2="128" stroke="#087795" stroke-width="2" marker-start="url(#arr-t)" marker-end="url(#arr-t)"/>

  <rect x="195" y="133" width="250" height="58" rx="10" fill="#fff7e6" stroke="#b36b00" stroke-width="1.8"/>
  <text x="320" y="158" text-anchor="middle" font-family="Consolas,monospace" font-size="13.5" font-weight="700" fill="#6e4100">terraform.tfstate</text>
  <text x="320" y="177" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#7c5218">Estado actual (IDs, IPs, mapeo real)</text>
</svg>
</div>`,

  "ciclo-comandos": `<div class="diagram-box">
<svg viewBox="0 0 920 120" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ciclo de vida de comandos de Terraform en terminal">
  <defs>
    <marker id="arr-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 1 L10 5 L0 9 z" fill="#087795"/>
    </marker>
  </defs>
  <g font-family="system-ui,sans-serif" text-anchor="middle">
    <rect x="8" y="24" width="114" height="68" rx="9" fill="#eef5f8" stroke="#124d64" stroke-width="1.6"/>
    <text x="65" y="51" font-size="11.5" font-weight="700" fill="#087795">PASO 0</text>
    <text x="65" y="72" font-family="Consolas,monospace" font-size="12" font-weight="700" fill="#122b3a">aws configure</text>

    <line x1="122" y1="58" x2="136" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-c)"/>

    <rect x="140" y="24" width="112" height="68" rx="9" fill="#eef5f8" stroke="#124d64" stroke-width="1.6"/>
    <text x="196" y="51" font-size="11.5" font-weight="700" fill="#087795">PASO 1</text>
    <text x="196" y="72" font-family="Consolas,monospace" font-size="12" font-weight="700" fill="#122b3a">init</text>

    <line x1="252" y1="58" x2="266" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-c)"/>

    <rect x="270" y="24" width="124" height="68" rx="9" fill="#eef5f8" stroke="#124d64" stroke-width="1.6"/>
    <text x="332" y="51" font-size="11.5" font-weight="700" fill="#087795">PASO 2</text>
    <text x="332" y="72" font-family="Consolas,monospace" font-size="11.5" font-weight="700" fill="#122b3a">fmt / validate</text>

    <line x1="394" y1="58" x2="408" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-c)"/>

    <rect x="412" y="24" width="112" height="68" rx="9" fill="#eef5f8" stroke="#124d64" stroke-width="1.6"/>
    <text x="468" y="51" font-size="11.5" font-weight="700" fill="#087795">PASO 3</text>
    <text x="468" y="72" font-family="Consolas,monospace" font-size="12" font-weight="700" fill="#122b3a">plan</text>

    <line x1="524" y1="58" x2="538" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-c)"/>

    <rect x="542" y="24" width="112" height="68" rx="9" fill="#122b3a" stroke="#122b3a" stroke-width="1.6"/>
    <text x="598" y="51" font-size="11.5" font-weight="700" fill="#7fd1e6">PASO 4</text>
    <text x="598" y="72" font-family="Consolas,monospace" font-size="12" font-weight="700" fill="#ffffff">apply</text>

    <line x1="654" y1="58" x2="668" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-c)"/>

    <rect x="672" y="24" width="118" height="68" rx="9" fill="#eef5f8" stroke="#124d64" stroke-width="1.6"/>
    <text x="731" y="51" font-size="11.5" font-weight="700" fill="#087795">PASO 5</text>
    <text x="731" y="72" font-family="Consolas,monospace" font-size="11.5" font-weight="700" fill="#122b3a">output / show</text>

    <line x1="790" y1="58" x2="804" y2="58" stroke="#087795" stroke-width="2" marker-end="url(#arr-c)"/>

    <rect x="808" y="24" width="104" height="68" rx="9" fill="#fdecec" stroke="#b42318" stroke-width="1.6"/>
    <text x="860" y="51" font-size="11.5" font-weight="700" fill="#b42318">PASO 6</text>
    <text x="860" y="72" font-family="Consolas,monospace" font-size="12" font-weight="700" fill="#7a150f">destroy</text>
  </g>
</svg>
</div>`,

  "arq-taller8": `<div class="diagram-box">
<svg viewBox="0 0 880 190" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arquitectura del Taller 8 (taller8-ae2)">
  <defs>
    <marker id="arr-8" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 1 L10 5 L0 9 z" fill="#087795"/>
    </marker>
    <marker id="arr-8w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 1 L10 5 L0 9 z" fill="#b36b00"/>
    </marker>
  </defs>
  <rect x="16" y="42" width="160" height="74" rx="10" fill="#f2f5f9" stroke="#607182" stroke-width="1.8"/>
  <text x="96" y="73" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#203044">Internet</text>
  <text x="96" y="94" text-anchor="middle" font-family="Consolas,monospace" font-size="12" fill="#607182">0.0.0.0/0</text>

  <line x1="176" y1="64" x2="342" y2="64" stroke="#087795" stroke-width="2" marker-end="url(#arr-8)"/>
  <text x="259" y="54" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.5" font-weight="600" fill="#087795">Entrada: TCP 22 (SSH) y 80 (HTTP)</text>

  <rect x="348" y="34" width="224" height="90" rx="10" fill="#eef5f8" stroke="#124d64" stroke-width="1.8"/>
  <text x="460" y="61" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#124d64">Security Group (mi-sg)</text>
  <text x="460" y="81" text-anchor="middle" font-family="Consolas,monospace" font-size="11.5" fill="#203044">mi-security-group-terraform</text>
  <text x="460" y="102" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.5" fill="#465b6e">Reglas inline (ingress / egress)</text>

  <line x1="572" y1="79" x2="626" y2="79" stroke="#087795" stroke-width="2" marker-end="url(#arr-8)"/>

  <rect x="632" y="34" width="232" height="90" rx="10" fill="#122b3a" stroke="#122b3a" stroke-width="1.8"/>
  <text x="748" y="62" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13.5" font-weight="700" fill="#ffffff">EC2: MiInstanciaTerraForm2</text>
  <text x="748" y="83" text-anchor="middle" font-family="Consolas,monospace" font-size="12" fill="#8fd6ea">t2.micro · us-east-1</text>
  <text x="748" y="103" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.5" fill="#cfe4ee">1 instancia (mi_instancia)</text>

  <path d="M 748 124 L 748 164 L 96 164 L 96 122" fill="none" stroke="#b36b00" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#arr-8w)"/>
  <text x="422" y="156" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.5" font-weight="600" fill="#8f5400">Salida (egress): solo TCP 80 (HTTP) hacia 0.0.0.0/0</text>
</svg>
</div>`,

  "arq-taller12": `<div class="diagram-box">
<svg viewBox="0 0 920 270" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arquitectura del Taller 12 (taller12-efs-ae): 2 EC2 y Security Groups para EFS">
  <defs>
    <marker id="arr-12" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 1 L10 5 L0 9 z" fill="#087795"/>
    </marker>
    <marker id="arr-12g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 1 L10 5 L0 9 z" fill="#1e6b43"/>
    </marker>
  </defs>

  <rect x="12" y="68" width="132" height="72" rx="10" fill="#f2f5f9" stroke="#607182" stroke-width="1.8"/>
  <text x="78" y="99" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#203044">Internet</text>
  <text x="78" y="119" text-anchor="middle" font-family="Consolas,monospace" font-size="12" fill="#607182">0.0.0.0/0</text>

  <line x1="144" y1="94" x2="246" y2="94" stroke="#087795" stroke-width="2" marker-end="url(#arr-12)"/>
  <text x="195" y="84" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.5" font-weight="600" fill="#087795">SSH · TCP 22</text>

  <rect x="252" y="18" width="248" height="176" rx="12" fill="#eef5f8" stroke="#124d64" stroke-width="2"/>
  <text x="376" y="42" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#124d64">SG Instancias (mi-sg-efs-instancias-14)</text>

  <rect x="274" y="56" width="204" height="54" rx="8" fill="#122b3a"/>
  <text x="376" y="79" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#ffffff">Mi instancia EFS - 1</text>
  <text x="376" y="97" text-anchor="middle" font-family="Consolas,monospace" font-size="11" fill="#8fd6ea">count.index = 0 · t2.micro</text>

  <rect x="274" y="122" width="204" height="54" rx="8" fill="#122b3a"/>
  <text x="376" y="145" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#ffffff">Mi instancia EFS - 2</text>
  <text x="376" y="163" text-anchor="middle" font-family="Consolas,monospace" font-size="11" fill="#8fd6ea">count.index = 1 · t2.micro</text>

  <line x1="500" y1="106" x2="646" y2="106" stroke="#1e6b43" stroke-width="2.2" marker-end="url(#arr-12g)"/>
  <text x="573" y="92" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.5" font-weight="700" fill="#1e6b43">NFS · TCP 2049</text>
  <text x="573" y="124" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10.8" fill="#2c5e43">referenced_security_group_id</text>

  <rect x="652" y="34" width="256" height="144" rx="12" fill="#e6f4ea" stroke="#1e6b43" stroke-width="2"/>
  <text x="780" y="60" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#124229">SG EFS (mi-sg-efs-14)</text>
  <text x="780" y="79" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.2" fill="#2c5e43">Entrada 2049 solo desde SG Instancias</text>
  <rect x="676" y="95" width="208" height="64" rx="8" fill="#ffffff" stroke="#1e6b43" stroke-width="1.5" stroke-dasharray="5,3"/>
  <text x="780" y="122" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13.5" font-weight="700" fill="#124229">Amazon EFS</text>
  <text x="780" y="142" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.2" fill="#465b6e">(Destino previsto / Mount Targets)</text>

  <path d="M 376 194 L 376 242 L 78 242 L 78 146" fill="none" stroke="#087795" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#arr-12)"/>
  <text x="228" y="232" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.5" font-weight="600" fill="#087795">Salida a Internet: Todo tráfico (ip_protocol = "-1") hacia 0.0.0.0/0</text>
</svg>
</div>`,

  "dependencia-ciclica": `<div class="diagram-box">
<svg viewBox="0 0 920 250" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dependencia cíclica en Terraform con reglas inline versus solución con reglas desacopladas">
  <defs>
    <marker id="arr-err" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 1 L10 5 L0 9 z" fill="#b42318"/>
    </marker>
    <marker id="arr-ok" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 1 L10 5 L0 9 z" fill="#1e6b43"/>
    </marker>
  </defs>

  <!-- Panel izquierdo: Error: Cycle -->
  <rect x="10" y="12" width="420" height="226" rx="12" fill="#fff5f5" stroke="#d92d20" stroke-width="1.8"/>
  <text x="220" y="38" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13.5" font-weight="700" fill="#b42318">✕ Error: Cycle (con reglas inline)</text>

  <rect x="30" y="76" width="160" height="84" rx="10" fill="#ffffff" stroke="#b42318" stroke-width="1.8"/>
  <text x="110" y="106" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#7a150f">SG Instancias</text>
  <text x="110" y="126" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#6e302c">egress inline pide</text>
  <text x="110" y="143" text-anchor="middle" font-family="Consolas,monospace" font-size="11" fill="#b42318">SG_EFS.id</text>

  <rect x="250" y="76" width="160" height="84" rx="10" fill="#ffffff" stroke="#b42318" stroke-width="1.8"/>
  <text x="330" y="106" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#7a150f">SG EFS</text>
  <text x="330" y="126" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#6e302c">ingress inline pide</text>
  <text x="330" y="143" text-anchor="middle" font-family="Consolas,monospace" font-size="11" fill="#b42318">SG_EC2.id</text>

  <path d="M 190 98 L 246 98" stroke="#b42318" stroke-width="2" marker-end="url(#arr-err)"/>
  <path d="M 250 138 L 194 138" stroke="#b42318" stroke-width="2" marker-end="url(#arr-err)"/>

  <text x="220" y="194" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11.5" font-weight="600" fill="#7a150f">Bucle cerrado: ninguno puede crearse primero</text>
  <text x="220" y="214" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#6e302c">Terraform aborta al construir el grafo (DAG)</text>

  <!-- Panel derecho: Solución desacoplada -->
  <rect x="450" y="12" width="460" height="226" rx="12" fill="#f2fbf5" stroke="#1e6b43" stroke-width="1.8"/>
  <text x="680" y="38" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13.5" font-weight="700" fill="#124229">✓ Solución Taller 12 (reglas separadas)</text>

  <rect x="476" y="56" width="182" height="58" rx="9" fill="#eef5f8" stroke="#124d64" stroke-width="1.8"/>
  <text x="567" y="81" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12.5" font-weight="700" fill="#122b3a">1. SG Instancias (vacío)</text>
  <text x="567" y="99" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#465b6e">Se crea sin depender de EFS</text>

  <rect x="702" y="56" width="182" height="58" rx="9" fill="#e6f4ea" stroke="#1e6b43" stroke-width="1.8"/>
  <text x="793" y="81" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12.5" font-weight="700" fill="#124229">1. SG EFS (vacío)</text>
  <text x="793" y="99" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#2c5e43">Se crea sin depender de EC2</text>

  <path d="M 567 114 L 567 148" stroke="#1e6b43" stroke-width="2" marker-end="url(#arr-ok)"/>
  <path d="M 793 114 L 793 148" stroke="#1e6b43" stroke-width="2" marker-end="url(#arr-ok)"/>
  <path d="M 750 114 L 615 148" stroke="#1e6b43" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arr-ok)"/>
  <path d="M 610 114 L 745 148" stroke="#1e6b43" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arr-ok)"/>

  <rect x="476" y="152" width="182" height="64" rx="9" fill="#ffffff" stroke="#1e6b43" stroke-width="1.8"/>
  <text x="567" y="177" text-anchor="middle" font-family="Consolas,monospace" font-size="11.5" font-weight="700" fill="#124229">egress_rule: salida_efs</text>
  <text x="567" y="197" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#2c5e43">2. Conecta SG EC2 → SG EFS</text>

  <rect x="702" y="152" width="182" height="64" rx="9" fill="#ffffff" stroke="#1e6b43" stroke-width="1.8"/>
  <text x="793" y="177" text-anchor="middle" font-family="Consolas,monospace" font-size="11.5" font-weight="700" fill="#124229">ingress_rule: entrada_efs</text>
  <text x="793" y="197" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#2c5e43">2. Acepta SG EC2 en SG EFS</text>
</svg>
</div>`,
};

// ---------- Utilidades HTML y Markdown ----------

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text) {
  const codeTokens = [];
  let work = text.replace(/`([^`]+)`/g, (_, code) => {
    const idx = codeTokens.length;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000CODE${idx}\u0000`;
  });

  const brTokens = [];
  work = work.replace(/<br\s*\/?>/gi, () => {
    const idx = brTokens.length;
    brTokens.push("<br>");
    return `\u0000BR${idx}\u0000`;
  });

  work = escapeHtml(work);

  work = work.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `<img loading="lazy" src="${src.trim()}" alt="${alt}">`;
  });

  work = work.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, rawHref) => {
    let href = rawHref.trim();
    if (href === "LEEME.md") return `<a href="#inicio">${label}</a>`;
    const localMd = href.match(/^(\d{2}-[^#]+)\.md(?:#.*)?$/);
    if (localMd) return `<a href="#${localMd[1]}">${label}</a>`;
    if (/^https?:\/\//i.test(href)) {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
    return `<a href="${href}">${label}</a>`;
  });

  work = work.replace(/\*\*((?:(?!\*\*).)+)\*\*/g, "<strong>$1</strong>");
  work = work.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  work = work.replace(/\u0000BR(\d+)\u0000/g, (_, idx) => brTokens[Number(idx)]);
  work = work.replace(/\u0000CODE(\d+)\u0000/g, (_, idx) => codeTokens[Number(idx)]);

  return work;
}

function getIndent(line) {
  let count = 0;
  for (const ch of line) {
    if (ch === " ") count += 1;
    else if (ch === "\t") count += 2;
    else break;
  }
  return count;
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line) {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map((cell) => cell.trim());
}

function renderMermaidOrCode(lang, codeLines) {
  const code = codeLines.join("\n");
  if (lang === "mermaid") {
    const match = code.match(/%%\s*diagram:([a-z0-9_-]+)/i);
    if (match && SVG_DIAGRAMS[match[1]]) {
      return SVG_DIAGRAMS[match[1]];
    }
    // Detectar diagrama IAM del tema 11 automáticamente
    if (code.includes("Política de IAM") && code.includes("Grupo de IAM")) {
      return SVG_DIAGRAMS["iam-flujo"];
    }
  }
  const cls = lang ? ` class="language-${escapeHtml(lang)}"` : "";
  return `<pre><code${cls}>${escapeHtml(code)}\n</code></pre>`;
}

function parseBlocks(lines) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Omitir enlace redundante "[Volver al índice](LEEME.md)" porque el layout ya tiene barra lateral y botón flotante
    if (/^\s*\[Volver al índice\]\(LEEME\.md\)\s*$/.test(line)) {
      i += 1;
      continue;
    }

    // Bloque de código cercado ```
    const fenceMatch = line.match(/^\s*```([a-zA-Z0-9_-]*)\s*$/);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const baseIndent = getIndent(line);
      const codeLines = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        const raw = lines[i];
        codeLines.push(raw.startsWith(" ".repeat(baseIndent)) ? raw.slice(baseIndent) : raw);
        i += 1;
      }
      if (i < lines.length) i += 1;
      out.push(renderMermaidOrCode(lang, codeLines));
      continue;
    }

    // Encabezados
    const headMatch = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (headMatch) {
      const level = headMatch[1].length;
      out.push(`<h${level}>${renderInline(headMatch[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    // Separador horizontal
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      out.push("<hr>");
      i += 1;
      continue;
    }

    // Cita >
    if (/^\s*>\s?/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote>\n${parseBlocks(quoteLines)}\n</blockquote>`);
      continue;
    }

    // Tabla GFM
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headers = splitTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      const thead = headers.map((h) => `<th>${renderInline(h)}</th>`).join("");
      const tbody = rows
        .map(
          (r) =>
            `<tr>${headers
              .map((_, idx) => `<td>${renderInline(r[idx] || "")}</td>`)
              .join("")}</tr>`
        )
        .join("\n");
      out.push(`<table>\n<thead><tr>${thead}</tr></thead>\n<tbody>\n${tbody}\n</tbody>\n</table>`);
      continue;
    }

    // Listas (ordenadas y no ordenadas, con anidamiento)
    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const baseIndent = getIndent(line);
      const isOrdered = /^\d+\.$/.test(listMatch[2]);
      const startNum = isOrdered ? parseInt(listMatch[2], 10) : 1;
      const items = [];

      while (i < lines.length) {
        const cur = lines[i];
        const curMatch = cur.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (!curMatch) break;
        const curIndent = getIndent(cur);
        const curOrdered = /^\d+\.$/.test(curMatch[2]);
        if (curIndent !== baseIndent || curOrdered !== isOrdered) break;

        const itemLines = [curMatch[3]];
        i += 1;

        while (i < lines.length) {
          const next = lines[i];
          if (!next.trim()) {
            let look = i + 1;
            while (look < lines.length && !lines[look].trim()) look += 1;
            if (look < lines.length && getIndent(lines[look]) > baseIndent) {
              itemLines.push("");
              i += 1;
              continue;
            }
            if (look < lines.length) {
              const nextItem = lines[look].match(/^(\s*)([-*]|\d+\.)\s+/);
              if (
                nextItem &&
                getIndent(lines[look]) === baseIndent &&
                /^\d+\.$/.test(nextItem[2]) === isOrdered
              ) {
                i = look;
                break;
              }
            }
            break;
          }

          const nextIndent = getIndent(next);
          if (nextIndent > baseIndent) {
            const strip = Math.min(nextIndent, baseIndent + (isOrdered ? 4 : 2));
            itemLines.push(next.slice(strip));
            i += 1;
            continue;
          }
          break;
        }

        const hasBlocks = itemLines.some(
          (l, idx) =>
            idx > 0 &&
            (/^\s*```/.test(l) ||
              /^\s*>\s?/.test(l) ||
              /^\s*([-*]|\d+\.)\s+/.test(l) ||
              l.trim() === "")
        );

        if (hasBlocks) {
          items.push(`<li>${parseBlocks(itemLines)}</li>`);
        } else {
          items.push(`<li>${renderInline(itemLines.join(" ").trim())}</li>`);
        }
      }

      const tag = isOrdered ? "ol" : "ul";
      const startAttr = isOrdered && startNum !== 1 ? ` start="${startNum}"` : "";
      out.push(`<${tag}${startAttr}>\n${items.join("\n")}\n</${tag}>`);
      continue;
    }

    // Párrafo normal
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*\[Volver al índice\]\(LEEME\.md\)\s*$/.test(lines[i]) &&
      !/^\s*```/.test(lines[i]) &&
      !/^\s*#{1,6}\s+/.test(lines[i]) &&
      !/^\s*([-*_])\1{2,}\s*$/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    out.push(`<p>${renderInline(paraLines.join(" "))}</p>`);
  }

  return out.join("\n");
}

function markdownToHtml(md) {
  const normalized = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return parseBlocks(normalized.split("\n"));
}

function formatFechaEs(date) {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

function countFlashcardsInAppJs() {
  const appPath = path.join(ROOT, "assets", "app.js");
  if (!fs.existsSync(appPath)) return 36;
  const src = fs.readFileSync(appPath, "utf8");
  const matches = src.match(/id:\s*'fc-/g);
  return matches ? matches.length : 36;
}

// ---------- Generar index.html (compatible 100% con assets/styles.css + assets/app.js) ----------

function buildIndexHtml() {
  const topicFiles = fs
    .readdirSync(ROOT)
    .filter((f) => /^\d{2}-.+\.md$/.test(f))
    .sort((a, b) => a.localeCompare(b, "es"));

  const topics = topicFiles.map((file) => {
    const content = fs.readFileSync(path.join(ROOT, file), "utf8");
    const id = file.replace(/\.md$/, "");
    const num = id.slice(0, 2);
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const rawTitle = titleMatch ? titleMatch[1].trim() : id;
    const cleanTitle = rawTitle.replace(/^\d+\.\s*/, "");
    const meta = TOPIC_META[id] || {
      cats: "clase",
      date: "",
      navTitle: cleanTitle,
      fcLabel: `${num}. ${cleanTitle}`,
    };
    const html = markdownToHtml(content);
    return { file, id, num, rawTitle, cleanTitle, meta, html };
  });

  const totalCards = countFlashcardsInAppJs();
  const today = formatFechaEs(new Date());

  const navItems = topics
    .map(
      (t, idx) =>
        `      <a class="nav-item${idx === 0 ? " active" : ""}" href="#${t.id}" data-cats="${t.meta.cats}"><span class="nav-num">${t.num}</span><span>${escapeHtml(t.meta.navTitle)}</span><span class="nav-check">✓</span></a>`
    )
    .join("\n");

  const fcOptions = topics
    .map((t) => `          <option value="${t.id}">${escapeHtml(t.meta.fcLabel)}</option>`)
    .join("\n");

  const articles = topics
    .map((t) => {
      const dateAttr = t.meta.date ? ` data-date="${escapeHtml(t.meta.date)}"` : "";
      return `<article id="${t.id}" class="topic-card" data-cats="${t.meta.cats}"${dateAttr}>${t.html}\n</article>`;
    })
    .join("\n");

  const fullHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Apuntes organizados de Computación Grid y Cloud: clases, talleres prácticos de AWS, Terraform y Módulos 1 al 4 de AWS Academy.">
  <title>Computación Grid y Cloud — Apuntes de Estudio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script>
    (function () {
      try {
        var saved = JSON.parse(localStorage.getItem('gridcloud_theme'));
        var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  </script>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <div class="reading-progress" id="readingProgress" aria-hidden="true"></div>

  <!-- Top Navigation Bar -->
  <header class="topbar">
    <div class="topbar-left">
      <button type="button" class="menu-toggle" id="menuToggle" aria-label="Abrir índice de temas" aria-expanded="false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <span class="topbar-brand-mobile">Grid &amp; Cloud</span>
      <span class="topbar-current" id="topbarCurrent">Computación Grid y Cloud</span>
    </div>
    <div class="topbar-actions">
      <button type="button" class="search-trigger" data-open-search aria-label="Buscar en los apuntes">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Buscar…</span>
        <kbd>Ctrl K</kbd>
      </button>
      <button type="button" class="btn-pill" data-open-flashcards aria-label="Abrir modo repaso con flashcards">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
        <span>Repaso</span>
      </button>
      <button type="button" class="icon-btn" id="themeToggle" aria-label="Cambiar tema claro u oscuro"></button>
    </div>
  </header>

  <!-- Sidebar Drawer -->
  <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
  <aside class="sidebar" id="sidebar" aria-label="Índice de temas">
    <div class="sidebar-header">
      <a class="brand" href="#inicio">
        <span class="brand-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
        </span>
        <span class="brand-text">
          <strong>GRID &amp; CLOUD</strong>
          <span>Cuaderno interactivo</span>
        </span>
      </a>
      <button type="button" class="sidebar-close" id="sidebarClose" aria-label="Cerrar menú">✕</button>
    </div>

    <div class="sidebar-progress">
      <div class="progress-meta">
        <span>Progreso de estudio</span>
        <strong id="progressText">0 / ${topics.length}</strong>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="progressFill"></div>
      </div>
    </div>

    <div class="sidebar-filters" role="group" aria-label="Filtrar temas por categoría">
      <button type="button" class="filter-chip active" data-filter="all">Todos</button>
      <button type="button" class="filter-chip" data-filter="clase">Clases</button>
      <button type="button" class="filter-chip" data-filter="practica">Prácticas</button>
      <button type="button" class="filter-chip" data-filter="aws">AWS Academy</button>
    </div>

    <nav class="sidebar-nav">
${navItems}
    </nav>
  </aside>

  <!-- Main Study Area -->
  <main class="main-content">
    <section class="hero-card" id="inicio">
      <div class="hero-eyebrow">Clases + Talleres Terraform + AWS Academy (Módulos 1–4)</div>
      <h1>Computación Grid y Cloud</h1>
      <p class="hero-subtitle">Cuaderno interactivo de estudio actualizado al ${escapeHtml(today)}. Incluye teoría de clase, comandos prácticos de laboratorio, talleres de Terraform, diagramas ampliables y modo de autoevaluación.</p>
      <div class="hero-stats">
        <div class="stat-box">
          <strong>${topics.length}</strong>
          <span>Temas organizados</span>
        </div>
        <div class="stat-box">
          <strong id="heroProgressStat">0/${topics.length}</strong>
          <span>Temas estudiados</span>
        </div>
        <div class="stat-box">
          <strong id="heroCardsStat">0/${totalCards}</strong>
          <span>Flashcards dominadas</span>
        </div>
        <div class="stat-box">
          <strong>11 + ${Object.keys(SVG_DIAGRAMS).length} SVG</strong>
          <span>Imágenes y diagramas</span>
        </div>
      </div>
      <div class="hero-actions">
        <a class="hero-btn hero-btn-primary" href="#01-fundamentos">Empezar a estudiar</a>
        <button type="button" class="hero-btn hero-btn-secondary" data-open-flashcards>Practicar con Flashcards</button>
        <button type="button" class="hero-btn hero-btn-secondary" data-open-search>Buscar concepto (Ctrl+K)</button>
        <a class="hero-btn hero-btn-secondary" href="https://github.com/Aryy234/cloud-u1-ps-ae" target="_blank" rel="noopener noreferrer">Repo Terraform (GitHub)</a>
      </div>
    </section>
${articles}
  </main>

  <!-- Floating Back to Top -->
  <button type="button" class="back-to-top" id="backToTop" aria-label="Volver arriba">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
  </button>

  <!-- Search Modal -->
  <div class="modal-overlay" id="searchModal" role="dialog" aria-modal="true" aria-label="Buscar en los apuntes">
    <div class="modal-card">
      <div class="search-input-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="search" id="searchInput" placeholder="Buscar conceptos, comandos o servicios AWS…" autocomplete="off">
        <button type="button" class="icon-btn" id="searchClose" aria-label="Cerrar búsqueda">✕</button>
      </div>
      <div class="search-results" id="searchResults"></div>
    </div>
  </div>

  <!-- Flashcards Study Modal -->
  <div class="modal-overlay center-modal" id="flashcardsModal" role="dialog" aria-modal="true" aria-label="Modo repaso con flashcards">
    <div class="modal-card flashcards-card">
      <div class="modal-header">
        <h2>Modo Repaso — Flashcards</h2>
        <button type="button" class="icon-btn" id="flashcardsClose" aria-label="Cerrar modo repaso">✕</button>
      </div>
      <div class="flashcards-controls">
        <select class="flashcards-select" id="fcTopicFilter" aria-label="Filtrar tarjetas por tema">
          <option value="all">Todos los temas (${totalCards} tarjetas)</option>
${fcOptions}
        </select>
        <label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
          <input type="checkbox" id="fcOnlyPending"> Solo pendientes
        </label>
        <button type="button" class="fc-btn" id="fcShuffleBtn">🔀 Barajar</button>
      </div>
      <div class="flashcards-body">
        <div class="flashcard-counter">
          <span id="fcCounter">Tarjeta 1 de ${totalCards}</span>
          <strong id="fcKnownStats">Dominadas: 0 / ${totalCards}</strong>
        </div>
        <div class="flashcard-scene">
          <div class="flashcard-inner" id="fcCardInner">
            <div class="flashcard-face flashcard-face-front">
              <span class="flashcard-tag" id="fcFrontTag">Pregunta</span>
              <p class="flashcard-question" id="fcQuestion"></p>
              <span class="flashcard-tap-hint">Toca la tarjeta o pulsa Espacio para ver la respuesta</span>
            </div>
            <div class="flashcard-face flashcard-face-back">
              <span class="flashcard-tag" id="fcBackTag">Respuesta</span>
              <p class="flashcard-answer" id="fcAnswer"></p>
              <span class="flashcard-tap-hint">Toca para volver a la pregunta</span>
            </div>
          </div>
        </div>
        <div class="flashcards-footer">
          <div class="fc-btn-group">
            <button type="button" class="fc-btn" id="fcPrevBtn">← Anterior</button>
            <button type="button" class="fc-btn" id="fcFlipBtn">↻ Voltear</button>
            <button type="button" class="fc-btn" id="fcNextBtn">Siguiente →</button>
          </div>
          <button type="button" class="fc-btn fc-btn-known" id="fcKnownBtn">○ Marcar dominada</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Lightbox Modal (Images & Diagrams) -->
  <div class="modal-overlay center-modal" id="lightboxModal" role="dialog" aria-modal="true" aria-label="Visor ampliado">
    <div class="lightbox-content">
      <div class="lightbox-toolbar">
        <button type="button" id="lightboxZoomOut" aria-label="Alejar">−</button>
        <button type="button" id="lightboxZoomReset" aria-label="Restablecer zoom">100%</button>
        <button type="button" id="lightboxZoomIn" aria-label="Acercar">+</button>
        <button type="button" id="lightboxClose" aria-label="Cerrar visor">✕ Cerrar</button>
      </div>
      <div class="lightbox-stage" id="lightboxStage"></div>
      <div class="lightbox-caption" id="lightboxCaption"></div>
    </div>
  </div>

  <script src="assets/app.js"></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, "index.html"), fullHtml, "utf8");
  return { topicsCount: topics.length, totalCards };
}

// ---------- Sincronizar ../cloud-u1-ps-ae/documentacion.md ----------

function syncTerraformRepoDoc() {
  if (!fs.existsSync(TERRAFORM_REPO)) {
    return { synced: false, reason: "Repositorio vecino cloud-u1-ps-ae no encontrado" };
  }

  const f06 = path.join(ROOT, "06-terraform.md");
  const f12 = path.join(ROOT, "12-talleres-terraform.md");
  if (!fs.existsSync(f06) || !fs.existsSync(f12)) {
    return { synced: false, reason: "Faltan 06-terraform.md o 12-talleres-terraform.md" };
  }

  function cleanForRepo(md) {
    return md
      .replace(/\r\n/g, "\n")
      .replace(/^\[Volver al índice\]\(LEEME\.md\)\n*/gm, "")
      .replace(/^Clase: .*\n*/gm, "")
      .replace(/^Última actualización: .*\n*/gm, "")
      .replace(/\]\((\d{2}-[^)]+)\.md\)/g, `](${WEB_URL}#$1)`)
      .replace(/^(#{1,5})\s/gm, "$1# ")
      .trim();
  }

  const parteTeoria = cleanForRepo(fs.readFileSync(f06, "utf8"));
  const parteTalleres = cleanForRepo(fs.readFileSync(f12, "utf8"));

  const combined = `# Documentación de Infraestructura como Código con Terraform (AWS)

> **Documento sincronizado automáticamente** desde el cuaderno web [Computación Grid y Cloud](${WEB_URL}) mediante \`node scripts/construir.mjs\`.
> Para estudiar la versión web completa (con los 12 temas, flashcards, modo oscuro y diagramas ampliables), abre: **[${WEB_URL}](${WEB_URL})**.

---

## Tabla de Contenidos

- [Parte I — Teoría, Anatomía HCL y Comandos (Tema 6)](#6-infraestructura-como-código-con-terraform)
- [Parte II — Talleres Prácticos: Taller 8 y Taller 12 (Tema 12)](#12-talleres-prácticos-de-terraform-ec2-y-efs)

---

${parteTeoria}

---

${parteTalleres}
`;

  const outPath = path.join(TERRAFORM_REPO, "documentacion.md");
  fs.writeFileSync(outPath, combined, "utf8");
  return { synced: true, outPath };
}

// ---------- Ejecución principal ----------

const { topicsCount, totalCards } = buildIndexHtml();
console.log(`✔ index.html regenerado correctamente con ${topicsCount} temas y ${totalCards} flashcards.`);

const syncResult = syncTerraformRepoDoc();
if (syncResult.synced) {
  console.log(`✔ Documentación sincronizada en: ${syncResult.outPath}`);
} else {
  console.log(`ℹ Sincronización omitida: ${syncResult.reason}`);
}
