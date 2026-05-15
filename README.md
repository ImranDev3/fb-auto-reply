# 🤖 AutoReply Pro — Smart Messenger & WhatsApp Auto Reply SaaS

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-blue?style=flat-square&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-purple?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

A complete multi-tenant SaaS platform for automating Facebook Messenger and WhatsApp replies. Built with Node.js, Express, MongoDB, and Google Gemini AI.

## 🚀 Live Demo

**Website:** [https://fb-auto-reply-2kst.onrender.com](https://fb-auto-reply-2kst.onrender.com)

## ✨ Features

### For Users (Clients)
- 🔑 **Keyword-based Auto Reply** — Set keywords and custom replies
- 🤖 **AI-Powered Smart Reply** — Gemini AI answers when no keyword matches
- 📦 **Product Catalog** — Add products/services, AI uses them to reply
- 🌙 **24/7 Away Mode** — Bot works without admin being online
- 💬 **Multi-Platform** — Facebook Messenger + WhatsApp support
- 📊 **Dashboard** — Stats, message counter, rule management
- 👤 **Profile** — Business details, page connection, password change
- 🔗 **Easy Page Connect** — Step-by-step guide to connect Facebook Page

### For Admin
- 👥 **User Management** — View, edit, suspend, delete all users
- 💰 **Subscription Management** — Plans, start/end dates, payment tracking
- 🎟️ **Coupon System** — Create discount coupons with expiry
- 📈 **Platform Stats** — Total users, rules, plan breakdown
- 🔧 **Page Management** — Connect pages on behalf of clients
- ➕ **Create Users** — Add users directly from admin panel

### Technical
- 🔐 **JWT Authentication** — Secure login/signup system
- 🏢 **Multi-Tenant** — Each user's data is completely isolated
- ⏰ **Auto Expiry** — Subscriptions auto-downgrade when expired
- 🌐 **Webhook System** — Facebook & WhatsApp webhook handlers
- 📱 **Responsive UI** — Works on desktop and mobile

## 📁 Project Structure

```
fb-auto-reply/
├── public/                     # Frontend
│   ├── index.html             # Main dashboard
│   ├── login.html             # Login/Signup page
│   ├── admin.html             # Admin panel
│   ├── landing.html           # Marketing landing page
│   ├── landing.css            # Landing page styles
│   ├── how-to-use.html       # Documentation page
│   ├── privacy-policy.html   # Privacy policy
│   ├── terms.html            # Terms of service
│   ├── refund-policy.html    # Refund policy
│   ├── style.css             # Dashboard styles
│   └── app.js                # Dashboard JavaScript
├── src/                       # Backend
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication + expiry check
│   │   └── admin.js          # Admin-only middleware
│   ├── models/
│   │   ├── User.js           # User schema (auth, subscription, business)
│   │   ├── Rule.js           # Auto-reply rules
│   │   ├── Settings.js       # Bot settings per user
│   │   ├── Product.js        # Products/services catalog
│   │   └── Coupon.js         # Discount coupons
│   ├── routes/
│   │   ├── auth.js           # Auth API (register, login, profile)
│   │   ├── rules.js          # Rules CRUD API
│   │   ├── settings.js       # Settings API
│   │   ├── products.js       # Products API
│   │   ├── admin.js          # Admin API (users, subscriptions, coupons)
│   │   ├── webhook.js        # Facebook Messenger webhook
│   │   └── whatsapp.js       # WhatsApp webhook
│   ├── services/
│   │   ├── messenger.js      # Message handling + multi-tenant matching
│   │   ├── whatsappService.js # WhatsApp message handling
│   │   └── geminiService.js  # Google Gemini AI integration
│   └── server.js             # Express server entry point
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore (node_modules, .env)
├── package.json
└── README.md
```

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Backend runtime |
| **Express.js** | Web framework |
| **MongoDB** | Database (Atlas cloud) |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Google Gemini AI** | Smart AI replies |
| **Axios** | HTTP client (Facebook API) |
| **HTML/CSS/JS** | Frontend (Vanilla) |
| **Font Awesome** | Icons |

## 📋 Setup Guide

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Facebook Developer account
- Google AI Studio account (for Gemini API key)

### 1. Clone the Repository

```bash
git clone https://github.com/ImranDev3/fb-auto-reply.git
cd fb-auto-reply
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fb-auto-reply
FB_VERIFY_TOKEN=your_custom_verify_token
FB_PAGE_ACCESS_TOKEN=your_facebook_page_access_token
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Get Required API Keys

| Key | Where to Get |
|-----|-------------|
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/atlas) — Free M0 cluster |
| `FB_PAGE_ACCESS_TOKEN` | [Facebook Developers](https://developers.facebook.com) — Messenger Settings |
| `FB_VERIFY_TOKEN` | Any custom string you choose |
| `JWT_SECRET` | Any random secure string |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) — Free |

### 4. Run the Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

### 5. Set Up Facebook Webhook

1. Go to Facebook Developer Console → Your App → Messenger → Settings
2. Under Webhooks, add callback URL:
   - **URL:** `https://your-domain.com/webhook`
   - **Verify Token:** Same as `FB_VERIFY_TOKEN` in .env
3. Subscribe to: `messages`

### 6. Make Yourself Admin

```bash
node src/make-admin.js your@email.com
```

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| PUT | `/api/auth/page` | Update page details |
| PUT | `/api/auth/business` | Update business details |
| GET | `/api/auth/stats` | Get message stats |

### Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rules` | Get user's rules |
| POST | `/api/rules` | Create rule |
| PUT | `/api/rules/:id` | Update rule |
| DELETE | `/api/rules/:id` | Delete rule |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get products |
| POST | `/api/products` | Add product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | All users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| PUT | `/api/admin/users/:id/subscription` | Manage subscription |
| PUT | `/api/admin/users/:id/page` | Manage page details |
| GET | `/api/admin/stats` | Platform stats |
| GET | `/api/admin/coupons` | All coupons |
| POST | `/api/admin/coupons` | Create coupon |
| DELETE | `/api/admin/coupons/:id` | Delete coupon |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhook` | Facebook verification |
| POST | `/webhook` | Receive messages |
| GET | `/whatsapp/webhook` | WhatsApp verification |
| POST | `/whatsapp/webhook` | Receive WhatsApp messages |

## 💰 Subscription Plans

| Plan | Rules | Messenger | WhatsApp | AI Reply | Price |
|------|-------|-----------|----------|----------|-------|
| Free | 5 | ✅ | ❌ | ✅ | $0 |
| Starter | 25 | ✅ | ❌ | ✅ | $4.99/mo |
| Pro | 100 | ✅ | ✅ | ✅ | $9.99/mo |
| Enterprise | Unlimited | ✅ | ✅ | ✅ | $29.99/mo |

## 🚀 Deployment

### Render.com (Recommended — Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - Build: `npm install`
   - Start: `node src/server.js`
5. Add environment variables
6. Deploy!

## 🔒 Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 30-day expiry
- User data isolated (multi-tenant)
- Environment variables for all secrets
- `.env` excluded from git

## 📄 License

MIT License — Free to use, modify, and distribute.

## 👨‍💻 Author

**Imran Hossain** — [GitHub](https://github.com/ImranDev3)

---

<p align="center">Built with ❤️ using Node.js, Express, MongoDB & Gemini AI</p>
