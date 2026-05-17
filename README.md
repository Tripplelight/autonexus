# 🚗 AutoNexus — AI-Powered Car Dealership

Full-stack car dealership with Claude AI chatbot, smart search, price prediction, and virtual test drive.

## Tech Stack
- **Frontend**: React + Vite, TailwindCSS, React Query, Zustand
- **Backend**: Node.js + Express, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Anthropic Claude API
- **Storage**: Cloudinary
- **Payments**: Stripe
- **Deploy**: Vercel (frontend) + Render (backend + DB)

---

## 🚀 Local Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd autonexus
npm run install:all
```

### 2. Set up Server Environment
```bash
cd server
cp .env.example .env
# Fill in .env with your keys
```

Required keys:
- `DATABASE_URL` — from Render PostgreSQL or local postgres
- `JWT_SECRET` — any random string (use `openssl rand -base64 32`)
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `CLOUDINARY_*` — from cloudinary.com
- `STRIPE_SECRET_KEY` — from stripe.com

### 3. Set up Database
```bash
cd server
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Run Dev
```bash
# From root
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api

### Default Admin Account
- Email: `admin@autonexus.com`
- Password: `Admin@1234`

---

## 📁 Project Structure
```
autonexus/
├── client/                  # React frontend
│   └── src/
│       ├── components/
│       │   ├── cars/        # CarCard, CarFilters
│       │   ├── chat/        # ChatWidget (AI chatbot)
│       │   └── layout/      # Navbar, Footer
│       ├── pages/           # All page components
│       ├── services/        # API layer (axios)
│       └── store/           # Zustand auth store
└── server/                  # Express backend
    ├── prisma/
    │   ├── schema.prisma    # DB schema
    │   └── seed.js          # Sample data
    └── src/
        ├── controllers/     # auth, cars, orders, ai
        ├── middleware/      # auth, errorHandler
        ├── routes/          # Express routes
        └── config/          # DB, Cloudinary
```

---

## 🤖 AI Features
| Feature | Endpoint | Description |
|---|---|---|
| Chatbot | `POST /api/ai/chat` | General car buying assistant |
| Smart Search | `POST /api/ai/smart-search` | NLP → filters |
| Price Prediction | `POST /api/ai/price-predict` | Market price estimate |
| Virtual Test Drive | `POST /api/ai/test-drive/:id` | Car-specific Q&A |

---

## 🚢 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import repo on vercel.com
3. Set root to `client/`, build command `npm run build`
4. Add env: `VITE_STRIPE_PUBLIC_KEY`

### Backend → Render
1. Create a **Web Service** pointing to `server/`
2. Build: `npm install && npx prisma migrate deploy`
3. Start: `npm start`
4. Add all env variables from `.env.example`
5. Create a **PostgreSQL** database on Render, copy the URL to `DATABASE_URL`
