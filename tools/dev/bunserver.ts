import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import chokidar from 'chokidar';
import { WebSocket,WebSocketServer } from 'ws';

// WebSocket サーバーの設定
const wss = new WebSocketServer({ port: 8080 });

// クライアントが現在表示しているページのパスを保持するマップ
const clientPageMap = new Map<WebSocket, string>();

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // クライアントから表示中のパスが送信される想定
  ws.on('message', (message) => {
    const pagePath = message.toString();
    clientPageMap.set(ws, pagePath);
  });

  ws.on('close', () => {
    clientPageMap.delete(ws);
  });
});

// chokidar.watch の対象を 'dist/www' と 'src/components' 両方に拡張
chokidar.watch(['dist/www', 'src/components']).on('all', (event, filePath) => {
  console.log(event, filePath);

  if (filePath.startsWith('src/components')) {
    // src/components 内の変更の場合はすべてのクライアントにリロード通知を送信
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send('reload');
      }
    }
  } else {
    // dist/www の場合は表示中のページと一致するかどうかでリロード通知する
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        const clientPath = clientPageMap.get(client);
        if (clientPath) {
          // クライアントから送られるパスは先頭に "/" が付くため除去し、
          // "/" の場合は "index.html" に変換
          let normalizedPath = clientPath.replace(/^\//, '');
          if (normalizedPath === '') {
            normalizedPath = 'index.html';
          }
          // 例: filePath が "dist/www/index.html"、normalizedPath が "index.html" なら一致する
          if (filePath.endsWith(normalizedPath)) {
            client.send('reload');
          }
        }
      }
    }
  }
});

/**
 * SSI (Server Side Includes) を非同期に処理する関数
 * 正規表現の matchAll を使って一括でマッチした結果に対して、
 * 各 include を非同期に読み込み、置換して返します。
 */
async function processSSI(content: string, basePath: string) {
  const ssiRegex = /<!--#include virtual="(.+?)" -->/g;
  const matches = Array.from(content.matchAll(ssiRegex));
  if (matches.length === 0) return content;

  const replacements = await Promise.all(
    matches.map(async (match) => {
      const includePath = join(basePath, match[1]);
      return Bun.file(includePath).text();
    })
  );

  // マッチした順に置換（置換対象が重複しない前提）
  let i = 0;
  return content.replace(ssiRegex, () => replacements[i++]);
}

// 拡張子と Content-Type の対応表
const MIME_TYPES: { [key: string]: string } = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  'svg': 'image/svg+xml',
  'avif': 'image/avif',
  'webp': 'image/webp',
  'json': 'application/json',
  'csv': 'text/csv',
};

/**
 * ファイル読み込み処理の共通化
 * 画像などバイナリの拡張子の場合は arrayBuffer() で読み込み、
 * それ以外は text() で読み込みます。
 */
async function getFileContent(filePath: string, ext: string) {
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
    return await Bun.file(filePath).arrayBuffer();
  }
  return await Bun.file(filePath).text();
}

/**
 * ディレクトリ以下の HTML ファイルを再帰的に取得する関数
 */
async function getHtmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = join(dir, entry.name);
      return entry.isDirectory() ? getHtmlFiles(res) : res;
    })
  );
  return files.flat().filter((file) => file.endsWith('.html'));
}

// Bun.serve を使ったシンプルな静的ファイルサーバー
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = `dist/www${url.pathname}`;

    // ページ一覧の取得
    if (url.pathname === '/page-list') {
      const htmlFiles = await getHtmlFiles('dist/www');
      const links = htmlFiles
        .map(
          (file) =>
            `<li><a href="${file.replace('dist/www', '')}">${file.replace(
              'dist/www',
              ''
            )}</a></li>`
        )
        .join('');
      const content = `<html><body><ul>${links}</ul></body></html>`;
      return new Response(content, { headers: { 'Content-Type': 'text/html' } });
    }

    // ディレクトリの場合は index.html を参照
    if (url.pathname.endsWith('/')) {
      filePath = `dist/www${url.pathname}index.html`;
    } else if (url.pathname === '/') {
      filePath = 'dist/www/index.html';
    }

    // ファイルの存在チェック
    if (!(await Bun.file(filePath).exists())) {
      return new Response("Not Found", { status: 404 });
    }

    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';
    let content: BodyInit = await getFileContent(filePath, ext);

    // HTML ファイルの場合、SSI の処理と WebSocket 用のスクリプトを埋め込み
    if (ext === '.html') {
      content = await processSSI(content as string, 'dist/www');
      content = (content as string).replace(
        '</body>',
        `<script>
          // 接続時に現在のパス（例: "/index.html" や "/about.html"）を送信
          const ws = new WebSocket('ws://localhost:8080');
          ws.addEventListener('open', () => {
            ws.send(window.location.pathname);
          });
          ws.onmessage = (event) => {
            if (event.data === 'reload') {
              window.location.reload();
            }
          };
        </script></body>`
      );
    }

    return new Response(content, { headers: { 'Content-Type': contentType } });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
