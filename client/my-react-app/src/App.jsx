import { useState } from 'react'
import Editor from './Editor'
import UserList from './UserList'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [roomId, setRoomId] = useState('')
  const [joined, setJoined] = useState(false)

  const handleJoin = (e) => {
    e.preventDefault()
    if (username.trim() && roomId.trim()) {
      setJoined(true)
    }
  }

  return (
    <div className="App">
      {!joined ? (
        <form className="join-form" onSubmit={handleJoin}>
          <h2>Join a Room</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            required
          />
          <button type="submit">Join Room</button>
        </form>
      ) : (
        <div className="editor-container">
          <div className="sidebar">
            <UserList roomId={roomId} username={username} />
          </div>
          <div className="main-editor">
            <Editor roomId={roomId} username={username} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
