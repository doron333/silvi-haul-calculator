# 🚀 COMPLETE SETUP GUIDE - API KEYS & SERVER

## 📋 WHAT YOU NEED

This web application requires a simple Node.js backend server to keep your API keys secure. Here's the complete setup:

---

## ⚡ QUICK START (5 Minutes)

### **Step 1: Get Your FREE API Keys**

#### **1a. Claude API Key** (Required for AI features)
1. Go to: https://console.anthropic.com
2. Sign up for an account (free)
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-...`)
6. Cost: Pay-as-you-go (~$0.01-0.03 per calculation)

#### **1b. EIA Fuel Price API Key** (100% FREE)
1. Go to: https://www.eia.gov/opendata/register.php
2. Fill out simple form (name, email, organization)
3. Check your email for API key
4. Cost: **100% FREE** (U.S. government data)

---

### **Step 2: Setup the Server**

Open terminal/command prompt in the folder with your files:

```bash
# Install Node.js dependencies
npm install

# Create your .env file
cp .env.example .env
```

---

### **Step 3: Add Your API Keys**

**Option A: Edit .env file (Recommended)**
Open `.env` file in any text editor and add your keys:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
EIA_API_KEY=your-eia-key-here
PORT=3000
```

**Option B: Edit server.js directly**
Open `server.js` and find these lines (around line 15):

```javascript
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-claude-api-key-here';
const EIA_API_KEY = process.env.EIA_API_KEY || 'your-eia-api-key-here';
```

Replace the placeholder text with your actual keys:

```javascript
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'YOUR_ANTHROPIC_API_KEY_HERE...';
const EIA_API_KEY = process.env.EIA_API_KEY || 'def456...';
```

---

### **Step 4: Start the Server**

```bash
npm start
```

You should see:
```
🚀 Silvi Haul Rate Calculator Server Started!
📍 Server running at: http://localhost:3000
📊 API Status: http://localhost:3000/api/health

🔑 API Key Status:
   Claude: ✅ Configured
   EIA:    ✅ Configured

💡 Open your browser to: http://localhost:3000/silvi-webapp-complete.html
```

---

### **Step 5: Open Your Browser**

Navigate to: **http://localhost:3000/silvi-webapp-complete.html**

✅ Your app is now running with full AI and live fuel price integration!

---

## 🔧 DETAILED INSTRUCTIONS

### **File Structure**
```
your-folder/
├── server.js                      ← Backend server (API keys here)
├── package.json                   ← Dependencies
├── .env.example                   ← Template for API keys
├── .env                          ← YOUR ACTUAL API KEYS (create this!)
├── silvi-webapp-complete.html     ← Frontend application
└── SETUP_GUIDE.md                ← This file
```

---

### **How It Works**

1. **Frontend (HTML)** - What users see
   - Runs in browser
   - Collects user input
   - Displays results

2. **Backend (server.js)** - Where API keys live
   - Runs on your computer/server
   - Makes API calls to Claude and EIA
   - Keeps API keys secret

3. **APIs Called:**
   - **Claude API** - AI-powered calculations and insights
   - **EIA API** - Live fuel prices by state

---

### **API Endpoints Available**

Once server is running, these endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check API key status |
| `/api/calculate-ai-rate` | POST | AI haul rate calculation |
| `/api/fuel-prices/:state` | GET | Live fuel prices (e.g., /api/fuel-prices/PA) |
| `/api/fuel-trends/:state` | GET | 12-week price trends |

---

### **Testing Your Setup**

#### **Test 1: Check Server Health**
Open browser to: http://localhost:3000/api/health

Should see:
```json
{
  "status": "OK",
  "apiKeys": {
    "claude": "Configured ✅",
    "eia": "Configured ✅"
  }
}
```

#### **Test 2: Test Fuel Prices**
Open browser to: http://localhost:3000/api/fuel-prices/PA

Should see:
```json
{
  "success": true,
  "data": {
    "gasoline": 3.45,
    "diesel": 3.78,
    "lastUpdate": "2025-04-21",
    "source": "U.S. Energy Information Administration (EIA)",
    "state": "PA"
  }
}
```

