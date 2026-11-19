// A tiny static server for app/ (Node 22, standard library only), so the
// entry can be tried locally without a build step:
//   node serve.ts            -> http://localhost:8080
//   node serve.ts --port 8123
// It sends the MIME types an offline web app needs, refuses any path
// outside app/, and otherwise does nothing clever: a development
// convenience, not a web server for the internet. The screenshot and test
// scripts run it with --port on their own ports; the app itself needs no
// server at all — opening app/index.html straight from disk works too.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname).replace(/^(\.\.[/\\])+/, '')));
  if (!file.startsWith(root + sep) && file !== root) {
    response.writeHead(403).end('forbidden');
    return;
  }
  let stat;
  try {
    stat = statSync(file);
  } catch {
    response.writeHead(404).end('not found');
    return;
  }
  if (!stat.isFile()) {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(port, () => console.log(`Vice Cover Lab at http://localhost:${port}`));
