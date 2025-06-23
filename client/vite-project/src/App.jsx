import React, { useState, useRef, useEffect } from "react";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000"; // Use your backend port

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function App() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [lastEditor, setLastEditor] = useState("");
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (!joined) return;
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.emit("join-room", { roomId, username });

    socketRef.current.on("room-state", (data) => {
      setCode(data.code);
      setUsers(data.users);
      setLastEditor(data.lastEditor || "");
    });

    socketRef.current.on("code-update", ({ code, sender }) => {
      setCode(code);
      setLastEditor(sender);
      if (sender && sender !== username) {
        setMessage(`Code updated by ${sender}`);
        setTimeout(() => setMessage(""), 2000);
      }
    });

    socketRef.current.on("user-joined", ({ users }) => {
      setUsers(users);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [joined, roomId, username]);

  const handleCodeInput = (e) => {
    const newCode = e.target.innerText;
    setCode(newCode);
    socketRef.current.emit("code-change", {
      roomId,
      code: newCode,
      sender: username,
    });
    setLastEditor(username);
  };

  if (!joined) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Join a Room</h2>
        <input
          placeholder="Room ID"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        />
        <input
          placeholder="Your Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <button onClick={() => setJoined(true)}>Join</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <h2>Room: {roomId}</h2>
      <div
        ref={codeRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onInput={handleCodeInput}
        style={{
          width: "100%",
          minHeight: "300px",
          fontFamily: "monospace",
          fontSize: 16,
          background: "#1e1e1e",
          color: "#d4d4d4",
          border: "1px solid #333",
          borderRadius: 4,
          padding: 12,
          marginBottom: 8,
          whiteSpace: "pre-wrap",
          outline: "none"
        }}
        dangerouslySetInnerHTML={{ __html: code.replace(/\n/g, '<br/>') }}
      />
      {message && <div style={{ color: "#4caf50", marginBottom: 8 }}>{message}</div>}
      <div style={{ marginBottom: 8 }}>
        <strong>Last edited by:</strong> {lastEditor || "-"}
      </div>
      <h3>Users:</h3>
      <ul>
        {users.map((u, i) => <li key={i}>{u.username}</li>)}
      </ul>
    </div>
  );
}

export default App
