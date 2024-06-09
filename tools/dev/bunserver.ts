import { extname } from 'path';
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

const server = Bun.serve({
  port: 3000, 
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = `dist/www${url.pathname}`;

    if (url.pathname.endsWith('/')) {
      filePath = `dist/www${url.pathname}index.html`;
    } else if (url.pathname === '/') {
      filePath = 'dist/www/index.html';
    }

    const fileExists = await Bun.file(filePath).exists();
    if (fileExists) {
      const ext = extname(filePath);
      let content;
      let contentType = 'text/plain';

      if (ext === '.html') {
        contentType = 'text/html';
        content = await Bun.file(filePath).text();
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
    } else {
      return new Response("Not Found", { status: 404 });
    }
  },
});

console.log(`Listening on http://localhost:${server.port}`);