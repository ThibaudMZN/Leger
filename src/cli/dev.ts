import * as http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import { parse } from "../parser/parser";
import { render } from "../renderer/renderer";
import { TEMPLATE } from "./htmlUtils";
import { fileURLToPath } from "node:url";

export type DevOptions = {
  paths: {
    input: string;
  };
};

export type DevResult = {
  close: () => Promise<void>;
};

const defaultOptions: DevOptions = {
  paths: {
    input: "pages",
  },
};

const injectClientScript = (html: string): string => {
  const script = `
      <script>
        const evtSource = new EventSource('/sse');
        evtSource.addEventListener('reload', (event) => {
          evtSource.close();
          location.reload();
        });
      </script>
  `;
  return html.replace("</head>", script + "</head>");
};

export const dev = async (
  options: DevOptions = defaultOptions,
): Promise<DevResult> => {
  const PORT = 7363;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const clients = new Set<http.ServerResponse>();

  const script = path.join(__dirname, "../components/components.iife.js");
  const webComponentScript = await fs.readFile(script, "utf-8");
  const styles = path.join(__dirname, "../components/style.css");
  const stylesScript = await fs.readFile(styles, "utf-8");

  const broadcastReload = () => {
    for (const client of clients) {
      client.write(`event: reload\ndata: now\n\n`);
    }
  };

  const watcherAbortController = new AbortController();
  const watchDir = (dir: string) => {
    (async () => {
      try {
        const watcher = fs.watch(dir, {
          recursive: true,
          signal: watcherAbortController.signal,
        });
        for await (const event of watcher) {
          if (event.eventType === "change") {
            broadcastReload();
          }
        }
      } catch (err) {
        throw err;
      }
    })();
  };

  const server = http.createServer(async (req, res) => {
    const { url, headers, method } = req;

    if (!url) return;

    if (url === "/scripts/components.iife.js") {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(webComponentScript);
      return;
    }

    if (url === "/styles/style.css") {
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(stylesScript);
      return;
    }

    if (url === "/sse") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write("\n");

      clients.add(res);
      req.on("close", () => {
        clients.delete(res);
      });
      return;
    }

    const filePath = path.join(
      options.paths.input,
      url === "/" ? "/index.html" : url,
    );
    const ext = path.extname(filePath);
    const contentType =
      {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
      }[ext] || "application/octet-stream";

    try {
      const content = await fs.readFile(
        filePath.replace(".html", ".leg"),
        "utf-8",
      );
      const ast = parse(content);
      const html = render(ast);

      const htmlContent = TEMPLATE(html.content);
      const withClient = injectClientScript(htmlContent);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(withClient);
    } catch (e) {
      res.writeHead(404);
      return res.end("Not found");
    }
  });

  server.listen(PORT, () => {
    console.log(
      `\x1b[32m✓ Dev server running at http://localhost:${PORT}\x1b[0m`,
    );
    watchDir(options.paths.input);
  });

  const close = (): Promise<void> => {
    return new Promise((resolve) => {
      console.log("\n\x1b[33m⏹ Shutting down...\x1b[0m");

      watcherAbortController.abort();

      for (const client of clients) {
        client.end?.();
      }

      server.close(() => resolve());
    });
  };

  process.on("SIGINT", async () => {
    setTimeout(() => process.exit(1), 2000);
    await close();
    process.exit(0);
  });

  return { close };
};
