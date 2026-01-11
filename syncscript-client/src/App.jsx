import React, { useRef, useState, useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import "xterm/css/xterm.css";
import "./App.css";

loader.config({ paths: { vs: "./node_modules/monaco-editor/min/vs" } });

const WORD_COLORS = [
  "#ba553eff",
  "#067e1cff",
  "#5262a5ff",
  "#945099ff",
  "#a10544ff",
  "#09eee2ff",
  "#f49f0dff",
];

function App() {
  const [userName, setUserName] = useState(
    localStorage.getItem("syncscript-nickname")
  );
  const [isReady, setIsReady] = useState(false);
  const [finalName, setFinalName] = useState("");

  useEffect(() => {
    if (!userName) {
      const name =
        prompt("Please enter your nickname:") ||
        `Guest-${Math.floor(Math.random() * 100)}`;
      localStorage.setItem("syncscript-nickname", name);
      setUserName(name);
    }
    const tabID = Math.floor(Math.random() * 999);
    setFinalName(`${userName || "Guest"} (#${tabID})`);
    setIsReady(true);
  }, [userName]);

  if (!isReady) return <div className="loading">Loading Session...</div>;

  return <EditorLayout displayName={finalName} />;
}

function EditorLayout({ displayName }) {
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);

  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const roomID = window.location.hash.replace("#", "") || "lobby";

  // Run Logic: Sends the current code to the backend PTY
  const handleRunCode = () => {
    if (!showTerminal) setShowTerminal(true);

    // Safety check to prevent the 'send' error
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert("Terminal is not connected. Please check your backend server.");
      return;
    }

    const code = editorRef.current.getValue();

    // 1. Connection Safety Check
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert("Terminal is not connected. Please check your backend server.");
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // 1. Clear terminal screen
      socketRef.current.send("\x0c");
    }

    // 1. Detect Environment (This assumes your backend tells the frontend or you know your host)
    // For local dev on Windows, we assume PowerShell.
    //const isWindows = /Win/.test(navigator.userAgent);

    // (if deploying to Render/Docker):
    const isWindows = false;

    // 2. Define commands for each language
    const commands = isWindows
      ? {
          // POWERSHELL SYNTAX
          javascript: `node -e "${code
            .replace(/"/g, '\\"')
            .replace(/\n/g, " ")}"`,
          python: `python -c "${code
            .replace(/"/g, '`"')
            .replace(/\n/g, "; ")}"`,
          c: `Set-Content temp.c -Value @'\n${code}\n'@; gcc temp.c -o out.exe; if ($?) { .\\out.exe }`,
          cpp: `Set-Content temp.cpp -Value @'\n${code}\n'@; g++ temp.cpp -o out.exe; if ($?) { .\\out.exe }`,
          java: `Set-Content Main.java -Value @'\n${code}\n'@; javac Main.java; if ($?) { java Main }`,
        }
      : {
          // BASH/LINUX SYNTAX
          javascript: `node -e "${code
            .replace(/"/g, '\\"')
            .replace(/\n/g, " ")}"`,
          python: `python3 -c '${code.replace(/'/g, "'\\''")}'`,
          c: `echo '${code.replace(
            /'/g,
            "'\\''"
          )}' > temp.c && gcc temp.c -o out && ./out`,
          cpp: `echo '${code.replace(
            /'/g,
            "'\\''"
          )}' > temp.cpp && g++ temp.cpp -o out && ./out`,
          java: `echo '${code.replace(
            /'/g,
            "'\\''"
          )}' > Main.java && javac Main.java && java Main`,
        };

    if (language === "html" || language === "css") {
      // For CSS, we create a basic HTML shell to see the styles in action
      const previewContent =
        language === "css"
          ? `<html><head><style>${code}</style></head><body><h1>CSS Preview</h1><p>Inspect to see styles.</p></body></html>`
          : code;

      const win = window.open();
      win.document.body.innerHTML = previewContent;
      win.document.close();
      socketRef.current.send(`echo "CSS/HTML Preview opened in new tab."\r`);
    } else {
      // FIX: Define runCmd here
      const runCmd =
        commands[language] || `echo "Run not configured for ${language}"`;

      // Clear terminal screen and run
      socketRef.current.send("\x0c"); // Ctrl+L (clear)
      socketRef.current.send(`${runCmd}\r`);
    }
  };

  // Upload Logic: Reads local file into editor
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (editorRef.current) {
        editorRef.current.setValue(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  // --- TERMINAL INITIALIZATION & WEBSOCKET ---
  useEffect(() => {
    let timeout;

    if (showTerminal && terminalRef.current) {
      // We use a small delay to ensure React has finished painting the DIV
      timeout = setTimeout(() => {
        // Only create the terminal if it doesn't exist
        if (!xtermRef.current) {
          console.log("Initializing Xterm.js...");

          const term = new Terminal({
            cursorBlink: true,
            theme: {
              background: "#1e1e1e",
              foreground: "#ffffff",
            },
            convertEol: true,
          });

          const fitAddon = new FitAddon();
          term.loadAddon(fitAddon);

          // Open the terminal in the DOM element
          term.open(terminalRef.current);

          // CRITICAL: Force the size calculation
          fitAddon.fit();

          // Test message to see if rendering works
          term.write("\x1b[1;32m[SyncScript]\x1b[0m Terminal UI Loaded...\r\n");

          const socketURL =
            import.meta.env.VITE_BACKEND_URL || "ws://localhost:1234/terminal";

          const socket = new WebSocket(socketURL);
          socketRef.current = socket;

          socket.onopen = () => {
            console.log("WebSocket connected to terminal backend");
            socket.send("\r"); // Request the shell prompt
          };

          socket.onmessage = (event) => {
            term.write(event.data);
          };

          term.onData((data) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(data);
            }
          });

          xtermRef.current = term;
        }
      }, 150); // Slightly longer delay for stability
    }

    return () => {
      clearTimeout(timeout);
      if (!showTerminal && xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      }
    };
  }, [showTerminal]);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    const doc = new Y.Doc();
    const serverUrl = import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL.replace("/terminal", "")
      : "ws://localhost:1234";

    const provider = new WebsocketProvider(serverUrl, roomID, doc);
    providerRef.current = provider;

    const awareness = provider.awareness;
    awareness.setLocalStateField("user", {
      name: displayName,
      color: WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)],
    });

    awareness.on("change", () => {
      const states = Array.from(awareness.getStates().values());
      setOnlineUsers(states.filter((s) => s.user).map((s) => s.user));
    });

    const type = doc.getText("monaco");
    new MonacoBinding(type, editor.getModel(), new Set([editor]), awareness);
  }

  const copyInviteLink = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    const url =
      roomID === "lobby"
        ? `${window.location.origin}/#${newRoomId}`
        : window.location.href;
    navigator.clipboard.writeText(url);
    if (roomID === "lobby") {
      window.location.hash = newRoomId;
      window.location.reload();
    } else {
      alert("Link Copied!");
    }
  };

  

  const handleDownload = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.getValue();
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      c: "c",
      cpp: "cpp",
      html: "html",
      css: "css",
    };
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `syncscript_${roomID}.${extensions[language] || "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  


  return (
    <div className={`app-container ${theme === "light" ? "light-theme" : ""}`}>
      <Navbar
        language={language}
        handleLanguageChange={(e) => setLanguage(e.target.value)}
        copyInviteLink={copyInviteLink}
        theme={theme}
        toggleTheme={() =>
          setTheme((p) => (p === "vs-dark" ? "light" : "vs-dark"))
        }
        roomID={roomID}
        toggleTerminal={() => setShowTerminal(!showTerminal)}
        showTerminal={showTerminal}
        onRun={handleRunCode}
      />
      <div className="main-content">
        <Sidebar
          onlineUsers={onlineUsers}
          handleFileUpload={handleFileUpload}
          downloadCode={handleDownload}
        />
        <div className="editor-terminal-container">
          <div className="editor-wrapper">
            <Editor
              height="80%"
              language={language}
              theme={theme}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 16,
                automaticLayout: true,
                minimap: { enabled: false },
                padding: { top: 10 },
              }}
            />
          </div>
          {showTerminal && (
            <div className="terminal-container">
              <div className="terminal-header">
                <span>Terminal</span>
                <button onClick={() => setShowTerminal(false)}>×</button>
              </div>
              <div
                className="terminal-body"
                ref={terminalRef}
                style={{ minHeight: "200px" }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
