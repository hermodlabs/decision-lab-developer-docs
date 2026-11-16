// Documentation-only maintenance tool. No implementation package is needed.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
async function markdown(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (['node_modules', '.output', '.git'].includes(entry.name)) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Documentation must be self-contained: ${filename}`);
    if (entry.isDirectory()) result.push(...await markdown(filename));
    else if (entry.name.endsWith('.md')) result.push(filename);
  }
  return result.sort();
}
const withoutFences = text => text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
function anchors(source) {
  const ids = new Set();
  const counts = new Map();
  for (const match of withoutFences(source).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const slug = match[1].toLowerCase().replace(/<[^>]*>/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
    const count = counts.get(slug) || 0;
    ids.add(count ? `${slug}-${count}` : slug);
    counts.set(slug, count + 1);
  }
  for (const match of source.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(match[1]);
  return ids;
}

const documents = await markdown(root);
const failures = [];
let links = 0;
for (const filename of documents) {
  const source = await fs.readFile(filename, 'utf8');
  for (const match of withoutFences(source).matchAll(/!?\[[^\]\n]*\]\((<[^>]+>|[^\s)]+)(?:\s+["'][^\n]*?["'])?\)/g)) {
    const reference = match[1].replace(/^<|>$/g, '');
    if (/^[a-z][a-z0-9+.-]*:/i.test(reference)) continue;
    links += 1;
    try {
      const [relative, hash] = reference.split('#');
      const target = relative ? path.resolve(path.dirname(filename), decodeURIComponent(relative.split('?')[0])) : filename;
      assert.ok(target === root.slice(0, -1) || target.startsWith(root), `Link leaves this repository: ${reference}`);
      const stat = await fs.stat(target);
      if (hash && target.endsWith('.md') && stat.isFile()) {
        assert.ok(anchors(await fs.readFile(target, 'utf8')).has(decodeURIComponent(hash)), `Missing heading: ${reference}`);
      }
    } catch (error) {
      failures.push(`${path.relative(root, filename)} → ${reference}: ${error.message}`);
    }
  }
  if (/\/Users\/|hermod-review-lab|\.\.\/packages\/|SDK-CLI-PHASE-/i.test(source)) {
    failures.push(`${path.relative(root, filename)} contains a private-checkout reference.`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${documents.length} Markdown files and ${links} local links; all resolve within this repository.`);
}
