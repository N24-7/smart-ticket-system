# 🎫 Smart Ticket System — MERN + Gemini AI + Inngest

An AI-powered ticket management system with role-based access control, automated skill-based assignment, and real-time updates.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| AI | Google Gemini AI |
| Background Jobs | Inngest |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
smart-ticket-system/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Route handlers (Phase 2 & 3)
│   ├── middleware/             # Auth & error middleware (Phase 2)
│   ├── models/                 # Mongoose schemas (Phase 2 & 3)
│   ├── routes/                 # Express routes (Phase 2 & 3)
│   ├── inngest/                # Inngest functions (Phase 5)
│   ├── utils/                  # Helpers & Gemini AI (Phase 4)
│   ├── server.js               # Entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/         # Reusable UI components (Phase 6)
    │   ├── pages/              # Route-level pages (Phase 6)
    │   ├── context/            # Auth context (Phase 6)
    │   ├── hooks/              # Custom hooks (Phase 6)
    │   ├── services/           # API service functions (Phase 6)
    │   ├── lib/
    │   │   └── axios.js        # Configured axios client
    │   ├── App.jsx             # Root component + routes
    │   ├── main.jsx            # React entry point
    │   └── index.css           # Tailwind base styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Quick Start

### 1. Clone and setup backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 2. Setup frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Start Inngest dev server (Phase 5)
```bash
cd backend
npm run inngest-dev
```

## Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `INNGEST_EVENT_KEY` | Inngest event key |
| `INNGEST_SIGNING_KEY` | Inngest signing key |

## Build Phases

- [x] **Phase 1** — Project setup & environment
- [ ] **Phase 2** — Auth & user management (JWT + roles)
- [ ] **Phase 3** — Ticket CRUD & data models
- [ ] **Phase 4** — Gemini AI integration
- [ ] **Phase 5** — Inngest automated assignment
- [ ] **Phase 6** — React + Tailwind frontend
- [ ] **Phase 7** — Real-time updates & deployment
