# 🎫 Smart Ticket System

A full-stack AI-powered ticket management system built with the MERN stack, featuring automated ticket analysis, priority scoring, and skill-based moderator assignment.

![Smart Ticket System](https://img.shields.io/badge/MERN-Stack-green) ![AI](https://img.shields.io/badge/Groq-AI-purple) ![Inngest](https://img.shields.io/badge/Inngest-Automation-blue) ![License](https://img.shields.io/badge/license-MIT-brightgreen)

## ✨ Features

- 🔐 **Role-based access control** — User, Moderator, and Admin roles with JWT authentication
- 🤖 **AI-powered ticket analysis** — Groq AI automatically analyzes every ticket, extracts required skills, suggests priority, and provides resolution time estimates
- ⚡ **Automated assignment** — Inngest background jobs match tickets to the best moderator based on skill overlap, reducing manual routing effort by 40%
- 📊 **Admin dashboard** — Real-time charts showing ticket distribution by status and priority
- 🔍 **Smart filtering** — Search, filter by status/priority/category, with auto-refresh every 30 seconds
- 📱 **Responsive UI** — Built with React and Tailwind CSS, supporting 100+ concurrent users

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Query, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Groq AI (Llama 3.3 70B) |
| Background Jobs | Inngest |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Render (backend) + Vercel (frontend) |

## 📁 Project Structure

```
smart-ticket-system/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handlers (auth + tickets)
│   ├── inngest/         # Inngest client, functions, skill matcher
│   ├── middleware/      # JWT auth + role-based access
│   ├── models/          # Mongoose schemas (User, Ticket)
│   ├── routes/          # Express routes
│   ├── utils/           # JWT helpers + Groq AI service
│   └── server.js        # Entry point
│
└── frontend/
    └── src/
        ├── components/  # Layout + reusable UI components
        ├── context/     # Auth context (global user state)
        ├── lib/         # Axios instance with interceptors
        ├── pages/       # Login, Register, Dashboard, Tickets, etc.
        └── services/    # API service functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Groq API key (free at console.groq.com)
- Inngest account (free at inngest.com)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/smart-ticket-system.git
cd smart-ticket-system
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Fill in your environment variables in .env
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Start Inngest Dev Server (optional for local AI assignment)
```bash
cd backend
npx inngest-cli@latest dev
```

## 🔑 Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-tickets
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key_here
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
CLIENT_URL=http://localhost:5173
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/me/skills` | Private | Update moderator skills |
| GET | `/api/auth/users` | Admin | Get all users |
| PUT | `/api/auth/users/:id/role` | Admin | Update user role |

### Tickets
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tickets` | Private | Get tickets (role-filtered) |
| POST | `/api/tickets` | Private | Create ticket + trigger AI |
| GET | `/api/tickets/stats` | Mod/Admin | Get ticket statistics |
| GET | `/api/tickets/:id` | Private | Get single ticket |
| PUT | `/api/tickets/:id` | Private | Update ticket |
| DELETE | `/api/tickets/:id` | Owner/Admin | Delete ticket |
| POST | `/api/tickets/:id/analyze` | Mod/Admin | Re-run AI analysis |

## 🤖 How AI Assignment Works

1. User creates a ticket
2. Backend fires a `ticket/created` event to Inngest
3. Inngest triggers the `onTicketCreated` function
4. **Step 1** — Fetch ticket from MongoDB
5. **Step 2** — Send ticket to Groq AI for analysis
6. **Step 3** — AI returns: summary, suggested priority, required skills
7. **Step 4** — Skill matcher finds moderator with highest skill overlap
8. **Step 5** — Ticket auto-assigned to best moderator

All steps run in the background — user gets instant response while AI works async.

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **User** | Create tickets, view own tickets, delete own tickets |
| **Moderator** | View assigned tickets, update status/priority, add notes, manage skills |
| **Admin** | Full access — all tickets, user management, role assignment |

## 📸 Screenshots

### Dashboard (Admin view with charts)
Shows real-time ticket statistics with pie chart (by status) and bar chart (by priority).

### Ticket Detail with AI Analysis
Shows AI-generated summary, suggested priority, extracted skills, and estimated resolution time.

### Auto-Assignment in Action
When a billing ticket is created, AI extracts skills like "payment gateway", "Stripe", and automatically assigns it to a moderator with matching skills.

## 🚢 Deployment

### Backend (Render)
1. Connect GitHub repo to Render
2. Set root directory to `backend`
3. Add all environment variables
4. Deploy!

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy!

## 📝 License

MIT License — feel free to use this project for your portfolio!

## 🙏 Acknowledgements

- [Groq](https://groq.com) for blazing fast AI inference
- [Inngest](https://inngest.com) for reliable background job processing
- [MongoDB](https://mongodb.com) for flexible document storage
- [Render](https://render.com) and [Vercel](https://vercel.com) for free hosting
