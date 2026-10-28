#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(scriptDir, '..');
const outputFlag = process.argv.indexOf('--output-dir');
const outputRoot = outputFlag === -1
  ? projectRoot
  : path.resolve(process.argv[outputFlag + 1] || projectRoot);
const blogsDir = path.join(projectRoot, 'data', 'blogs');
const outputBlogsDir = path.join(outputRoot, 'data', 'blogs');
const indexPath = path.join(outputBlogsDir, 'index.json');
const indexHtml = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
const siteUrl = indexHtml.match(/<link rel="canonical" href="([^"]+)"/)?.[1];

if (!siteUrl) {
  throw new Error('Could not find the canonical site URL in index.html.');
}

const files = (await readdir(blogsDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

await mkdir(outputBlogsDir, { recursive: true });
await writeFile(indexPath, `${JSON.stringify(files, null, 2)}\n`);

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugFor(fileName) {
  return fileName
    .replace(/\.md$/i, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseBlog(markdown, fileName) {
  let content = markdown.trim();
  const frontMatter = {};

  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 4);
    if (end !== -1) {
      content.slice(4, end).trim().split('\n').forEach((line) => {
        const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
        if (match) frontMatter[match[1].trim()] = match[2].trim();
      });
      content = content.slice(end + 4).trim();
    }
  }

  const fallbackTitle = fileName.replace(/\.md$/i, '').replace(/[_-]+/g, ' ');
  const markdownTitle = content.match(/^#\s+(.+)$/m)?.[1]?.trim()
    || content.split('\n').find((line) => line.trim() && !line.startsWith('!['))
      ?.replace(/[#>*_`\[\]()]/g, '')
      .trim();
  const title = frontMatter.title || markdownTitle || fallbackTitle;
  const lines = content.split('\n');
  const titleIndex = lines.findIndex((line) => line.trim());
  if (titleIndex !== -1 && lines[titleIndex].trim().replace(/^#+\s*/, '').replace(/[*_`]/g, '').trim().toLowerCase() === title.toLowerCase()) {
    lines.splice(titleIndex, 1);
  }
  content = lines.join('\n').trim();

  const description = frontMatter.description
    || content.replace(/^---[\s\S]*?---\s*/, '')
      .split(/\n+/)
      .map((line) => line.trim())
      .find((line) => line.length > 20 && !/^([#>*_`-]|\!\[)/.test(line))
      ?.replace(/[*_`]/g, '')
      .slice(0, 170)
    || 'Read the full note on thegoldenpath.';

  return {
    title,
    description: description.length === 170 ? `${description}...` : description,
    category: frontMatter.category || 'Notes',
    date: frontMatter.date || '28th Oct 2026',
    content
  };
}

function safeLink(destination) {
  try {
    const url = new URL(destination);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function renderInline(markdown) {
  let html = escapeHtml(markdown);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, destination) => {
    const href = safeLink(destination);
    return href ? `<a href="${escapeHtml(href)}">${label}</a>` : label;
  });
  return html;
}

function renderMarkdown(markdown) {
  const blocks = [];
  let paragraph = [];
  let list = [];
  let code = null;
  let quote = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${paragraph.map(renderInline).join(' ')}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    const tag = list[0].ordered ? 'ol' : 'ul';
    blocks.push(`<${tag}>${list.map((item) => `<li>${renderInline(item.text)}</li>`).join('')}</${tag}>`);
    list = [];
  };
  const flushQuote = () => {
    if (quote.length) blocks.push(`<blockquote>${quote.map((line) => `<p>${renderInline(line)}</p>`).join('')}</blockquote>`);
    quote = [];
  };

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    const codeFence = trimmed.startsWith('```');

    if (code !== null) {
      if (codeFence) {
        blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        code = null;
      } else {
        code.push(line);
      }
      continue;
    }

    if (codeFence) {
      flushParagraph();
      flushList();
      flushQuote();
      code = [];
    } else if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
    } else if (/^#{1,6}\s/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      const [, hashes, heading] = trimmed.match(/^(#{1,6})\s+(.+)$/);
      const level = Math.min(hashes.length + 1, 6);
      blocks.push(`<h${level}>${renderInline(heading)}</h${level}>`);
    } else if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      flushList();
      quote.push(trimmed.replace(/^>\s?/, ''));
    } else if (/^([-*]|\d+\.)\s+/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      const ordered = /^\d+\./.test(trimmed);
      if (list.length && list[0].ordered !== ordered) flushList();
      list.push({ ordered, text: trimmed.replace(/^([-*]|\d+\.)\s+/, '') });
    } else {
      flushList();
      flushQuote();
      paragraph.push(trimmed);
    }
  }

  flushParagraph();
  flushList();
  flushQuote();
  if (code !== null) blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
  return blocks.join('\n');
}

function dateForSchema(date) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const match = date.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const months = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const month = months[match[2].slice(0, 3).toLowerCase()];
  if (!month) return null;
  return `${match[3]}-${month}-${match[1].padStart(2, '0')}`;
}

function makeArticleHtml(blog, slug, body) {
  const pageUrl = new URL(`thegoldenpath/${slug}/`, siteUrl).href;
  const imageUrl = new URL('data/assets/sahit_profile.png', siteUrl).href;
  const safeTitle = escapeHtml(blog.title);
  const safeDescription = escapeHtml(blog.description);
  const safeCategory = escapeHtml(blog.category);
  const safeDate = escapeHtml(blog.date);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description,
    image: imageUrl,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    author: {
      '@type': 'Person',
      name: 'Sahit Mandapati',
      url: siteUrl
    },
    publisher: {
      '@type': 'Person',
      name: 'Sahit Mandapati',
      url: siteUrl
    },
    articleSection: blog.category,
    inLanguage: 'en',
    ...(dateForSchema(blog.date) ? { datePublished: dateForSchema(blog.date) } : {})
  };
  const schemaJson = JSON.stringify(schema).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle} | thegoldenpath</title>
  <meta name="description" content="${safeDescription}">
  <meta name="author" content="Sahit Mandapati">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="thegoldenpath">
  <meta property="og:title" content="${safeTitle} | thegoldenpath">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="Sahit Mandapati, author of thegoldenpath">
  <meta property="article:author" content="Sahit Mandapati">
  <meta property="article:section" content="${safeCategory}">
  ${dateForSchema(blog.date) ? `<meta property="article:published_time" content="${dateForSchema(blog.date)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle} | thegoldenpath">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${imageUrl}">
  <script type="application/ld+json">${schemaJson}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1d1d1f; background: #f5f5f7; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 3rem 1.25rem 5rem; }
    main { max-width: 760px; margin: 0 auto; padding: clamp(1.5rem, 5vw, 3.5rem); background: #fff; border: 1px solid #e5e5e7; border-radius: 1.25rem; }
    nav { display: flex; align-items: center; gap: .75rem; margin-bottom: 2rem; }
    nav a { color: #6e6e73; font-size: .9rem; text-decoration: none; }
    .nav-blog-brand { color: #e60026; font: 400 1.7rem/1 "Pacifico", cursive; }
    .back-link { display: inline-block; margin-bottom: 1rem; }
    .meta { color: #6e6e73; font-size: .75rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: .8rem 0 2rem; font-size: clamp(2.2rem, 6vw, 3.5rem); line-height: 1.08; letter-spacing: -.04em; }
    article { max-width: 68ch; margin: 0 auto; font-size: 1.08rem; line-height: 1.85; overflow-wrap: anywhere; }
    article p, article li, blockquote { color: #55555a; }
    h2, h3, h4, h5, h6 { margin: 2rem 0 .75rem; line-height: 1.3; }
    a { color: #0071e3; }
    blockquote { margin: 1.5rem 0; padding-left: 1rem; border-left: 3px solid #007f6e; }
    pre { overflow-x: auto; padding: 1rem; background: #f5f5f7; border-radius: .75rem; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    @media (max-width: 600px) { body { padding: 1rem .75rem 3rem; } }
  </style>
</head>
<body>
  <main>
    <nav aria-label="Blog">
      <a class="nav-blog-brand" href="${siteUrl}#writing">thegoldenpath</a>
    </nav>
    <a class="back-link" href="${siteUrl}#writing">← Back to writing</a>
    <p class="meta">By Sahit Mandapati · ${safeCategory} · ${safeDate}</p>
    <h1>${safeTitle}</h1>
    <article>${body}</article>
  </main>
</body>
</html>
`;
}

const sitemapUrls = [siteUrl];
const generatedSlugs = new Set();
for (const file of files) {
  const markdown = await readFile(path.join(blogsDir, file), 'utf8');
  const blog = parseBlog(markdown, file);
  const slug = slugFor(file);
  if (!slug) throw new Error(`Could not create a URL slug for ${file}.`);
  if (generatedSlugs.has(slug)) throw new Error(`Duplicate blog URL slug "${slug}".`);
  generatedSlugs.add(slug);

  const outputDir = path.join(outputRoot, 'thegoldenpath', slug);
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), makeArticleHtml(blog, slug, renderMarkdown(blog.content)));
  sitemapUrls.push(new URL(`thegoldenpath/${slug}/`, siteUrl).href);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(outputRoot, 'sitemap.xml'), sitemap);
console.log(`Generated blog manifest, ${files.length} SEO article page(s), and sitemap in ${outputRoot}.`);
