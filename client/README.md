# Tambola — Client (React + Vite)

This is the frontend for the **Tambola Housie** multiplayer game.  
Built with **React 19**, **Vite**, **TailwindCSS v4**, **Socket.IO client**, and **Framer Motion**.

## Getting Started

```bash
# From the project root
npm run dev:client

# Or from this directory
npm run dev
```

The dev server runs at **http://localhost:5173**.

## Pages

| Page               | Route            | Description                          |
|--------------------|------------------|--------------------------------------|
| `Home`             | `/`              | Landing / lobby                      |
| `Login`            | `/login`         | User login                           |
| `Register`         | `/register`      | User registration                    |
| `HostDashboard`    | `/host/:roomId`  | Host controls — call numbers, manage |
| `PlayerDashboard`  | `/play/:roomId`  | Player ticket & live gameplay        |
| `Leaderboard`      | `/leaderboard`   | Game winners                         |
| `GameHistory`      | `/history`       | Past games                           |
| `Profile`          | `/profile`       | User stats & profile                 |

## Scripts

| Command          | Description               |
|------------------|---------------------------|
| `npm run dev`    | Start Vite dev server     |
| `npm run build`  | Build for production      |
| `npm run lint`   | Run ESLint                |
| `npm run preview`| Preview production build  |

## Key Dependencies

- `react` + `react-dom` — UI framework
- `react-router-dom` — Routing
- `socket.io-client` — Real-time communication
- `axios` — HTTP requests
- `framer-motion` — Animations
- `canvas-confetti` — Win celebrations
- `jspdf` — Ticket PDF export
- `react-hot-toast` — Notifications
- `react-icons` — Icon library
- `tailwindcss` v4 — Utility-first styling

> For full project documentation, see the [root README](../README.md).
