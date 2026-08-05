#!/usr/bin/env node
/**
 * Gera OG images (1200x630 PNG) com Satori + @resvg/resvg-js.
 * - public/og/home.png para o home
 * - public/og/{slug}.png para cada post do blog (exceto index.mdx)
 *
 * Se qualquer coisa falhar, só loga um warning — o build não pode quebrar.
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const FONT_DIR = path.join(root, 'scripts', 'fonts');
const BLOG_DIR = path.join(root, 'src', 'content', 'blog');
const OUT_DIR = path.join(root, 'public', 'og');

const WIDTH = 1200;
const HEIGHT = 630;
const TITLE_FONT_SIZE = 64;
const TITLE_MAX_WIDTH = 900;
const TITLE_MAX_LINES = 2;
const BADGE_TEXT = 'OPENCODEX · ECOSSISTEMA';
const FOOTER_TEXT = 'opencode-community.github.io/opendex';

// --- Parsing de frontmatter com regex simples (sem dependências) ---
function readField(frontmatter, key) {
  const m = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!m) return undefined;
  let value = m[1].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = match[1];
  return {
    title: readField(fm, 'title'),
    description: readField(fm, 'description'),
    pubDate: readField(fm, 'pubDate'),
  };
}

// --- Medição aproximada de largura de texto (Inter) para truncar o título ---
const NARROW = new Set("ilIj.,:;'`|!¡()[]{}·\"".split(''));
const WIDE = new Set('MW@%&$#GOQDmw'.split(''));

function measure(text, fontSize) {
  let width = 0;
  for (const ch of text) {
    if (ch === ' ') width += 0.3 * fontSize;
    else if (NARROW.has(ch)) width += 0.3 * fontSize;
    else if (WIDE.has(ch)) width += 0.78 * fontSize;
    else if (ch === '—') width += 0.85 * fontSize;
    else if (/[A-Z]/.test(ch)) width += 0.62 * fontSize;
    else width += 0.53 * fontSize;
  }
  return width;
}

function truncateTitle(title) {
  const maxTotal = TITLE_MAX_WIDTH * TITLE_MAX_LINES;
  if (measure(title, TITLE_FONT_SIZE) <= maxTotal) return title;

  const words = title.split(/\s+/);
  let text = '';
  for (const word of words) {
    const candidate = text ? `${text} ${word}` : word;
    if (measure(`${candidate}...`, TITLE_FONT_SIZE) <= maxTotal) {
      text = candidate;
    } else {
      break;
    }
  }
  if (!text) text = words[0];
  while (text.length > 1 && measure(`${text}...`, TITLE_FONT_SIZE) > maxTotal) {
    text = text.slice(0, -1);
  }
  return `${text.trim()}...`;
}

// --- Árvore de elementos (JSX-like, sem classes — só style inline) ---
function circle(size, style) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: 9999,
        backgroundColor: 'rgba(124,58,237,0.15)',
        ...style,
      },
    },
  };
}

function buildTree(title) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter',
        backgroundColor: '#0f0a1e',
        backgroundImage: 'linear-gradient(to bottom, #1e1b4b 0%, #0f0a1e 100%)',
        paddingTop: 72,
        paddingBottom: 56,
        paddingLeft: 64,
        paddingRight: 64,
      },
      children: [
        circle(420, { top: -140, left: -140 }),
        circle(320, { bottom: -120, right: -80 }),
        circle(200, { top: 48, right: 180 }),
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, width: '100%', position: 'relative' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 9999,
                    border: '1px solid rgba(167,139,250,0.35)',
                    backgroundColor: 'rgba(167,139,250,0.08)',
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 24,
                    paddingRight: 24,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 28, color: '#a78bfa', letterSpacing: 4 },
                        children: BADGE_TEXT,
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'Inter',
                          fontWeight: 700,
                          fontSize: TITLE_FONT_SIZE,
                          color: '#ffffff',
                          textAlign: 'center',
                          width: TITLE_MAX_WIDTH,
                          lineHeight: 1.15,
                        },
                        children: title,
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', justifyContent: 'center', width: '100%' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 28, color: '#9ca3af' },
                        children: FOOTER_TEXT,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function generateImage(title, outputPath, fonts) {
  const svg = await satori(buildTree(truncateTitle(title)), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  const png = resvg.render().asPng();
  fs.writeFileSync(outputPath, png);
  console.log(`   [generate-og] ${path.basename(outputPath)} (${(png.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const fontRegular = fs.readFileSync(path.join(FONT_DIR, 'inter-400.woff'));
  const fontBold = fs.readFileSync(path.join(FONT_DIR, 'inter-700.woff'));
  const fonts = [
    { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
    { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
  ];

  fs.mkdirSync(OUT_DIR, { recursive: true });

  await generateImage('OpenDex — Ecossistema OpenCode', path.join(OUT_DIR, 'home.png'), fonts);

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')
    .filter((f) => fs.statSync(path.join(BLOG_DIR, f)).isFile());

  for (const file of files) {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const fm = parseFrontmatter(content);
    const title = fm.title || file.replace(/\.mdx$/, '').replace(/-/g, ' ');
    const slug = file.replace(/\.mdx$/, '');
    await generateImage(title, path.join(OUT_DIR, `${slug}.png`), fonts);
  }

  console.log(`[generate-og] ${files.length + 1} imagens geradas em ${path.relative(root, OUT_DIR)}/`);
}

try {
  await main();
} catch (err) {
  console.warn(`[generate-og] Aviso: falha ao gerar OG images — ${err?.message || err}`);
  if (err?.stack) console.warn(err.stack);
}
