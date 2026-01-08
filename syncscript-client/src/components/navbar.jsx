import React from "react";

export default function Navbar({
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
        <b style={{ color: "var(--text-color)" }}>🚀 SyncScript</b>

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
        </select>

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
