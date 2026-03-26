# TO-DO-LIST-CX
to do application

# PERN Multi-Tenant Todo

Three separate apps — one API server, two React frontends.

```
pern-todo/
├── server/                        # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma schema (Client + Todo models)
│   │   └── seed.js                # Seed demo clients
│   ├── src/
│   │   ├── index.js               # Express entry point
│   │   ├── prisma.js              # Prisma client singleton
│   │   ├── middleware.js          # resolveClient + adminOnly
│   │   └── routes/
│   │       ├── todos.js           # Client-scoped todo routes
│   │       └── admin.js           # Admin routes (token-protected)
│   ├── package.json
│   └── .env.example
│
├── client-app/                    # React app → cx.yourdomain.com
│   ├── src/
│   │   ├── api/todos.js           # API calls + subdomain detection
│   │   ├── hooks/useTodos.js      # State + CRUD hook
│   │   ├── components/
│   │   │   ├── AddTodo.jsx / .module.css
│   │   │   ├── TodoItem.jsx / .module.css
│   │   │   ├── StatsBar.jsx / .module.css
│   │   │   └── FilterBar.jsx / .module.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── admin-dashboard/               # React app → admin.yourdomain.com
    ├── src/
    │   ├── api/admin.js           # Admin API calls + token management
    │   ├── hooks/useAdminData.js  # Stats + todos hook
    │   ├── components/
    │   │   ├── LoginGate.jsx / .module.css
    │   │   ├── Sidebar.jsx / .module.css
    │   │   ├── OverviewCards.jsx / .module.css
    │   │   ├── ClientTabs.jsx / .module.css
    │   │   ├── TodoTable.jsx / .module.css
    │   │   └── AddClientModal.jsx / .module.css
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Quick Start

### 1. Server

```bash
cd server
cp .env.example .env
# Fill in DATABASE_URL and ADMIN_TOKEN

npm install
npx prisma migrate dev --name init   # creates tables
npm run db:seed                       # seeds demo clients
npm run dev                           # starts on :4000
```

### 2. Client App (dev)

```bash
cd client-app
npm install
npm run dev
# Visit: http://localhost:5173?subdomain=cx
```

### 3. Admin Dashboard (dev)

```bash
cd admin-dashboard
npm install
npm run dev
# Visit: http://localhost:5174
# Login with the ADMIN_TOKEN from server/.env
```

---

## Architecture

```
cx.yourdomain.com      ──┐
globex.yourdomain.com    ──┤──► api.yourdomain.com (Express + Prisma)
                            │              │
admin.yourdomain.com    ───┘          PostgreSQL
```

- Client apps send X-Subdomain: cx header — API scopes all queries to that client
- Admin dashboard sends X-Admin-Token header — sees all clients and todos
- Same client-app build is deployed to every subdomain (subdomain auto-detected from hostname)

---

## API Reference

### Client routes — require X-Subdomain header

| Method | Path         | Description        |
|--------|--------------|--------------------|
| GET    | /todos       | List client todos  |
| POST   | /todos       | Create a todo      |
| PATCH  | /todos/:id   | Toggle done        |
| DELETE | /todos/:id   | Delete a todo      |

### Admin routes — require X-Admin-Token header

| Method | Path                   | Description              |
|--------|------------------------|--------------------------|
| GET    | /admin/stats           | Per-client summary stats |
| GET    | /admin/clients         | List all clients         |
| POST   | /admin/clients         | Register new client      |
| GET    | /admin/todos           | All todos, all clients   |
| GET    | /admin/todos/:clientId | Todos for one client     |

---

## Adding a New Client

Via admin dashboard: click "+ New Client", enter name and subdomain.

Via cURL:
```bash
curl -X POST https://api.yourdomain.com/admin/clients \
  -H "X-Admin-Token: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Corp","subdomain":"newcorp"}'
```

Then point newcorp.yourdomain.com DNS at your static host. Done.

---

## Deployment

| App             | Deploy to              | Env vars needed                 |
|-----------------|------------------------|---------------------------------|
| server          | Railway / Render / VPS | DATABASE_URL, ADMIN_TOKEN, PORT |
| client-app      | Vercel / Netlify / S3  | VITE_API_URL                    |
| admin-dashboard | Vercel / Netlify / S3  | VITE_API_URL                    |