#### **Test 3: Full Application**
Open: http://localhost:3000/silvi-webapp-complete.html
- Enter an address
- Click "Find Closest Quarry"
- Adjust settings
- Click "Calculate Haul Rate"

Should see AI-powered results with live fuel prices!

---

## 🔒 SECURITY BEST PRACTICES

### **NEVER Share Your API Keys!**

❌ **DON'T:**
- Commit .env file to Git
- Share API keys in emails
- Post keys on forums/Slack
- Hardcode keys in frontend HTML

✅ **DO:**
- Keep keys in .env file
- Add .env to .gitignore
- Use environment variables
- Keep server.js on backend only

### **Create .gitignore file:**
```
.env
node_modules/
```

---

## 💰 API COSTS

### **Claude API**
- **Model:** claude-sonnet-4-20250514
- **Cost per calculation:** ~$0.01-0.03
- **Monthly estimate:** $5-15 for typical use
- **Billing:** Pay-as-you-go on credit card

### **EIA Fuel Prices**
- **Cost:** 100% FREE
- **Rate limit:** 1,000 requests/hour (more than enough)
- **No credit card required**

### **Total Monthly Cost**
- **For personal use:** $5-15/month
- **For business with 100+ calculations:** $30-50/month
- **Still way cheaper than competitors charging $200-500/month!**

---

## 🐛 TROUBLESHOOTING

### **"Cannot find module 'express'"**
```bash
npm install
```

### **"Port 3000 already in use"**
Change PORT in .env file:
```env
PORT=3001
```

### **"Claude API Error: Invalid API Key"**
- Check your API key is correct
- Make sure it starts with `sk-ant-`
- Verify you copied the entire key

### **"EIA API returns defaults"**
- Check your EIA API key is correct
- Try visiting: https://www.eia.gov/opendata/browser/
- Verify key works there first

### **"Server won't start"**
- Make sure Node.js is installed: `node --version`
- Should be v18 or higher
- Download from: https://nodejs.org

---

## 🚀 DEPLOYMENT OPTIONS

### **Option 1: Run Locally (Easiest)**
- Just run `npm start` on your computer
- Access at http://localhost:3000
- Works great for personal use

### **Option 2: Deploy to Heroku (Free Tier)**
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create silvi-calculator

# Add API keys as environment variables
heroku config:set ANTHROPIC_API_KEY=your-key-here
heroku config:set EIA_API_KEY=your-key-here

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### **Option 3: Deploy to Railway ($5/month)**
1. Sign up at: https://railway.app
2. Connect GitHub repository
3. Add environment variables in dashboard
4. Deploy automatically

### **Option 4: Deploy to AWS/Azure/GCP**
- Use EC2, App Service, or Cloud Run
- Add API keys to environment variables
- More control, slightly more complex

---

## 📞 NEED HELP?

### **Common Issues:**

**Q: Do I need to keep the terminal open?**
A: Yes, while using the app. Close it to stop the server.

**Q: Can others use my app?**
A: Yes! They visit your deployed URL (or localhost if same network).

**Q: Will this work on mobile?**
A: Yes! The frontend is fully responsive.

**Q: How do I stop the server?**
A: Press `Ctrl+C` in the terminal.

**Q: Can I use this without API keys?**
A: Basic calculations yes, but no AI features or live fuel prices.

---

## ✅ CHECKLIST

- [ ] Node.js installed (v18+)
- [ ] Got Claude API key from console.anthropic.com
- [ ] Got FREE EIA API key from eia.gov/opendata/register
- [ ] Ran `npm install`
- [ ] Created .env file with API keys
- [ ] Ran `npm start`
- [ ] Tested http://localhost:3000/api/health
- [ ] Opened http://localhost:3000/silvi-webapp-complete.html
- [ ] Tested a full calculation
- [ ] Saw AI insights and live fuel prices ✨

---

## 🎉 YOU'RE DONE!

Your professional haul rate calculator is now running with:
- ✅ Claude AI integration
- ✅ Live fuel prices from U.S. EIA
- ✅ GPS routing
- ✅ 70+ verified quarry locations
- ✅ Beautiful UI
- ✅ Professional calculations

**Total setup time: 5-10 minutes**
**Total cost: $5-15/month**
**Value to customers: $797-997/license**

**Now go calculate some haul rates!** 🚀
