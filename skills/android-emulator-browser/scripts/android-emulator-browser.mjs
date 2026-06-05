#!/usr/bin/env node
import { access, constants } from "node:fs/promises";
import { createServer } from "node:http";
import { basename, delimiter, join } from "node:path";
import { env, exit, platform } from "node:process";
import { execFile } from "node:child_process";

const DEFAULT_PORT = 3277;
const DEFAULT_REFRESH_MS = 350;
const MAX_BODY_BYTES = 64 * 1024;

main().catch((error) => {
  console.error(`android-emulator-browser: ${error.message}`);
  exit(1);
});

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const adbPath = options.adb ?? await findAdb();
  const serial = options.serial ?? await inferSingleDevice(adbPath);
  const refreshMs = Math.max(150, Number(options.refreshMs ?? DEFAULT_REFRESH_MS));

  await assertDevice(adbPath, serial);

  const server = createServer((request, response) => {
    handleRequest({ request, response, adbPath, serial, refreshMs }).catch((error) => {
      const status = error.statusCode ?? 500;
      sendJson(response, status, { error: error.message });
    });
  });

  server.listen(options.port ?? DEFAULT_PORT, "127.0.0.1", () => {
    const address = server.address();
    const previewUrl = `http://127.0.0.1:${address.port}/`;
    console.log(`android-emulator-browser ready for ${serial}`);
    console.log(`Preview at ${previewUrl}`);
    console.log(`Open this exact URL in the visible Codex side-panel browser: ${previewUrl}`);
  });

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => {
      server.close(() => exit(0));
    });
  }
}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      exit(0);
    } else if (arg === "--serial" || arg === "-s") {
      options.serial = readValue(argv, ++index, arg);
    } else if (arg === "--adb") {
      options.adb = readValue(argv, ++index, arg);
    } else if (arg === "--port" || arg === "-p") {
      options.port = Number(readValue(argv, ++index, arg));
      if (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535) {
        throw new Error("--port must be an integer between 1 and 65535.");
      }
    } else if (arg === "--refresh-ms") {
      options.refreshMs = Number(readValue(argv, ++index, arg));
      if (!Number.isFinite(options.refreshMs)) {
        throw new Error("--refresh-ms must be a number.");
      }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function readValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`Pass a value after ${flag}.`);
  }
  return value;
}

function printHelp() {
  console.log(`android-emulator-browser

Mirror a booted Android emulator or connected adb device in the visible Codex side-panel browser.

Usage:
  android-emulator-browser --serial <adb-serial> [--port 3277]

Options:
  --serial, -s     adb serial to mirror. Required when more than one device is attached.
  --adb            Path to adb. Defaults to PATH, ANDROID_SDK_ROOT, ANDROID_HOME, or ~/Library/Android/sdk.
  --port, -p       Localhost port. Defaults to ${DEFAULT_PORT}.
  --refresh-ms     Frame refresh interval. Defaults to ${DEFAULT_REFRESH_MS}.
`);
}

async function handleRequest(context) {
  const { request, response } = context;
  const url = new URL(request.url ?? "/", "http://127.0.0.1");

  if (request.method === "GET" && url.pathname === "/") {
    sendHtml(response, renderPage(context));
  } else if (request.method === "GET" && url.pathname === "/frame") {
    await sendFrame(context);
  } else if (request.method === "GET" && url.pathname === "/status") {
    await sendStatus(context);
  } else if (request.method === "POST" && url.pathname === "/tap") {
    await tap(context, await readJsonBody(request));
  } else if (request.method === "POST" && url.pathname === "/swipe") {
    await swipe(context, await readJsonBody(request));
  } else if (request.method === "POST" && url.pathname === "/key") {
    await key(context, await readJsonBody(request));
  } else if (request.method === "POST" && url.pathname === "/text") {
    await text(context, await readJsonBody(request));
  } else {
    sendJson(response, 404, { error: "Not found" });
  }
}

