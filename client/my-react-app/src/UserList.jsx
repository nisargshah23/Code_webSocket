import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
let socket;

function UserList({ roomId, username }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket = io(SOCKET_URL);
    socket.emit('join-room', { roomId, username });

    socket.on('user-joined', ({ users }) => {
      setUsers(users);
    });
    socket.on('user-left', ({ users }) => {
      setUsers(users);
    });
    socket.on('room-state', ({ users }) => {
      setUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username]);

  return (
    <div className="user-list">
      <h3>Users in Room</h3>
      <ul>
        {users.map((user, idx) => (
          <li key={idx}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList; 