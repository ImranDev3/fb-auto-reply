# 🤖 FB Auto Reply SaaS

A complete MVP SaaS application for automatically replying to Facebook Messenger messages based on keyword rules.

## 📁 Project Structure

```
fb-auto-reply/
├── public/                  # Frontend files
│   ├── index.html          # Dashboard HTML
│   ├── style.css           # Dashboard styles
│   └── app.js              # Frontend JavaScript
├── src/                     # Backend files
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/
│   │   └── Rule.js         # Rule schema (keyword + reply)
│   ├── routes/
│   │   ├── rules.js        # CRUD API for rules
│   │   └── webhook.js      # Facebook webhook handler
│   ├── services/
│   │   └── messenger.js    # Message matching + FB API
│   └── server.js           # Main Express server
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Example env file
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Setup Guide (Step by Step)

### Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org)
- **MongoDB** (local or Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Facebook Developer Account** - [Create](https://developers.facebook.com)

### Step 1: Install Dependencies

```bash
cd fb-auto-reply
npm install
```

### Step 2: Configure Environment Variables

1. Open the `.env` file
2. Update these values:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fb-auto-reply
FB_VERIFY_TOKEN=my_secret_verify_token
FB_PAGE_ACCESS_TOKEN=your_page_access_token
```

### Step 3: Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) and update `MONGODB_URI` in `.env`.

### Step 4: Run the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

Server will start at: `http://localhost:3000`

### Step 5: Set Up Facebook Webhook

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app (type: Business)
3. Add the **Messenger** product
4. Under Webhooks, click "Add Callback URL"
5. Use a tool like [ngrok](https://ngrok.com) to expose your local server:
   ```bash
   ngrok http 3000
   ```
6. Enter your webhook URL: `https://your-ngrok-url.ngrok.io/webhook`
7. Enter your Verify Token: same as `FB_VERIFY_TOKEN` in `.env`
8. Subscribe to: `messages`, `messaging_postbacks`

### Step 6: Get Page Access Token

1. In your Facebook App dashboard, go to Messenger > Settings
2. Under "Access Tokens", select your Facebook Page
3. Generate a token and copy it to `FB_PAGE_ACCESS_TOKEN` in `.env`

## 📡 API Endpoints

| Method | Endpoint         | Description          |
|--------|-----------------|----------------------|
| GET    | /api/rules      | Get all rules        |
| POST   | /api/rules      | Create a new rule    |
| PUT    | /api/rules/:id  | Update a rule        |
| DELETE | /api/rules/:id  | Delete a rule        |
| GET    | /webhook        | FB webhook verify    |
| POST   | /webhook        | Receive FB messages  |

## 🎯 How It Works

1. Someone sends a message to your Facebook Page
2. Facebook forwards the message to your webhook (`POST /webhook`)
3. The server checks the message text against all keyword rules in MongoDB
4. If a keyword matches, the auto-reply is sent back via Facebook Graph API
5. The user receives the reply instantly in Messenger

## 💡 Example Rules

| Keyword  | Auto Reply                                    |
|----------|-----------------------------------------------|
| hello    | Hi! Thanks for reaching out. How can I help?  |
| price    | Our pricing starts at $9.99/month. Visit...   |
| hours    | We're open Mon-Fri, 9 AM - 5 PM EST.         |
| help     | Sure! What do you need help with?             |

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Database:** MongoDB with Mongoose
- **API:** Facebook Graph API v18.0
- **HTTP Client:** Axios

## 📝 Notes

- Keywords are matched case-insensitively
- The first matching rule is used (if multiple keywords match)
- Rules can be toggled active/inactive without deleting
- The webhook must be publicly accessible (use ngrok for local dev)

## 🐛 Troubleshooting

- **MongoDB connection error:** Make sure MongoDB is running locally or your Atlas URI is correct
- **Webhook verification failed:** Check that `FB_VERIFY_TOKEN` matches what you entered in Facebook
- **Messages not sending:** Verify your `FB_PAGE_ACCESS_TOKEN` is valid and has `pages_messaging` permission
- **ngrok not working:** Make sure the server is running before starting ngrok

## 📄 License

MIT - Free to use and modify.
