import React from "react";

export default function Navbar({
  onRun,
  language,
  handleLanguageChange,
  copyInviteLink,
  theme,
  toggleTheme,
  roomID,
  toggleTerminal,
  showTerminal,
}) {
  return (
    <div className="navbar">
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <img
            src="/logo1.png"
            alt="SyncScript Logo"
            style={{ height: "40px", marginRight: "10px" }}
          />
          <b style={{ color: "var(--text-color)", fontSize: "1.2rem" }}>
            SyncScript
          </b>
        </a>

        {/* Language Selector */}
        <select
          value={language}
          onChange={handleLanguageChange}
          style={{
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
            padding: "2px 5px",
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>

        <button onClick={onRun} className="nav-btn run-btn">
          Run Program
        </button>

        {/* Copy Invite Button */}
        <button
          onClick={copyInviteLink}
          style={{
            background: "#0e639c",
            color: "#fff",
            border: "none",
            padding: "4px 10px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Copy Link
        </button>

        {/* --- NEW: Terminal Toggle Button --- */}
        <button
          onClick={toggleTerminal}
          style={{
            background: showTerminal ? "#444" : "#6a1b9a", // Grey when open, Purple when closed
            color: "#fff",
            border: "none",
            padding: "4px 10px",
            cursor: "pointer",
            borderRadius: "4px",
            fontWeight: "500",
            transition: "background 0.2s",
          }}
        >
          {showTerminal ? "Hide Terminal" : "Terminal"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* Room Display */}
        <div style={{ fontSize: "13px", color: "var(--text-color)" }}>
          Room:{" "}
          <span style={{ color: "#0e639c", fontWeight: "bold" }}>{roomID}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "none",
            border: `1px solid var(--border-color)`,
            color: "var(--text-color)",
            cursor: "pointer",
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          {theme === "vs-dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </div>
  );
}
