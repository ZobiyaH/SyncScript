const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

// This tells the server: "Use the port the host gives me, OR 1234 if I'm at home"
const port = process.env.PORT || 1234;
const wss = new WebSocket.Server({ port });

wss.on("connection", (conn, req) => {
  // This 'setupWSConnection' is the magic function.
  // It handles all the syncing, rooms, and conflict resolution for us!
  setupWSConnection(conn, req);

  console.log("Someone joined the coding session!");
});

console.log(`✅ SyncScript Server is running on port:${port}`);
