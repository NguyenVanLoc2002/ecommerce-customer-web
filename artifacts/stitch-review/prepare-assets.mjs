import { readFile, mkdir, writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const html = await readFile(new URL('stitch-home-original.html', root), 'utf8');
await mkdir(new URL('images/', root), { recursive: true });
const tags = [...html.matchAll(/<img\b[^>]*>/g)].map(x => x[0]);
for (let i = 0; i < tags.length; i++) {
  const url = tags[i].match(/src="([^"]*)"/)[1];
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image ${i}: ${response.status}`);
  await writeFile(new URL(`images/photo-${i}.jpg`, root), Buffer.from(await response.arrayBuffer()));
  console.log(`Saved photo-${i}.jpg`);
}
