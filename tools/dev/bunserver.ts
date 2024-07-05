import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
});

chokidar.watch('dist/www').on('all', (event, path) => {
  console.log(event, path);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send('reload');
    }
  }
});

async function processSSI(content: string, basePath: string) {
  const ssiRegex = /<!--#include virtual="(.+?)" -->/g;
  let match: RegExpExecArray | null;
  let localContent = content
  while (true) {
    match = ssiRegex.exec(content);
    if (match === null) break;
    const includePath = join(basePath, match[1]);
    const includeContent = await Bun.file(includePath).text();
    localContent = content.replace(match[0], includeContent);
  }
  return localContent;
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = `dist/www${url.pathname}`;

    if (url.pathname === '/page-list') {
      const htmlFiles = await getHtmlFiles('dist/www');
      const links = htmlFiles.map(file => `<li><a href="${file.replace('dist/www', '')}">${file.replace('dist/www', '')}</a></li>`).join('');
      const content = `<html><body><ul>${links}</ul></body></html>`;
      return new Response(content, { headers: { 'Content-Type': 'text/html' } });
    }

    if (url.pathname.endsWith('/')) {
      filePath = `dist/www${url.pathname}index.html`;
    } else if (url.pathname === '/') {
      filePath = 'dist/www/index.html';
    }

    const fileExists = await Bun.file(filePath).exists();
    if (fileExists) {
      const ext = extname(filePath);
      let content: BodyInit;
      let contentType = 'text/plain';

      if (ext === '.html') {
        contentType = 'text/html';
        content = await Bun.file(filePath).text();
        content = await processSSI(content, 'dist/www');
        content = content.replace(
          '</body>',
          `<script>
            const ws = new WebSocket('ws://localhost:8080');
            ws.onmessage = (event) => {
              if (event.data === 'reload') {
                window.location.reload();
              }
            };
          </script></body>`
        );
      } else if (ext === '.css') {
        contentType = 'text/css';
        content = await Bun.file(filePath).text();
      } else if (ext === '.js') {
        contentType = 'application/javascript';
        content = await Bun.file(filePath).text();
      } else if (ext === '.png') {
        contentType = 'image/png';
        content = await Bun.file(filePath).arrayBuffer();
      } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
        content = await Bun.file(filePath).arrayBuffer();
      } else if (ext === '.gif') {
        contentType = 'image/gif';
        content = await Bun.file(filePath).arrayBuffer();
      } else {
        content = await Bun.file(filePath).text();
      }

      return new Response(content, { headers: { 'Content-Type': contentType } });
    }
      return new Response("Not Found", { status: 404 });
  },
});

async function getHtmlFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getHtmlFiles(res) : res;
  }));
  return Array.prototype.concat(...files).filter(file => file.endsWith('.html'));
}

console.log(`Listening on http://localhost:${server.port}`);
