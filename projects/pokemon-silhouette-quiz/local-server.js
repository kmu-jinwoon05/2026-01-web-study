const fs = require("fs");
const path = require("path");
const http = require("http");

const pokemonHandler = require("./api/pokemon");
const messagesHandler = require("./api/messages");
const rankingsHandler = require("./api/rankings");

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;

loadEnvFile(path.join(ROOT_DIR, ".env.local"));

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/pokemon") {
      await runApiHandler(req, res, pokemonHandler);
      return;
    }

    if (url.pathname === "/api/messages") {
      await runApiHandler(req, res, messagesHandler);
      return;
    }

    if (url.pathname === "/api/rankings") {
      await runApiHandler(req, res, rankingsHandler);
      return;
    }

    await serveStaticFile(url.pathname, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, {
      message: "Local server error",
      details: error.message,
    });
  }
});

server.listen(PORT, () => {
  console.log(`Local server is running at http://localhost:${PORT}`);
});

async function runApiHandler(req, res, handler) {
  req.body = await readJsonBody(req);

  const response = createResponseAdapter(res);
  await handler(req, response);
}

function createResponseAdapter(res) {
  return {
    headersSent: false,
    status(code) {
      res.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      res.setHeader(name, value);
    },
    json(payload) {
      if (!res.statusCode) {
        res.statusCode = 200;
      }

      sendJson(res, res.statusCode, payload);
    },
  };
}

async function readJsonBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");

  try {
    return JSON.parse(rawBody);
  } catch {
    return undefined;
  }
}

async function serveStaticFile(requestPath, res) {
  let safePath = requestPath === "/" ? "/index.html" : requestPath;
  safePath = decodeURIComponent(safePath);

  const filePath = path.normalize(path.join(ROOT_DIR, safePath));

  if (!filePath.startsWith(ROOT_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      await serveStaticFile(path.join(safePath, "index.html"), res);
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
    const fileBuffer = await fs.promises.readFile(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,
    });
    res.end(fileBuffer);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(res, 404, "Not Found");
      return;
    }

    throw error;
  }
}

function sendJson(res, statusCode, payload) {
  const json = JSON.stringify(payload);

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(json);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end(text);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}
