// components/Sidebar.jsx
export default function Sidebar({ onlineUsers, downloadCode }) {
  return (
    <div className="sidebar">
      {/* Top Section: Users */}
      <div className="online-users-section">
        <div
          style={{
            fontSize: "11px",
            color: "#858585",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          ONLINE ({onlineUsers.length})
        </div>
        {onlineUsers.map((user, i) => (
          <div key={i} className="user-badge" style={{ marginBottom: "8px" }}>
            <div
              className="dot"
              style={{
                background: user.color,
                width: "8px",
                height: "8px",
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ fontSize: "14px", color: "var(--text-color)" }}>
              {user.name}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Section: Download */}
      <div className="download-section">
        <button
          onClick={downloadCode}
          style={{
            width: "100%",
            background: "#28a745",
            color: "#fff",
            border: "none",
            padding: "10px",
            cursor: "pointer",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          📥 Download File
        </button>
      </div>
    </div>
  );
}
