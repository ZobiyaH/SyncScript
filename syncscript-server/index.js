const WebSocket = require("ws");
const os = require("os");
const pty = require("node-pty");
const { setupWSConnection } = require("y-websocket/bin/utils");

const port = process.env.PORT || 1234;
const wss = new WebSocket.Server({ port });

wss.on("connection", (conn, req) => {
  // Use URL object to parse the path correctly, ignoring query strings
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;

  console.log(`New connection request for path: ${path}`);

  // 1. Handle Terminal Logic (Check if path starts with /terminal)
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

    // PTY Output -> Frontend
    ptyProcess.onData((data) => {
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(data);
      }
    });

    // Frontend Input -> PTY
    conn.on("message", (message) => {
      ptyProcess.write(message.toString());
    });

    conn.on("close", () => {
      console.log("Terminal session closed.Cleaning up...");
      // This removes temp files so your server storage doesn't fill up
      const cleanup = os.platform() === "win32"
        ? "del temp.c, temp.cpp, out.exe, Main.java, Main.class" 
        : "rm -f temp.c temp.cpp out Main.java Main.class";
      ptyProcess.write(`${cleanup}\r`);
      ptyProcess.kill();
    });

    conn.on("error", (err) => {
      console.error("Terminal Socket Error:", err);
      ptyProcess.kill();
    });
  }
  // 2. Handle Code Collaboration (Yjs)
  else {
    console.log("📝 Handling Yjs Collaboration...");
    setupWSConnection(conn, req);
  }
});

console.log(`✅ SyncScript Server running on port ${port}`);
