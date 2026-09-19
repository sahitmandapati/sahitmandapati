#!/usr/bin/env node
// Scans data/blogs for markdown files and writes the manifest the site fetches at runtime.
import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogsDir = path.join(__dirname, '..', 'data', 'blogs');
const indexPath = path.join(blogsDir, 'index.json');

const entries = await readdir(blogsDir, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

await writeFile(indexPath, `${JSON.stringify(files, null, 2)}\n`);
console.log(`Generated data/blogs/index.json with ${files.length} post(s).`);
