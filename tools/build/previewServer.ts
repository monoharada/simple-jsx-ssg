const server = Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    // ルートパスの場合、index.htmlを提供
    if (path.endsWith("/")) {
      path += "index.html";
    }

    // dist/wwwからファイルを提供
    const file = Bun.file(`./dist/www${path}`);
    return new Response(file);
  },
});

console.log(`Listening on ${server.url}`);
