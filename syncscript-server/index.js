const express = require("express"); // 1. Import Express
const http = require("http"); // 2. Import HTTP
const WebSocket = require("ws");
const os = require("os");
const pty = require("node-pty");
const { setupWSConnection } = require("y-websocket/bin/utils");

const app = express(); // 3. Initialize Express
const port = process.env.PORT || 1234;

// 4. Add the Health Check route HERE
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

// 5. Create a combined server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // Use 'server' instead of 'port'

// --- Keep your existing logic below ---
wss.on("connection", (conn, req) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;

  console.log(`New connection request for path: ${path}`);

  if (path.startsWith("/terminal")) {
    console.log("🚀 Starting Terminal PTY Session...");
    const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
    const ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env,
    });

    ptyProcess.onData((data) => {
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(data);
      }
    });

    conn.on("message", (message) => {
      ptyProcess.write(message.toString());
    });

    conn.on("close", () => {
      console.log("Terminal session closed. Cleaning up...");
      const cleanup =
        os.platform() === "win32"
          ? "del temp.c, temp.cpp, out.exe, Main.java, Main.class"
          : "rm -f temp.c temp.cpp out Main.java Main.class";
      ptyProcess.write(`${cleanup}\r`);
      ptyProcess.kill();
    });
  } else {
    console.log("📝 Handling Yjs Collaboration...");
    setupWSConnection(conn, req);
  }
});

// 6. Start the combined server
server.listen(port, () => {
  console.log(`✅ SyncScript Server running on port ${port}`);
});

// 7. Add the Self-Ping logic at the very bottom
setInterval(() => {
  // Use https if deployed on Render
  const url = `https://syncscript-backend-ef8g.onrender.com/health`;
  http
    .get(url, (res) => {
      console.log(`Self-ping: Status ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error("Self-ping error:", err.message);
    });
}, 14 * 60 * 1000); // 14 minutes
