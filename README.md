# ArkJoy Restaurant

Full-stack restaurant management website for **menu**, **orders**, **inventory**, and **sales**.

## Setup

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

### Demo accounts

Password for all: `password123`

| Role    | Email                 |
|---------|-----------------------|
| Manager | manager@arkjoy.local  |
| Cashier | cashier@arkjoy.local  |
| Kitchen | kitchen@arkjoy.local  |

## Stack

- Next.js (App Router) + TypeScript
- Semantic HTML + CSS (custom stylesheet)
- Prisma + SQLite (local)
- NextAuth credentials (roles: manager, cashier, kitchen)

## Areas

- **POS** (`/pos`) — dine-in / takeout tickets
- **Kitchen** (`/kitchen`) — ticket queue
- **Admin** (`/admin`) — menu, inventory, sales + CSV export
