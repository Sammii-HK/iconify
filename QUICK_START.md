# Quick Start: Deploy & Get Ads

## 🚀 Deploy to Vercel (5 minutes)

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repo
   - Click "Deploy" (settings auto-detected)
   - Wait 2 minutes → Done! ✅

   Your site: `https://yourproject.vercel.app`

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 💰 Get Google AdSense (1-3 days)

### Step 1: Sign Up
1. Go to **https://www.google.com/adsense/**
2. Click **"Get Started"**
3. Sign in with Google
4. Enter your Vercel URL: `https://yourproject.vercel.app`
5. Fill out payment info

### Step 2: Wait for Approval
- Takes 1-3 days
- You'll get an email when approved
- **Deploy your site first** - Google needs to see it live

### Step 3: Get Your IDs (After Approval)

1. **Publisher ID:**
   - Dashboard → Account → Account information
   - Copy: `ca-pub-1234567890123456`

2. **Create 3 Ad Units:**
   - Dashboard → Ads → By ad unit → Create ad unit
   
   Create these:
   - **Top Banner** (Responsive)
   - **Sidebar** (300x250 or Responsive)  
   - **Bottom Banner** (Responsive)
   
   Copy each Ad Slot ID (like: `1234567890`)

### Step 4: Add Ads to Your Site

1. Open `src/web/index.html`
2. Find and replace:
   - `YOUR_PUBLISHER_ID` → Your Publisher ID (4 places)
   - `YOUR_AD_SLOT_ID_TOP` → Top ad slot ID
   - `YOUR_AD_SLOT_ID_SIDEBAR` → Sidebar ad slot ID
   - `YOUR_AD_SLOT_ID_BOTTOM` → Bottom ad slot ID

3. Commit and push:
   ```bash
   git add src/web/index.html
   git commit -m "Add AdSense IDs"
   git push
   ```
   Vercel auto-deploys! ✨

---

## 📝 Update Domain URLs

After deployment, update your domain in `src/web/index.html`:

Replace `https://iconify.dev/` with your Vercel URL:
- `https://yourproject.vercel.app/`

Update these:
- Line 18: `og:url`
- Line 25: `twitter:url`
- Line 35: `canonical`
- Line 47: `url` in JSON-LD

---

## ✅ Test Checklist

- [ ] Site loads at Vercel URL
- [ ] Can upload images
- [ ] Can convert emojis
- [ ] Downloads work
- [ ] Ads show (after AdSense approval)

---

## 🎯 Quick Commands

```bash
# Build locally
npm run build

# Test locally
npm run start:web

# Deploy to Vercel
vercel --prod

# View deployment logs
vercel logs
```

---

## 💡 Tips

- **Deploy first, then get AdSense** - Google needs to see your live site
- **Custom domain**: Add in Vercel Settings → Domains
- **Analytics**: Add Google Analytics for tracking
- **SEO**: Already set up! Just update domain URLs

**That's it!** Your site is ready to deploy. 🎉

