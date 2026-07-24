# 🍽️ SmartServe AI — Intelligent Restaurant Management System

> **A complete AI-powered Restaurant ERP & POS solution** for modern restaurants. Real-time Kitchen Display, AI-driven insights, complete inventory & staff management — all in one platform.

![SmartServe AI Banner](https://img.shields.io/badge/SmartServe-AI%20Powered-blue?style=for-the-badge&logo=openai)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-22-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-brightgreen?style=for-the-badge&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-grey?style=for-the-badge&logo=socket.io)

---

## 📋 Table of Contents

- [Features Overview](#-features-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Payment Integration (Razorpay)](#-payment-integration-razorpay)
- [AI Integration (Gemini)](#-ai-integration-gemini)
- [Socket.IO Events](#-socketio-events)
- [Default Credentials](#-default-credentials)
- [Modules](#-modules)

---

## ✨ Features Overview

| Module | Phase | Description |
|---|---|---|
| 🔐 **Auth** | Phase 1 | JWT + HTTP-only cookie auth, RBAC with 9 roles |
| 🧾 **POS System** | Phase 10 | Point-of-sale with cart, coupons, tip, GST calc, Razorpay toggle |
| 👨‍🍳 **Kitchen Display (KDS)** | Phase 9 | Real-time order display via Socket.IO |
| 📦 **Orders** | Phase 8 | Full lifecycle: Pending → Preparing → Ready → Delivered |
| 🍽️ **Menu Management** | Phase 5 | Categories & items CRUD with image & pricing |
| 🏪 **Inventory** | Phase 6 | Stock tracking, low-stock alerts, restock |
| 👥 **Employees** | Phase 3 | Staff CRUD, shift management |
| ⏰ **Attendance** | Phase 3 | Daily attendance marking, check-in/out, leave tracking |
| 💰 **Payroll** | Phase 3 | Monthly payroll processing, salary records, payment status |
| 🤝 **Customers** | Phase 4 | CRM, loyalty points, membership tiers |
| 🎁 **Loyalty Program** | Phase 4 | Points management, tier upgrades, transaction history |
| 🪑 **Tables** | Phase 2 | Floor plan view, live status (Available/Occupied/Reserved) |
| 📅 **Reservations** | Phase 12 | Booking management with full status workflow |
| 🚚 **Suppliers** | Phase 7 | Vendor management & purchase orders |
| 📋 **Purchase Orders** | Phase 7 | PO creation, line items, delivery + payment tracking |
| 🏢 **Branches** | Phase 2 | Multi-branch CRUD, active/inactive toggle |
| 📊 **Reports** | Phase 18 | Sales, inventory, employee & customer reports |
| 💹 **Financial Dashboard** | Phase 14 | Revenue, expenses, profit charts with GST summary |
| 📈 **Analytics Dashboard** | Phase 15 | Peak hours, top items, customer tiers, weekly comparison |
| ⭐ **Reviews** | Phase 13 | Customer feedback with sentiment & reply system |
| 🎟️ **Promotions** | Phase 11 | Coupon codes with usage tracking |
| 🔔 **Notifications** | Phase 17 | Notification center with priority, type filters, auto-refresh |
| 🤖 **AI Assistant** | Phase 19 | Chat with your restaurant data via Gemini AI |
| ⚙️ **Settings** | Phase 2 | Restaurant profile, POS config, Razorpay ON/OFF toggle |

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit + Redux Persist
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.IO Client
- **HTTP**: Axios with JWT interceptors
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js 22 (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access token in cookie + localStorage)
- **Real-time**: Socket.IO
- **AI**: Google Gemini API (with mock fallback)
- **Payment**: Razorpay (toggle on/off via env flag)

---

## 📁 Project Structure

```
Intelligent-Restaurant-Management-System/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── razorpay.js           # Razorpay toggle config
│   ├── controllers/              # Business logic (21 controllers)
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protect + role auth
│   ├── models/                   # Mongoose schemas (22 models)
│   ├── routes/                   # Express routers (21 route files)
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js                 # Entry point + Socket.IO
│
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx        # Sidebar + header layout
    │   │   └── admin/
    │   │       ├── page.tsx           # Dashboard
    │   │       ├── pos/               # POS System
    │   │       ├── kds/               # Kitchen Display
    │   │       ├── orders/            # Order management
    │   │       ├── menu/              # Menu + categories
    │   │       ├── inventory/         # Stock management
    │   │       ├── employees/         # Staff management
    │   │       ├── customers/         # CRM
    │   │       ├── tables/            # Table management
    │   │       ├── reservations/      # Booking management
    │   │       ├── suppliers/         # Vendor management
    │   │       ├── reports/           # Analytics & reports
    │   │       ├── reviews/           # Customer feedback
    │   │       ├── promotions/        # Coupon management
    │   │       ├── ai-assistant/      # AI chat interface
    │   │       └── settings/          # System config
    │   └── globals.css
    ├── lib/
    │   ├── axiosInstance.ts      # Axios + JWT interceptors
    │   ├── store.ts              # Redux store
    │   ├── hooks.ts              # Typed Redux hooks
    │   └── features/auth/authSlice.ts
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally (default: `mongodb://localhost:27017`)
- Git

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/your-username/Intelligent-Restaurant-Management-System.git
cd Intelligent-Restaurant-Management-System

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartserve_ai
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# AI Integration (optional - uses mock if not set)
GEMINI_API_KEY=your_gemini_api_key

# Payment (toggle - set to 'true' only for production)
ENABLE_RAZORPAY=false
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Start Development Servers

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Server running on http://localhost:5000
# → MongoDB Connected: 127.0.0.1

# Terminal 2 — Frontend
cd frontend
npm run dev
# → Ready on http://localhost:3000
```

### 4. Open in Browser

Navigate to **http://localhost:3000** and register your first account.

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | Environment mode |
| `PORT` | No | `5000` | Backend server port |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret for signing JWTs |
| `JWT_EXPIRE` | No | `7d` | JWT expiry duration |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | CORS allowed origin |
| `GEMINI_API_KEY` | No | — | Google Gemini API key |
| `ENABLE_RAZORPAY` | No | `false` | Set `true` for live payments |
| `RAZORPAY_KEY_ID` | Prod only | — | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Prod only | — | Razorpay Key Secret |

---

## 📡 API Reference

All routes are prefixed with `/api/v1/`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login |
| `GET` | `/auth/me` | Get current user |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/dashboard/stats` | Dashboard stats |
| `GET` | `/menu/categories` | Get menu categories |
| `GET` | `/menu/items` | Get menu items |
| `GET/POST` | `/orders` | List / create orders |
| `PATCH` | `/orders/:id/status` | Update order status |
| `GET` | `/inventory` | Get inventory |
| `GET` | `/inventory/low-stock` | Low stock items |
| `PATCH` | `/inventory/:id/stock` | Update stock |
| `GET/POST` | `/employees` | Manage employees |
| `GET/POST` | `/customers` | Manage customers |
| `GET/POST` | `/tables` | Manage tables |
| `PATCH` | `/tables/:id/status` | Update table status |
| `GET/POST` | `/reservations` | Manage reservations |
| `GET` | `/reservations/today` | Today's reservations |
| `GET/POST` | `/reviews` | Get/create reviews |
| `PUT` | `/reviews/:id` | Reply to review |
| `GET` | `/reviews/averages` | Rating aggregates |
| `GET/POST` | `/promotions` | Manage promotions |
| `POST` | `/promotions/apply` | Apply promo code |
| `GET` | `/reports/sales` | Sales report |
| `GET` | `/reports/inventory` | Inventory report |
| `GET` | `/reports/customers` | Customer report |
| `POST` | `/ai/chat` | AI chat (Gemini) |
| `GET` | `/ai/insights` | AI insights |

> All routes (except auth) require `Authorization: Bearer <token>` header or a valid `token` cookie.

---

## 💳 Payment Integration (Razorpay)

Razorpay is implemented with an **on/off toggle** for easy switching between development (mock) and production (live):

**Development (default):**
```env
ENABLE_RAZORPAY=false
```
→ Payments are simulated locally with a mock response. No keys needed.

**Production:**
```env
ENABLE_RAZORPAY=true
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
```
→ Real Razorpay payment gateway is activated.

The toggle logic lives in `backend/config/razorpay.js`.

---

## 🤖 AI Integration (Gemini)

The AI Assistant uses **Google Gemini** to answer natural language questions about your restaurant data.

**Without API key (default):** Uses intelligent mock responses based on actual DB data.

**With API key:**
```env
GEMINI_API_KEY=your_key_here
```
→ Gemini API is queried with restaurant context for live AI responses.

**Sample questions you can ask:**
- "What is today's revenue?"
- "Which items are low on stock?"
- "Give me a summary of our best selling items"
- "How many orders were placed this week?"

---

## 📡 Socket.IO Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join_kitchen` | Client → Server | — | Join KDS room |
| `kitchen_joined` | Server → Client | `{message}` | Confirmation |
| `new_order` | Server → KDS | `Order object` | New order placed |
| `order_status_updated` | Server → All | `{orderId, status}` | Status change |
| `order_ready` | Client → Server | `{orderId}` | Chef marks ready |
| `order_ready_notification` | Server → All | `{orderId}` | Notify waiters |

---

## 👤 Default Credentials

After registering, the first user gets `admin` role by default (configurable in `authController.js`).

**Roles available:**
- `super_admin` — Full system access
- `manager` — Restaurant management
- `cashier` — POS & payments
- `waiter` — Order taking
- `chef` — Kitchen display
- `kitchen_staff` — KDS view
- `delivery_partner` — Delivery management
- `customer` — Customer portal

---

## 📊 Modules

### Dashboard
- Today's revenue, total orders, active customers
- Low stock count, pending reservations
- Weekly revenue chart (Recharts)
- Recent orders table
- AI-powered insights panel

### POS System
- Browse menu by category
- Add items to cart with quantity control
- Apply coupon codes
- Add tip (0%, 5%, 10%, 15%)
- Auto-calculated GST (5%)
- Choose payment method (Cash/UPI/Card/Wallet)
- Place order → auto-sent to KDS via Socket.IO

### Kitchen Display System (KDS)
- Real-time order cards via Socket.IO
- Visual urgency indicator (>20 min = red alert)
- "Start Preparing" → "Mark as Ready" workflow
- Kitchen notes display

### Inventory Management
- Add/edit/delete inventory items
- Real-time stock levels with visual indicators
- Low stock alerts and filtering
- Stock adjustment (add/subtract)
- Supplier linking

### Reports
- **Sales Report**: Revenue by date, order count, average order value
- **Inventory Report**: Current stock levels, low stock flags
- **Employee Report**: Staff list with performance
- **Customer Report**: Top customers by spend

---

## 🔧 Scripts

```bash
# Backend
npm run dev        # Start with --watch (auto-restart on file change)
npm start          # Production start

# Frontend
npm run dev        # Start Next.js with Turbopack
npm run build      # Production build
npm run lint       # ESLint
```

---

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Set `ENABLE_RAZORPAY=true` with your live Razorpay keys
3. Set `GEMINI_API_KEY` with your production API key
4. Use a MongoDB Atlas connection string for `MONGO_URI`
5. Deploy backend on Railway/Render/EC2
6. Deploy frontend on Vercel (recommended for Next.js)
7. Update `FRONTEND_URL` in backend `.env` and `NEXT_PUBLIC_API_URL` in frontend `.env.production`

---

## 📄 License

MIT © 2025 SmartServe AI

---

<div align="center">
  <strong>Built with ❤️ using MERN Stack + AI</strong><br/>
  <sub>Next.js • Node.js • MongoDB • Socket.IO • Gemini AI • Razorpay</sub>
</div>