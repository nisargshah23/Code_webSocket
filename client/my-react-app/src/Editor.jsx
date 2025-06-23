import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const SOCKET_URL = 'http://localhost:5000'; // Change if backend runs elsewhere

let socket;

function Editor({ roomId, username }) {
  const editorRef = useRef();
  const viewRef = useRef();
  const [userId] = useState(uuidv4());
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket = io(SOCKET_URL);
    socket.emit('join-room', { roomId, username });

    socket.on('room-state', ({ code, users }) => {
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: code || '' }
        });
      }
      setUsers(users);
    });

    socket.on('code-update', ({ code }) => {
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: code }
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (viewRef.current) return;
    viewRef.current = new EditorView({
      doc: '',
      extensions: [
        basicSetup,
        javascript(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const code = update.state.doc.toString();
            socket.emit('code-change', { roomId, code });
          }
        })
      ],
      parent: editorRef.current
    });
  }, []);

  return (
    <div>
      <div ref={editorRef} style={{ border: '1px solid #ccc', minHeight: 400 }} />
    </div>
  );
}

export default Editor; 