# 🚗 AutoNexus — AI-Powered Multi-Dealer Car Platform

> A modern, AI-powered car dealership platform built for the East African market. Multiple dealers list their vehicles, buyers browse and inquire, and the platform owner earns through monthly dealer subscriptions.

**Live URLs:**
- Frontend: https://autonexus-six.vercel.app
- Backend API: https://autonexus-api.onrender.com

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [User Roles](#user-roles)
5. [Project Structure](#project-structure)
6. [Local Setup](#local-setup)
7. [Environment Variables](#environment-variables)
8. [API Reference](#api-reference)
9. [Deployment](#deployment)
10. [Business Model](#business-model)

---

## Overview

AutoNexus is a multi-tenant car dealership platform where:
- **Dealers** pay a monthly subscription (KES 5,000/month) to list their vehicles
- **Buyers** browse, inquire, and reserve vehicles via bank transfer deposits
- **Super Admin** (platform owner) manages all dealers, subscriptions, and orders
- **AI features** power search, price prediction, recommendations, and virtual test drives

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, TailwindCSS, Zustand, React Query |
| Backend | Node.js + Express, Prisma ORM |
| Database | PostgreSQL |
| AI | Groq API (llama-3.3-70b-versatile) |
| Image Storage | Cloudinary |
| Email | Resend |
| Deployment | Vercel (frontend) + Render (backend + DB) |

---

## Features

### AI Features
- **AI Chat Assistant** — Natural language car recommendations via floating chat widget
- **Smart Search** — Type "red SUV under 5M automatic" and AI converts it to filters
- **Price Prediction** — Market price analysis for any vehicle based on Kenyan market data
- **Virtual Test Drive** — AI answers detailed questions about specific cars

### Platform Features
- Multi-dealer inventory management
- Cloudinary image upload (up to 10 images per car)
- Bank transfer deposit flow with auto-generated reference numbers
- WhatsApp inquiry integration
- Email notifications (dealer + buyer) on every order
- Dealer subscription management with 30-day free trial
- Mobile responsive + PWA installable

---

## User Roles

| Role | Access |
|------|--------|
| `USER` | Browse cars, save favorites, send inquiries, pay deposits |
| `DEALER` | Everything USER can do + manage own listings, view own orders |
| `SUPER_ADMIN` | Everything + manage all dealers, subscriptions, all orders |

---

## Project Structure

```
autonexus/
├── client/                          # React frontend
│   └── src/
│       ├── components/
│       │   ├── cars/                # CarCard, CarFormModal, RelatedCars
│       │   ├── chat/                # ChatWidget (AI assistant)
│       │   ├── layout/              # Navbar, Footer
│       │   └── ui/                  # Testimonials
│       ├── hooks/                   # useSEO, usePendingOrders
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── CarsPage.jsx
│       │   ├── CarDetailPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── AccountPage.jsx
│       │   ├── FavoritesPage.jsx
│       │   ├── DealerRegisterPage.jsx
│       │   ├── DealerDashboardPage.jsx
│       │   ├── SuperAdminPage.jsx
│       │   └── NotFoundPage.jsx
│       ├── services/                # api.js — all API calls
│       └── store/                   # authStore.js (Zustand)
└── server/                          # Express backend
    ├── prisma/
    │   ├── schema.prisma            # Database schema
    │   └── seed.js                  # Sample data
    └── src/
        ├── config/                  # db.js, cloudinary.js
        ├── controllers/             # auth, cars, orders, ai, dealer
        ├── middleware/              # auth.js, errorHandler.js, validate.js
        ├── routes/                  # auth, cars, orders, ai, users, dealers
        └── services/               # email.service.js, mpesa.service.js
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clone & Install
```bash
git clone https://github.com/Tripplelight/autonexus.git
cd autonexus
npm install
cd server && npm install --legacy-peer-deps
cd ../client && npm install
cd ..
```

### 2. Database Setup
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE autonexus;
ALTER USER postgres PASSWORD 'yourpassword';
\q
```

### 3. Environment Variables
```bash
cd server
cp .env.example .env
# Fill in your values (see Environment Variables section)
```

### 4. Database Migration & Seed
```bash
cd server
npx prisma db push
node prisma/seed.js
```

### 5. Run Development Servers
```bash
# From root
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Default Accounts (after seed)
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@autonexus.com | Admin@1234 |
| Demo Dealer | dealer@autonexus.com | Dealer@1234 |

---

## Environment Variables

### Server (`server/.env`)
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/autonexus"

# Auth
JWT_SECRET="your-secret-key"

# URLs
CLIENT_URL="http://localhost:5173"
PORT=5000
NODE_ENV="development"

# AI
GROQ_API_KEY="gsk_..."

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Resend)
RESEND_API_KEY="re_..."
FROM_EMAIL="AutoNexus <noreply@yourdomain.com>"
DEALER_EMAIL="your@email.com"
DEALER_WHATSAPP="+254700000000"

# Bank Details (shown on deposit)
BANK_NAME="Equity Bank Kenya"
BANK_ACCOUNT_NAME="AutoNexus Limited"
BANK_ACCOUNT_NUMBER="0123456789"
BANK_BRANCH="Nairobi CBD"
BANK_SWIFT="EQBLKENA"
BANK_PESALINK="0123456789"

# Mpesa (for dealer subscriptions)
MPESA_CONSUMER_KEY="..."
MPESA_CONSUMER_SECRET="..."
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="..."
MPESA_CALLBACK_URL="https://your-api.onrender.com/api/payments/mpesa/callback"
```

### Client (`client/.env`)
```env
VITE_API_URL="http://localhost:5000"
VITE_DEALER_WHATSAPP="254700000000"
```

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Protected | Get current user |

### Cars
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/cars` | Public | List cars (with filters) |
| GET | `/api/cars/:id` | Public | Get single car |
| POST | `/api/cars` | Dealer/Admin | Add car |
| PUT | `/api/cars/:id` | Dealer/Admin | Update car |
| DELETE | `/api/cars/:id` | Dealer/Admin | Delete car |
| POST | `/api/cars/:id/favorite` | User | Toggle favorite |
| GET | `/api/cars/favorites` | User | Get favorites |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | User | Create order/inquiry |
| GET | `/api/orders/my` | User | Get my orders |
| GET | `/api/orders/bank-details` | User | Get bank details |
| GET | `/api/orders` | Admin | Get all orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

### AI
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/ai/chat` | Optional auth | AI chat assistant |
| POST | `/api/ai/smart-search` | Public | NLP search → filters |
| POST | `/api/ai/price-predict` | Public | Price prediction |
| POST | `/api/ai/test-drive/:carId` | Optional auth | Virtual test drive |

### Dealers
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/dealers/register` | Public | Dealer registration |
| GET | `/api/dealers/profile` | Dealer | Get own profile |
| PATCH | `/api/dealers/profile` | Dealer | Update profile |
| GET | `/api/dealers/my-cars` | Dealer | Get own cars |
| GET | `/api/dealers/my-orders` | Dealer | Get own orders |
| GET | `/api/dealers/subscription` | Dealer | Check subscription |
| GET | `/api/dealers` | Super Admin | Get all dealers |
| PATCH | `/api/dealers/:id/subscription` | Super Admin | Update subscription |
| PATCH | `/api/dealers/:id/suspend` | Super Admin | Suspend dealer |

### Query Parameters (GET /api/cars)
```
make, bodyType, fuel, transmission, condition,
minPrice, maxPrice, minYear, maxYear,
search, featured, dealerId,
page (default: 1), limit (default: 12),
sort (createdAt | price_asc | price_desc | year)
```

---

## Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Import repo on vercel.com
3. Set **Root Directory** to `client`
4. Add environment variables:
   - `VITE_API_URL` = your Render backend URL
   - `VITE_DEALER_WHATSAPP` = dealer WhatsApp number
5. Add `client/vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Backend → Render
1. Create **Web Service** pointing to repo
2. Set **Root Directory** to `server`
3. **Build Command**: `npm install --legacy-peer-deps && npx prisma generate`
4. **Start Command**: `npm start`
5. Add all environment variables
6. Create **PostgreSQL** database on Render
7. Copy **Internal Database URL** → set as `DATABASE_URL`

### Production Database Setup
```bash
# Run once after first deployment
DATABASE_URL="your-render-external-db-url" npx prisma db push
DATABASE_URL="your-render-external-db-url" node prisma/seed.js
```

---

## Business Model

### Revenue Streams
| Stream | Amount | Frequency |
|--------|--------|-----------|
| Dealer Subscription | KES 5,000 | Monthly per dealer |
| Featured Listings | KES 500 | Per listing (future) |
| Lead Generation | KES 200 | Per verified inquiry (future) |

### Dealer Onboarding Flow
1. Dealer registers at `/become-a-dealer`
2. **30-day free trial** starts automatically
3. After trial → Super Admin activates subscription manually
4. Dealer pays KES 5,000 via bank transfer/Mpesa
5. Super Admin confirms payment in admin panel
6. Dealer gets another 30 days

### Payment Flow (Buyers)
1. Buyer sends **inquiry** → free, just a notification
2. Buyer pays **10% deposit** → bank transfer with auto-generated reference
3. Admin confirms bank transfer → car marked as Reserved
4. Balance paid at dealership on pickup

---

## Known Limitations & Future Improvements
- [ ] Stripe/Pesalink integration for automated payment confirmation
- [ ] Automated subscription renewal reminders
- [ ] Dealer analytics dashboard (views, inquiries per listing)
- [ ] Google Maps integration for dealer locations
- [ ] Car comparison feature
- [ ] Blockchain vehicle history records
- [ ] Mobile app (React Native)
- [ ] Custom domain setup (`autonexus.co.ke`)

---

## Security Notes
- JWT tokens expire after 7 days
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting: 100 req/15min general, 20 req/min for AI endpoints
- Input validation on all endpoints (express-validator)
- Helmet.js for HTTP security headers
- CORS restricted to CLIENT_URL only

---

*Built with ❤️ in Nairobi, Kenya 🇰🇪*
*© 2026 AutoNexus. All rights reserved.*