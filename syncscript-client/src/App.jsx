import React, { useRef, useState, useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
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
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const roomID = window.location.hash.replace("#", "") || "lobby";

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    const doc = new Y.Doc();

    // DEPLOYMENT TIP: In production, change 'localhost' to your server URL
    const serverUrl =
      window.location.hostname === "localhost"
        ? "ws://localhost:1234"
        : "wss://your-yjs-server.herokuapp.com"; // Replace this when you have a server

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

  const downloadCode = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.getValue();
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      c: "c",
      cpp: "cpp",
      html: "html",
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
          setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"))
        }
        roomID={roomID}
      />
      <div className="main-content">
        <Sidebar onlineUsers={onlineUsers} downloadCode={downloadCode} />
        <div style={{ flex: 1, position: "relative" }}>
          <Editor
            height="100%"
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
      </div>
    </div>
  );
}

export default App;