function renderPage({ serial, refreshMs }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Android Emulator Browser</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #15171a;
      color: #f2f5f7;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(280px, 1fr) 300px;
      gap: 24px;
      padding: 24px;
      align-items: center;
    }
    main {
      min-width: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .frame {
      width: min(100%, 460px);
      aspect-ratio: 9 / 19.5;
      background: #050607;
      border: 10px solid #050607;
      border-radius: 28px;
      box-shadow: 0 22px 50px rgb(0 0 0 / 0.38);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
      user-select: none;
      -webkit-user-drag: none;
      cursor: crosshair;
    }
    aside {
      align-self: stretch;
      max-height: calc(100vh - 48px);
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    h1 {
      font-size: 20px;
      line-height: 1.2;
      margin: 0;
      font-weight: 650;
    }
    .meta {
      color: #b8c0c8;
      font-size: 13px;
      overflow-wrap: anywhere;
    }
    .controls {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    button, input {
      border: 1px solid #3a4149;
      background: #23282f;
      color: #f2f5f7;
      border-radius: 6px;
      min-height: 36px;
      padding: 8px 10px;
      font: inherit;
    }
    button {
      cursor: pointer;
      font-weight: 560;
    }
    button:hover { background: #2d333b; }
    input {
      width: 100%;
      grid-column: 1 / -1;
    }
    .status {
      min-height: 42px;
      color: #cdd4dc;
      font-size: 13px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    @media (max-width: 760px) {
      body {
        grid-template-columns: 1fr;
        padding: 14px;
      }
      aside {
        max-height: none;
      }
      .frame {
        width: min(100%, 390px);
      }
    }
  </style>
</head>
<body>
  <main>
    <div class="frame" id="frame">
      <img id="screen" alt="Android emulator screen">
    </div>
  </main>
  <aside>
    <div>
      <h1>Android Emulator</h1>
      <div class="meta">adb serial: ${escapeHtml(serial)}</div>
    </div>
    <div class="controls">
      <button data-key="KEYCODE_BACK">Back</button>
      <button data-key="KEYCODE_HOME">Home</button>
      <button data-key="KEYCODE_ENTER">Enter</button>
      <button id="refresh">Refresh</button>
      <button id="wake">Wake</button>
      <button id="rotate">Rotate</button>
      <input id="text" placeholder="Text to type">
      <button id="sendText">Type Text</button>
    </div>
    <div class="status" id="status">Connecting...</div>
  </aside>
  <script>
    const refreshMs = ${JSON.stringify(refreshMs)};
    const screen = document.getElementById("screen");
    const statusEl = document.getElementById("status");
    let frameTimer = null;

    function setStatus(message) {
      statusEl.textContent = message;
    }

    function refreshFrame() {
      screen.src = "/frame?ts=" + Date.now();
    }

    async function post(path, body) {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || response.statusText);
      return payload;
    }

    screen.addEventListener("load", () => {
      setStatus("Frame " + screen.naturalWidth + "x" + screen.naturalHeight + " at " + new Date().toLocaleTimeString());
      clearTimeout(frameTimer);
      frameTimer = setTimeout(refreshFrame, refreshMs);
    });

    screen.addEventListener("error", () => {
      setStatus("Frame capture failed. Check adb serial and app/emulator state.");
      clearTimeout(frameTimer);
      frameTimer = setTimeout(refreshFrame, Math.max(refreshMs, 1000));
    });

    screen.addEventListener("click", async (event) => {
      const rect = screen.getBoundingClientRect();
      const objectRatio = Math.min(rect.width / screen.naturalWidth, rect.height / screen.naturalHeight);
      const renderedWidth = screen.naturalWidth * objectRatio;
      const renderedHeight = screen.naturalHeight * objectRatio;
      const xOffset = (rect.width - renderedWidth) / 2;
      const yOffset = (rect.height - renderedHeight) / 2;
      const x = Math.round((event.clientX - rect.left - xOffset) / objectRatio);
      const y = Math.round((event.clientY - rect.top - yOffset) / objectRatio);
      if (x < 0 || y < 0 || x > screen.naturalWidth || y > screen.naturalHeight) return;
      try {
        await post("/tap", { x, y });
        setStatus("Tapped " + x + ", " + y);
        setTimeout(refreshFrame, 120);
      } catch (error) {
        setStatus(error.message);
      }
    });

    screen.addEventListener("wheel", async (event) => {
      event.preventDefault();
      if (!screen.naturalWidth || !screen.naturalHeight) return;
      const x = Math.round(screen.naturalWidth / 2);
      const startY = Math.round(screen.naturalHeight * 0.55);
      const endY = Math.round(screen.naturalHeight * (event.deltaY > 0 ? 0.25 : 0.75));
      try {
        await post("/swipe", { x1: x, y1: startY, x2: x, y2: endY, duration: 220 });
        setTimeout(refreshFrame, 180);
      } catch (error) {
        setStatus(error.message);
      }
    }, { passive: false });

    for (const button of document.querySelectorAll("[data-key]")) {
      button.addEventListener("click", async () => {
        try {
          await post("/key", { key: button.dataset.key });
          setTimeout(refreshFrame, 120);
        } catch (error) {
          setStatus(error.message);
        }
      });
    }

    document.getElementById("refresh").addEventListener("click", refreshFrame);
    document.getElementById("wake").addEventListener("click", () => post("/key", { key: "KEYCODE_WAKEUP" }).then(refreshFrame).catch((error) => setStatus(error.message)));
    document.getElementById("rotate").addEventListener("click", () => post("/key", { key: "KEYCODE_ROTATE_SCREEN" }).then(() => setTimeout(refreshFrame, 300)).catch((error) => setStatus(error.message)));
    document.getElementById("sendText").addEventListener("click", async () => {
      const input = document.getElementById("text");
      try {
        await post("/text", { text: input.value });
        input.value = "";
        setTimeout(refreshFrame, 120);
      } catch (error) {
        setStatus(error.message);
      }
    });

    fetch("/status")
      .then((response) => response.json())
      .then((payload) => setStatus(payload.message))
      .catch((error) => setStatus(error.message))
      .finally(refreshFrame);
  </script>
</body>
</html>`;
}

async function sendFrame({ response, adbPath, serial }) {
  const { stdout } = await runAdb(adbPath, ["-s", serial, "exec-out", "screencap", "-p"], {
    encoding: "buffer",
    timeoutMs: 8000,
  });

  if (!isPng(stdout)) {
    throw httpError(502, "adb screencap did not return a PNG frame.");
  }

  response.writeHead(200, {
    "Content-Type": "image/png",
    "Cache-Control": "no-store",
    "Content-Length": stdout.length,
  });
  response.end(stdout);
}

async function sendStatus({ response, adbPath, serial }) {
  const { stdout } = await runAdb(adbPath, ["-s", serial, "shell", "wm", "size"], {
    encoding: "utf8",
    timeoutMs: 3000,
  });
  sendJson(response, 200, {
    serial,
    message: `Connected to ${serial}\n${stdout.trim()}`,
  });
}

async function tap({ response, adbPath, serial }, body) {
  const x = readCoordinate(body.x, "x");
  const y = readCoordinate(body.y, "y");
  await runAdb(adbPath, ["-s", serial, "shell", "input", "tap", String(x), String(y)]);
  sendJson(response, 200, { ok: true });
}

async function swipe({ response, adbPath, serial }, body) {
  const x1 = readCoordinate(body.x1, "x1");
  const y1 = readCoordinate(body.y1, "y1");
  const x2 = readCoordinate(body.x2, "x2");
  const y2 = readCoordinate(body.y2, "y2");
  const duration = Math.max(1, Math.min(2000, readCoordinate(body.duration ?? 250, "duration")));
  await runAdb(adbPath, [
    "-s", serial,
    "shell", "input", "swipe",
    String(x1), String(y1), String(x2), String(y2), String(duration),
  ]);
  sendJson(response, 200, { ok: true });
}

async function key({ response, adbPath, serial }, body) {
  const keyName = String(body.key ?? "");
  if (!/^KEYCODE_[A-Z0-9_]+$/.test(keyName)) {
    throw httpError(400, "key must be an Android KEYCODE_* value.");
  }
  await runAdb(adbPath, ["-s", serial, "shell", "input", "keyevent", keyName]);
  sendJson(response, 200, { ok: true });
}

async function text({ response, adbPath, serial }, body) {
  const value = String(body.text ?? "");
  if (value.length > 512) {
    throw httpError(400, "text is limited to 512 characters.");
  }
  if (value.length > 0) {
    await runAdb(adbPath, ["-s", serial, "shell", "input", "text", encodeInputText(value)]);
  }
  sendJson(response, 200, { ok: true });
}

function readCoordinate(value, name) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw httpError(400, `${name} must be a non-negative integer.`);
  }
  return number;
}

function encodeInputText(value) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(" ", "%s")
    .replaceAll('"', '\\"')
    .replaceAll("'", "\\'");
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw httpError(413, "Request body is too large.");
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw httpError(400, "Request body must be JSON.");
  }
}

async function findAdb() {
  const candidates = [
    env.ADB,
    env.ANDROID_SDK_ROOT && join(env.ANDROID_SDK_ROOT, "platform-tools", adbBinaryName()),
    env.ANDROID_HOME && join(env.ANDROID_HOME, "platform-tools", adbBinaryName()),
    join(env.HOME ?? "", "Library", "Android", "sdk", "platform-tools", adbBinaryName()),
    ...pathCandidates("adb"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Continue checking likely SDK and PATH locations.
    }
  }

  throw new Error("adb was not found. Install Android platform-tools or pass --adb /path/to/adb.");
}

function pathCandidates(binary) {
  const binaryName = platform === "win32" ? `${binary}.exe` : binary;
  return (env.PATH ?? "")
    .split(delimiter)
    .filter(Boolean)
    .map((pathEntry) => join(pathEntry, binaryName));
}

function adbBinaryName() {
  return platform === "win32" ? "adb.exe" : "adb";
}

async function inferSingleDevice(adbPath) {
  const { stdout } = await runAdb(adbPath, ["devices", "-l"], { encoding: "utf8" });
  const devices = parseDeviceList(stdout);

  if (devices.length === 0) {
    throw new Error("No adb devices are attached. Pass --serial after booting an emulator or connecting a device.");
  }

  if (devices.length > 1) {
    throw new Error(`Multiple adb devices are attached: ${devices.join(", ")}. Pass --serial explicitly.`);
  }

  return devices[0];
}

async function assertDevice(adbPath, serial) {
  const { stdout } = await runAdb(adbPath, ["devices", "-l"], { encoding: "utf8" });
  const devices = parseDeviceList(stdout);
  if (!devices.includes(serial)) {
    throw new Error(`${serial} is not an attached adb device. Current devices: ${devices.join(", ") || "none"}.`);
  }
}

function parseDeviceList(output) {
  return output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /\bdevice\b/.test(line))
    .map((line) => line.split(/\s+/)[0]);
}

function runAdb(adbPath, args, options = {}) {
  const timeoutMs = options.timeoutMs ?? 10000;
  const encoding = options.encoding ?? "utf8";

  return new Promise((resolve, reject) => {
    const child = execFile(adbPath, args, {
      encoding: encoding === "buffer" ? "buffer" : "utf8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: timeoutMs,
    }, (error, stdout, stderr) => {
      if (error) {
        const command = `${basename(adbPath)} ${args.join(" ")}`;
        const detail = Buffer.isBuffer(stderr) ? stderr.toString("utf8") : stderr;
        reject(new Error(`${command} failed: ${detail || error.message}`));
      } else {
        resolve({ stdout, stderr });
      }
    });

    child.on("error", reject);
  });
}

function isPng(buffer) {
  return Buffer.isBuffer(buffer)
    && buffer.length > 8
    && buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4e
    && buffer[3] === 0x47
    && buffer[4] === 0x0d
    && buffer[5] === 0x0a
    && buffer[6] === 0x1a
    && buffer[7] === 0x0a;
}

function sendHtml(response, html) {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(html);
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
