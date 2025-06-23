# Real-time Collaborative Code Editor

A real-time collaborative code editor built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.IO. Users can collaborate in real-time, share code, and see each other's cursor positions.

## Features

- Room-based collaboration
- Real-time code synchronization
- Cursor presence tracking
- Live user list
- Instant code sync on join
- Multiple file support (tabs)
- Chat functionality
- Auto-save feature

## Tech Stack

- **Frontend:**
  - React.js
  - Socket.IO Client
  - CodeMirror 6
  - Material-UI
  - React Router

- **Backend:**
  - Node.js
  - Express.js
  - Socket.IO
  - MongoDB
  - Mongoose

## Project Structure

```
.
├── client/               # Frontend React application
└── server/              # Backend Node.js application
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/code_editor
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

## License

MIT
