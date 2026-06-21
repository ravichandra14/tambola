# 🎯 Tambola Housie — Full-Stack Multiplayer Game

A real-time, multiplayer **Tambola (Housie / Bingo)** game built with React, Node.js, Socket.IO, and MongoDB.  
Players join rooms, get auto-generated tickets, and compete live as the host calls numbers.

---

## ✨ Features

- 🔐 **Auth** — Register / Login with JWT authentication
- 🏠 **Room Management** — Create or join game rooms with a room code
- 🎟️ **Auto-Generated Tickets** — Unique Tambola tickets per player
- 📡 **Real-Time Gameplay** — Live number calling via Socket.IO
- 🏆 **Claim System** — Claim Early Five, Top Line, Middle Line, Bottom Line, Full House & more
- 📊 **Leaderboard** — Per-game winner rankings
- 📜 **Game History** — Browse past games and results
- 👤 **Player Profile** — Stats, games played, wins
- 🎉 **Confetti & Animations** — Celebrations on wins (canvas-confetti + Framer Motion)
- 📄 **PDF Export** — Download your ticket as a PDF (jsPDF)

---

## 🗂️ Project Structure

```
tambola/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── api/             # Axios API helpers
│       ├── components/
│       │   ├── common/      # Shared UI (Modal, etc.)
│       │   ├── host/        # Host-only components
│       │   └── player/      # Player-only components
│       ├── context/         # React context (Auth, Socket, etc.)
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── HostDashboard.jsx
│           ├── PlayerDashboard.jsx
│           ├── Leaderboard.jsx
│           ├── GameHistory.jsx
│           └── Profile.jsx
│
└── server/                  # Node.js + Express backend
    ├── server.js            # Entry point
    └── src/
        ├── config/          # DB & Socket.IO init
        ├── controllers/     # Route handlers
        ├── middleware/      # Auth, error handling
        ├── models/          # Mongoose models
        │   ├── User.js
        │   ├── Room.js
        │   ├── Game.js
        │   ├── Ticket.js
        │   ├── Claim.js
        │   ├── Leaderboard.js
        │   └── ChatMessage.js
        ├── routes/          # Express routers
        │   ├── auth.js
        │   ├── rooms.js
        │   ├── games.js
        │   ├── claims.js
        │   └── history.js
        ├── socket/          # Socket.IO event handlers
        └── utils/           # Helper utilities
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, React Router, Framer Motion     |
| Styling    | TailwindCSS v4, Vanilla CSS                     |
| Real-time  | Socket.IO (client + server)                     |
| Backend    | Node.js, Express, Helmet, Morgan                |
| Database   | MongoDB Atlas (Mongoose)                        |
| Auth       | JWT (jsonwebtoken)                              |
| HTTP       | Axios                                           |
| PDF        | jsPDF                                           |
| Animations | canvas-confetti, Framer Motion                  |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/ravichandra14/tambola.git
cd tambola
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tambola?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 4. Start the development servers

Open two terminals:

**Terminal 1 — Backend**
```bash
npm run dev:server
```

**Terminal 2 — Frontend**
```bash
npm run dev:client
```

The app will be available at **http://localhost:5173**.

---

## 📡 API Overview

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/auth/register`   | Register a new user      |
| POST   | `/api/auth/login`      | Login & receive JWT      |
| GET    | `/api/rooms`           | List all rooms           |
| POST   | `/api/rooms`           | Create a room            |
| POST   | `/api/rooms/:id/join`  | Join a room              |
| GET    | `/api/games/:id`       | Get game details         |
| POST   | `/api/claims`          | Submit a win claim       |
| GET    | `/api/history`         | Get user game history    |
| GET    | `/health`              | Server health check      |

---

## 🔌 Socket Events

| Event              | Direction       | Description                     |
|--------------------|-----------------|----------------------------------|
| `join_room`        | Client → Server | Join a game room                |
| `start_game`       | Host → Server   | Start the game                  |
| `call_number`      | Host → Server   | Call the next number            |
| `number_called`    | Server → Client | Broadcast called number         |
| `claim_win`        | Client → Server | Submit a claim                  |
| `claim_result`     | Server → Client | Claim validated / rejected      |
| `game_over`        | Server → Client | Game ended broadcast            |
| `chat_message`     | Both            | In-room chat                    |

---

## 📜 Available Scripts

From the **project root**:

| Command              | Description                              |
|----------------------|------------------------------------------|
| `npm run dev:server` | Start the backend in dev mode (nodemon)  |
| `npm run dev:client` | Start the frontend Vite dev server       |
| `npm run install:all`| Install dependencies for both workspaces |

From **`server/`**:

| Command       | Description              |
|---------------|--------------------------|
| `npm start`   | Start server (production)|
| `npm run dev` | Start server (nodemon)   |

From **`client/`**:

| Command          | Description               |
|------------------|---------------------------|
| `npm run dev`    | Start Vite dev server     |
| `npm run build`  | Build for production      |
| `npm run lint`   | Run ESLint                |
| `npm run preview`| Preview production build  |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to your branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

[ISC](LICENSE)
