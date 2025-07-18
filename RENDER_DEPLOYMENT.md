# 🚀 Deploy Backend to Render

## Why Render?
- ✅ **More reliable** than Railway CLI
- ✅ **Great free tier** (750 hours/month)
- ✅ **Simple deployment** from GitHub
- ✅ **Better error handling**
- ✅ **Automatic HTTPS**

## 🚀 **Deploy to Render (5 minutes)**

### Step 1: Go to Render
1. Visit: **https://render.com**
2. Sign up/Login (can use GitHub account)

### Step 2: Create Web Service
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub account if needed
3. Select repository: **daanrun/patient-checkin-system**

### Step 3: Configure Service
```
Name: patient-checkin-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### Step 4: Add Environment Variables
Click **"Advanced"** and add:
```
NODE_ENV=production
ALLOWED_ORIGINS=https://checkinpatient.netlify.app
PORT=10000
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (usually 2-3 minutes)
3. Get your URL: `https://patient-checkin-backend.onrender.com`

## 🧪 **Test Backend**
Visit: `https://your-app.onrender.com/api/health`
Should return: `{"message": "Patient Check-in API is running", "status": "healthy"}`

## 🔗 **Connect to Frontend**
1. Go to Netlify: https://app.netlify.com/projects/checkinpatient
2. Site settings → Environment variables
3. Add: `VITE_API_BASE_URL=https://your-render-app.onrender.com/api`
4. Trigger new deployment

## 🎉 **Done!**
Your complete system will be live!