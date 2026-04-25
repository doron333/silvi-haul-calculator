# 🚀 NETLIFY DEPLOYMENT GUIDE

## ✅ YOUR APP IS READY TO DEPLOY!

**Repository:** https://github.com/doron333/silvi-haul-calculator

---

## 🎯 WHAT'S INCLUDED:

### **Core Features:**
- ✅ Valhalla truck routing (tri-axle aware)
- ✅ Live EIA fuel prices
- ✅ Automatic toll detection & costs
- ✅ Route visualization on map
- ✅ Turn-by-turn directions
- ✅ Complete route verification panel

### **NEW Features Added:**
- ✅ **Save Quotes** - Save unlimited quotes to browser
- ✅ **Export to PDF** - Professional quote PDFs
- ✅ **Quote History** - View/Load/Delete past quotes
- ✅ **PC*MILER Data Upload** - Import your 3,871 historical quotes
- ✅ **AI Rate Predictions** - Smart suggestions based on YOUR data
- ✅ **Historical Comparison** - See how your calc compares to history
- ✅ **Confidence Scores** - Know how accurate predictions are

---

## 📋 NETLIFY DEPLOYMENT STEPS:

### **Step 1: Go to Netlify**
https://app.netlify.com/

### **Step 2: Create Account / Sign In**
- Sign up with GitHub (easiest)
- Or use email

### **Step 3: Deploy New Site**
1. Click: **"Add new site"** → **"Import an existing project"**
2. Choose: **GitHub**
3. Select: **doron333/silvi-haul-calculator**
4. Click: **"Authorize Netlify"** if prompted

### **Step 4: Configure Build Settings**
Keep these defaults:
- **Base directory:** (leave empty)
- **Build command:** (leave empty)
- **Publish directory:** `public`
- **Functions directory:** `netlify/functions`

### **Step 5: Add Environment Variables**
Click: **"Show advanced"** → **"New variable"**

Add these 2 variables:

**Variable 1:**
```
Key: ANTHROPIC_API_KEY
Value: [YOUR NEW CLAUDE API KEY]
```

**Variable 2:**
```
Key: EIA_API_KEY
Value: ssm5khO6okEW64pn2hxoWKsUpwMpZyraVgS0HgOQ
```

### **Step 6: Deploy!**
1. Click: **"Deploy silvi-haul-calculator"**
2. Wait 30-60 seconds
3. ✅ **YOUR APP IS LIVE!**

---

## 🎯 AFTER DEPLOYMENT:

### **Your Live URL:**
```
https://[random-name].netlify.app
```
(You can customize this in Site Settings → Domain Management)

### **Test Everything:**

1. **Enter address:** "100 Market St, Philadelphia, PA"
2. **Click:** "Find Closest Quarry & Calculate Rate"
3. **Verify you see:**
   - ✅ Green route line on map
   - ✅ Route Details panel
   - ✅ Toll information
   - ✅ Save & Export PDF buttons

4. **Upload Your PC*MILER Data:**
   - Click: "Upload PC*MILER Data"
   - Upload: `hauling_rates.csv` (I'll provide this)
   - Wait for processing
   - See: "3,871 quotes loaded" message

5. **Calculate Again:**
   - Enter another address
   - Calculate route
   - **See the AI Intelligence Card!**
   - Shows: Predicted rate, confidence, historical comparison

---

## 📂 FILES TO UPLOAD TO NETLIFY:

Everything is already in your GitHub repo, including:
- `/public/index.html` - Full app with all features
- `/netlify/functions/` - Serverless functions
- `netlify.toml` - Configuration
- `package.json` - Dependencies

---

## 💾 YOUR HISTORICAL DATA:

I'll convert your Excel file to CSV for easy uploading:

**After deployment, you'll:**
1. Click "Upload PC*MILER Data" button
2. Select the CSV file I give you
3. Wait 2-3 minutes for processing
4. Get AI-powered rate predictions!

---

## 🎨 CUSTOM DOMAIN (Optional):

Want a custom URL like `hauling.silvi.com`?

1. Go to: Site Settings → Domain Management
2. Click: "Add custom domain"
3. Follow the DNS setup instructions
4. Done! (takes 1-24 hours to propagate)

---

## 🔧 TROUBLESHOOTING:

### **If functions don't work:**
- Check: Site Settings → Environment Variables
- Make sure both API keys are added
- Redeploy: Deploys → Trigger deploy → Deploy site

### **If map doesn't load:**
- Netlify has NO strict CSP by default
- Should work immediately
- Hard refresh: Ctrl+Shift+R

### **If data upload fails:**
- Make sure CSV file is under 10MB
- Check browser console (F12) for errors
- Try with smaller sample first

---

## ✅ ADVANTAGES OF NETLIFY:

- ✅ **NO CSP issues** (unlike Vercel)
- ✅ **Free tier is generous** (100GB bandwidth/month)
- ✅ **Auto-deploys** from GitHub
- ✅ **Built-in HTTPS**
- ✅ **Global CDN**
- ✅ **Functions work identically** to Vercel
- ✅ **100% free for this app**

---

## 🚀 YOU'RE READY!

**Go to:** https://app.netlify.com/

**Deploy now!**

Once live, I'll help you:
1. Upload your historical data
2. Test the AI predictions
3. Export your first PDF quote
4. Customize anything you want

---

**ANY QUESTIONS?** Just ask! 🎯
