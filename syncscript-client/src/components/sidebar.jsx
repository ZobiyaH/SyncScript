// components/Sidebar.jsx
export default function Sidebar({ onlineUsers, handleFileUpload, handleDownload }) {
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

      <div className="actions-section">
        {/* Upload Button */}
        <div className="upload-wrapper">
          <label htmlFor="file-upload" className="sidebar-btn upload-label">
            Upload File
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".js,.py,.txt,.cpp,.c,.html,.css,.java"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>

        {/* Download Button */}
        <button onClick={handleDownload} className="sidebar-btn download-btn">
          Download File
        </button>
      </div>
    </div>
  );
}
