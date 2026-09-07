# 🛡️ ComplaintOS — AI-Powered Complaint Management System

A modern, full-stack complaint management system with AI-powered categorization, SLA tracking, role-based access control, and real-time analytics.

## 🚀 Features

- **AI-Powered Categorization** — Complaints are automatically categorized and prioritized using AI
- **Role-Based Access** — Admin, Staff, and User roles with different permissions
- **SLA Tracking** — Automatic SLA monitoring with breach alerts
- **Real-Time Dashboard** — Interactive charts and analytics
- **Department Management** — Organize staff by departments
- **Notification System** — In-app notifications for status updates

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Supabase) |
| AI | OpenAI-compatible API (Groq) |
| Styling | Vanilla CSS with custom design system |
| Charts | Recharts |

## 📦 Project Structure

```
complaint-management-system/
├── client/          # React frontend
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # Auth context
│   │   ├── pages/       # Page components
│   │   └── types/       # TypeScript types
│   └── ...
├── server/          # Express backend
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, error handling
│   │   ├── routes/      # API routes
│   │   └── lib/         # Database client
│   └── ...
└── docker-compose.yml
```

## 🏃 Quick Start

### Prerequisites
- Node.js 20+
- Docker (for local development)

### Local Development

```bash
# Clone the repo
git clone https://github.com/Karthikeyan5457/complaint-management-system.git
cd complaint-management-system

# Start with Docker
docker-compose up -d

# Visit http://localhost:5173
```

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cms.com | password123 |
| Staff | it.staff@cms.com | password123 |
| User | user@cms.com | password123 |

## 📄 License

MIT
