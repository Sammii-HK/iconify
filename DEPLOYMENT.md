# Step-by-Step Guide: Getting Ads & Deploying to Vercel

## Part 1: Setting Up Google AdSense (Get Ads)

### Step 1: Sign Up for Google AdSense
1. Go to **https://www.google.com/adsense/**
2. Click **"Get Started"**
3. Sign in with your Google account
4. Enter your website URL (you can use a placeholder like `yourdomain.vercel.app` for now)
5. Select your country and payment details

### Step 2: Get Approved (Wait 1-3 days)
- Google will review your site
- You'll get an email when approved
- **Note**: You can deploy your site first, then add ads once approved

### Step 3: Create Ad Units
Once approved:
1. Go to **AdSense Dashboard** → **Ads** → **By ad unit**
2. Click **"Create ad unit"**
3. Create **3 ad units**:

   **Ad Unit 1 - Top Banner:**
   - Name: "Top Banner"
   - Type: Display ad
   - Size: Responsive

   **Ad Unit 2 - Sidebar:**
   - Name: "Sidebar"
   - Type: Display ad
   - Size: 300x250 (or Responsive)

   **Ad Unit 3 - Bottom Banner:**
   - Name: "Bottom Banner"
   - Type: Display ad
   - Size: Responsive

4. Copy each **Ad Slot ID** (looks like: `1234567890`)

### Step 4: Get Your Publisher ID
- In AdSense dashboard, go to **Account** → **Account information**
- Copy your **Publisher ID** (format: `ca-pub-1234567890123456`)

### Step 5: Update Your Code
Open `src/web/index.html` and replace:
- `YOUR_PUBLISHER_ID` → Your Publisher ID (appears 4 times)
- `YOUR_AD_SLOT_ID_TOP` → Your top ad slot ID
- `YOUR_AD_SLOT_ID_SIDEBAR` → Your sidebar ad slot ID  
- `YOUR_AD_SLOT_ID_BOTTOM` → Your bottom ad slot ID

---

## Part 2: Deploying to Vercel

### Prerequisites
- GitHub account (free)
- Vercel account (free)

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Vercel:**
   - Visit **https://vercel.com**
   - Sign up/Login with GitHub

3. **Import Project:**
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Vercel will auto-detect settings

4. **Configure Build Settings:**
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave empty - we're using serverless)
   - **Install Command**: `npm install`

5. **Environment Variables** (optional):
   - Add `PORT=3000` if needed

6. **Deploy:**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Your site will be live at `yourproject.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow prompts (use defaults)
   - For production: `vercel --prod`

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### After Deployment

1. **Update Domain in HTML:**
   - Open `src/web/index.html`
   - Replace `https://iconify.dev/` with your Vercel URL:
     - `https://yourproject.vercel.app/`
   - Update all meta tags (og:url, twitter:url, canonical)

2. **Test Your Site:**
   - Visit your Vercel URL
   - Test image upload
   - Test emoji conversion
   - Check that ads load (if AdSense approved)

3. **Custom Domain (Optional):**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

---

## Troubleshooting

### Ads Not Showing?
- Wait 24-48 hours after AdSense approval
- Check browser console for errors
- Verify Publisher ID and Ad Slot IDs are correct
- Make sure site is publicly accessible

### Build Fails?
- Make sure `npm run build` works locally first
- Check that all dependencies are in `package.json`
- Verify TypeScript compiles without errors

### Server Errors?
- Check Vercel function logs
- Ensure `sharp` dependency installs correctly (Vercel handles this automatically)
- Verify PORT environment variable

---

## Quick Commands

```bash
# Build locally to test
npm run build

# Test locally
npm run start:web

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

---

## Next Steps After Deployment

1. ✅ Get AdSense approval
2. ✅ Add your ad IDs to the HTML
3. ✅ Update domain URLs
4. ✅ Submit to Google Search Console
5. ✅ Create sitemap.xml and robots.txt
6. ✅ Monitor analytics

Your site is ready to deploy! 🚀
