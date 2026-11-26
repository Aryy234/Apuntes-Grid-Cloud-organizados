#!/usr/bin/env node
/**
 * Script de construcción y sincronización para Apuntes Grid & Cloud.
 *
 * Uso:
 *   node scripts/construir.mjs
 *
 * Qué hace:
 *   1. Lee automáticamente todos los archivos NN-*.md en orden (01, 02, ..., 10, ...).
 *   2. Regenera index.html (con menú lateral, buscador rápido y diagramas SVG offline).
 *   3. Sincroniza ../cloud-u1-ps-ae/documentacion.md combinando 06-terraform.md
 *      y 10-talleres-terraform.md (si el repositorio vecino existe).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const TERRAFORM_REPO = path.resolve(ROOT, "..", "cloud-u1-ps-ae");
const WEB_URL = "https://apuntes-grid-cloud.vercel.app/";

// ---------- Diagramas SVG 100% offline (paleta del cuaderno) ----------

const SVG_DIAGRAMS = {
  "flujo-terraform": {
    caption: "Flujo interno de Terraform: código HCL, Provider AWS, API real y archivo de estado.",
    svg: `<svg viewBox="0 0 880 205" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Flujo interno de Terraform">
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
</svg>`,
  },

  "ciclo-comandos": {
    caption: "Ciclo de vida de los comandos en terminal desde la autenticación hasta la destrucción.",
    svg: `<svg viewBox="0 0 920 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ciclo de comandos de Terraform">
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
</svg>`,
  },

  "arq-taller8": {
    caption: "Arquitectura del Taller 8 (taller8-ae2): 1 instancia EC2 con Security Group de reglas embebidas.",
    svg: `<svg viewBox="0 0 880 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arquitectura del Taller 8">
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
</svg>`,
  },

  "arq-taller12": {
    caption: "Arquitectura del Taller 12 (taller12-efs-ae): 2 instancias EC2 con Security Groups desacoplados comunicados por NFS (TCP 2049).",
    svg: `<svg viewBox="0 0 920 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arquitectura del Taller 12">
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
</svg>`,
  },
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
  // 1. Proteger inline code `...` primero
  const codeTokens = [];
  let work = text.replace(/`([^`]+)`/g, (_, code) => {
    const idx = codeTokens.length;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000CODE${idx}\u0000`;
  });

  // 2. Proteger etiquetas <br> legítimas en tablas
  const brTokens = [];
  work = work.replace(/<br\s*\/?>/gi, () => {
    const idx = brTokens.length;
    brTokens.push("<br>");
    return `\u0000BR${idx}\u0000`;
  });

  // 3. Escapar HTML restante
  work = escapeHtml(work);

  // 4. Imágenes ![alt](src)
  work = work.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `<img loading="lazy" src="${src.trim()}" alt="${alt}">`;
  });

  // 5. Enlaces [texto](destino)
  work = work.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, rawHref) => {
    let href = rawHref.trim();
    if (href === "LEEME.md") {
      return `<a href="#inicio">${label}</a>`;
    }
    const localMd = href.match(/^(\d{2}-[^#]+)\.md(?:#.*)?$/);
    if (localMd) {
      return `<a href="#${localMd[1]}">${label}</a>`;
    }
    if (/^https?:\/\//i.test(href)) {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
    return `<a href="${href}">${label}</a>`;
  });

  // 6. Negrita **...** y cursiva *...* (sin usar _ para respetar snake_case)
  work = work.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  work = work.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // 7. Restaurar <br> y inline code
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
      const { svg, caption } = SVG_DIAGRAMS[match[1]];
      return `<figure class="diagrama">${svg}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
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

    // Línea vacía
    if (!line.trim()) {
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
      if (i < lines.length) i += 1; // cerrar ```
      out.push(renderMermaidOrCode(lang, codeLines));
      continue;
    }

    // Encabezados # a ######
    const headMatch = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (headMatch) {
      const level = headMatch[1].length;
      out.push(`<h${level}>${renderInline(headMatch[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    // Separador horizontal ---
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
      const aligns = splitTableRow(lines[i + 1]).map((cell) => {
        if (cell.startsWith(":") && cell.endsWith(":")) return "center";
        if (cell.endsWith(":")) return "right";
        return "left";
      });
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      const thead = headers
        .map((h, idx) => `<th style="text-align:${aligns[idx] || "left"}">${renderInline(h)}</th>`)
        .join("");
      const tbody = rows
        .map(
          (r) =>
            `<tr>${headers
              .map((_, idx) => `<td style="text-align:${aligns[idx] || "left"}">${renderInline(r[idx] || "")}</td>`)
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

        // Recolectar líneas de continuación (sublistas, bloques de código, citas, párrafos)
        while (i < lines.length) {
          const next = lines[i];
          if (!next.trim()) {
            // Mirar adelante si el siguiente bloque no vacío sigue indentado dentro del ítem
            let look = i + 1;
            while (look < lines.length && !lines[look].trim()) look += 1;
            if (look < lines.length && getIndent(lines[look]) > baseIndent) {
              itemLines.push("");
              i += 1;
              continue;
            }
            // O si continúa la misma lista en el mismo nivel
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
            // Quitar la indentación mínima del cuerpo del ítem (generalmente 2-4 espacios)
            const strip = Math.min(nextIndent, baseIndent + (isOrdered ? 4 : 2));
            itemLines.push(next.slice(strip));
            i += 1;
            continue;
          }
          break;
        }

        // Renderizar contenido del ítem
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

// ---------- Generar index.html ----------

function formatFechaEs(date) {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

function buildIndexHtml() {
  const topicFiles = fs
    .readdirSync(ROOT)
    .filter((f) => /^\d{2}-.+\.md$/.test(f))
    .sort((a, b) => a.localeCompare(b, "es"));

  const topics = topicFiles.map((file) => {
    const content = fs.readFileSync(path.join(ROOT, file), "utf8");
    const id = file.replace(/\.md$/, "");
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : id;
    const html = markdownToHtml(content);
    return { file, id, title, html };
  });

  const navLinks = topics
    .map((t) => `    <a href="#${t.id}" data-target="${t.id}">${escapeHtml(t.title)}</a>`)
    .join("\n");

  const articles = topics
    .map((t) => `  <article id="${t.id}">\n${t.html}\n  </article>`)
    .join("\n");

  const today = formatFechaEs(new Date());

  const fullHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Computación Grid y Cloud — Apuntes</title>
  <style>
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{margin:0;font:17px/1.7 system-ui,-apple-system,Segoe UI,sans-serif;color:#203044;background:#f2f5f9}
    aside{position:fixed;width:295px;height:100vh;overflow:auto;background:#122b3a;color:#fff;padding:28px 20px}
    aside strong{letter-spacing:.06em;font-size:15px}
    aside p{margin:4px 0 16px;color:#9fc0d1;font-size:13.5px}
    .buscador-wrap{margin:0 0 16px}
    #buscador{width:100%;padding:9px 12px;border-radius:8px;border:1px solid #2b4c60;background:#0d202c;color:#fff;font-size:13.5px;outline:none}
    #buscador::placeholder{color:#89a7b8}
    #buscador:focus{border-color:#38bdf8}
    #estado-busqueda{display:block;margin-top:6px;font-size:12px;color:#9fc0d1;min-height:16px}
    aside a{display:block;color:#d8e9f0;text-decoration:none;margin:8px 0;padding:6px 10px;border-radius:7px;font-size:13.8px;line-height:1.35;transition:background .15s}
    aside a:hover,aside a.activo{background:#1c4157;color:#fff}
    aside a.oculto{display:none}
    main{margin-left:295px;max-width:1120px;padding:38px}
    header,article{background:#fff;padding:34px;border-radius:14px;margin-bottom:24px;border:1px solid #dde5ed}
    h1,h2,h3,h4{line-height:1.25;color:#124d64}
    h1{font-size:30px;margin-top:0}
    h2{font-size:23px;margin-top:30px}
    h3{font-size:19px;margin-top:22px}
    h4{font-size:16.5px;margin-top:18px;color:#1c5f78}
    a{color:#087795}
    img{max-width:100%;height:auto;border-radius:6px}
    figure{margin:24px 0}
    figure.diagrama{background:#f8fbfd;border:1px solid #d5e3ec;border-radius:10px;padding:16px;text-align:center}
    figure.diagrama svg{max-width:100%;height:auto;display:block;margin:0 auto}
    figcaption{font-size:12.5px;color:#54677a;margin-top:10px}
    pre{padding:18px;overflow:auto;background:#142a39;color:#e5f1f7;border-radius:8px;font:13.5px/1.6 Consolas,monospace}
    code{font-family:Consolas,monospace;font-size:.88em;background:#edf3f7;color:#12384b;padding:2px 5px;border-radius:4px}
    pre code{background:transparent;color:inherit;padding:0;font-size:inherit}
    p{margin:12px 0}
    ul,ol{padding-left:24px}
    li{margin:6px 0}
    hr{border:0;border-top:1px solid #e2e9f0;margin:24px 0}
    small{color:#607182}
    .header-links{display:flex;flex-wrap:wrap;gap:14px;margin-top:14px}
    .header-links a{background:#eef5f8;padding:6px 12px;border-radius:7px;text-decoration:none;font-size:14px;font-weight:600}
    .header-links a:hover{background:#dfeef5}
    table{border-collapse:collapse;width:100%;display:block;overflow:auto;margin:16px 0}
    th,td{border:1px solid #dce4eb;padding:10px 12px;text-align:left;vertical-align:top}
    th{background:#eef5f8;color:#12384b}
    blockquote{border-left:4px solid #087795;margin:18px 0;padding:6px 18px;background:#f2f7fa;border-radius:0 8px 8px 0}
    article.resaltado{border-color:#087795;box-shadow:0 0 0 2px rgba(8,119,149,.12)}
    @media(max-width:850px){
      aside{position:static;width:auto;height:auto}
      main{margin:0;padding:14px}
      header,article{padding:22px}
    }
    @media print{
      aside{display:none}
      main{margin:0;padding:0;max-width:none}
      article{break-before:page;border:none;padding:0}
      pre{white-space:pre-wrap}
      img{max-height:650px}
    }
  </style>
</head>
<body>
  <aside>
    <strong>GRID &amp; CLOUD</strong>
    <p>Cuaderno de clases (${topics.length} temas)</p>
    <div class="buscador-wrap">
      <input type="search" id="buscador" placeholder="Buscar concepto (ej. egress, count, NFS)..." aria-label="Buscar en apuntes">
      <small id="estado-busqueda"></small>
    </div>
    <nav id="menu-temas">
${navLinks}
    </nav>
  </aside>
  <main>
    <header id="inicio">
      <small>APUNTES Y TALLERES DE AWS &amp; TERRAFORM</small>
      <h1>Computación Grid y Cloud</h1>
      <p>${topics.length} temas · Actualizado el ${escapeHtml(today)}</p>
      <p>Imágenes originales, ejemplos de clase, diagramas offline y talleres prácticos de Terraform sincronizados con el repositorio de código.</p>
      <div class="header-links">
        <a href="Apuntes%20de%20clase.md">Archivo principal para nuevos apuntes</a>
        <a href="https://github.com/Aryy234/cloud-u1-ps-ae" target="_blank" rel="noopener noreferrer">Repositorio de talleres Terraform (GitHub)</a>
      </div>
    </header>
${articles}
  </main>
  <script>
    (function () {
      const input = document.getElementById("buscador");
      const estado = document.getElementById("estado-busqueda");
      const links = Array.from(document.querySelectorAll("#menu-temas a"));
      const articles = Array.from(document.querySelectorAll("main article"));

      function normalizar(t) {
        return t.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
      }

      input.addEventListener("input", () => {
        const q = normalizar(input.value.trim());
        let coincidencias = 0;
        let primero = null;

        articles.forEach((art, idx) => {
          const match = !q || normalizar(art.textContent).includes(q);
          links[idx].classList.toggle("oculto", !match);
          art.classList.toggle("resaltado", Boolean(q) && match);
          if (match) {
            coincidencias++;
            if (!primero) primero = art;
          }
        });

        estado.textContent = q
          ? (coincidencias ? coincidencias + " tema(s) con coincidencias" : "Sin coincidencias")
          : "";
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const primero = links.find((a) => !a.classList.contains("oculto"));
          if (primero) primero.click();
        }
      });

      if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              links.forEach((a) => a.classList.toggle("activo", a.dataset.target === id));
            }
          });
        }, { rootMargin: "-20% 0px -70% 0px" });
        articles.forEach((art) => obs.observe(art));
      }
    })();
  </script>
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, "index.html"), fullHtml, "utf8");
  return topics.length;
}

// ---------- Sincronizar ../cloud-u1-ps-ae/documentacion.md ----------

function syncTerraformRepoDoc() {
  if (!fs.existsSync(TERRAFORM_REPO)) {
    return { synced: false, reason: "Repositorio vecino cloud-u1-ps-ae no encontrado" };
  }

  const f06 = path.join(ROOT, "06-terraform.md");
  const f10 = path.join(ROOT, "10-talleres-terraform.md");
  if (!fs.existsSync(f06) || !fs.existsSync(f10)) {
    return { synced: false, reason: "Faltan 06-terraform.md o 10-talleres-terraform.md" };
  }

  function cleanForRepo(md) {
    return md
      .replace(/\r\n/g, "\n")
      // Quitar líneas de navegación locales del cuaderno
      .replace(/^\[Volver al índice\]\(LEEME\.md\)\n*/gm, "")
      .replace(/^Clase: .*\n*/gm, "")
      .replace(/^Última actualización: .*\n*/gm, "")
      // Convertir enlaces internos a temas del cuaderno en enlaces al sitio publicado
      .replace(/\]\((\d{2}-[^)]+)\.md\)/g, `](${WEB_URL}#$1)`)
      // Bajar un nivel los encabezados (# -> ##) para que encajen bajo el título principal
      .replace(/^(#{1,5})\s/gm, "$1# ")
      .trim();
  }

  const parteTeoria = cleanForRepo(fs.readFileSync(f06, "utf8"));
  const parteTalleres = cleanForRepo(fs.readFileSync(f10, "utf8"));

  const combined = `# Documentación de Infraestructura como Código con Terraform (AWS)

> **Documento sincronizado automáticamente** desde el cuaderno web [Computación Grid y Cloud](${WEB_URL}) mediante \`node scripts/construir.mjs\`.
> Para estudiar la versión web completa (con todos los temas del curso y diagramas interactivos), abre: **[${WEB_URL}](${WEB_URL})**.

---

## Tabla de Contenidos

- [Parte I — Teoría, Anatomía HCL y Comandos (Tema 6)](#6-infraestructura-como-código-con-terraform)
- [Parte II — Talleres Prácticos: Taller 8 y Taller 12 (Tema 10)](#10-talleres-prácticos-de-terraform-ec2-y-efs)

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

const count = buildIndexHtml();
console.log(`✔ index.html regenerado correctamente con ${count} temas.`);

const syncResult = syncTerraformRepoDoc();
if (syncResult.synced) {
  console.log(`✔ Documentación sincronizada en: ${syncResult.outPath}`);
} else {
  console.log(`ℹ Sincronización omitida: ${syncResult.reason}`);
}
