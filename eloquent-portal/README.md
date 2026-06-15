# Eloquent Digital Marketing — Client Portal

Full-stack client portal built with Next.js 15, Prisma 7, SQLite, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run seed   # creates your admin account
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Your admin login:**
- Email: `breona@eloquentdigitalmarketing.net`
- Password: `Eloquent2024!`

## Features

| Client Portal | Admin Dashboard |
|---|---|
| Register & login | Separate admin login |
| Profile with photo upload | View all clients |
| Business info & social links | Manage all invoices |
| View invoices | Message any client |
| 1:1 messaging with admin | View all bookings |
| Book meetings | Service request management |
| Request services | Stats overview |

## Environment

Create a `.env` file:
```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-secret-here"
```

Generate a secret: `openssl rand -base64 32`
