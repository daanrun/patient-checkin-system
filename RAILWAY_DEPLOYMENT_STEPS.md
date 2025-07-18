# 🚂 Railway Backend Deployment - Step by Step

## ✅ **GitHub Repository Ready**
Your code is now live at: **https://github.com/daanrun/patient-checkin-system**

## 🚀 **Deploy Backend to Railway (Web Interface)**

### Step 1: Access Railway Dashboard
1. Go to: **https://railway.com/dashboard**
2. You should see your project: **patientcheckin**
3. Click on the project

### Step 2: Deploy from GitHub
1. Click **"Deploy from GitHub repo"** or **"New Service"**
2. Select **"GitHub Repo"**
3. Choose: **daanrun/patient-checkin-system**
4. **IMPORTANT**: Set **Root Directory** to: `backend`
5. Click **"Deploy"**

### Step 3: Configure Environment Variables
Once deployed, add these environment variables:

1. Click on your service
2. Go to **"Variables"** tab
3. Add these variables:
   ```
   NODE_ENV=production
   ALLOWED_ORIGINS=https://checkinpatient.netlify.app
   PORT=5001
   ```

### Step 4: Get Your Backend URL
1. Go to **"Settings"** tab
2. Click **"Generate Domain"** 
3. Copy the generated URL (something like: `https://your-app.railway.app`)

## 🔗 **Connect Frontend to Backend**

### Step 5: Update Netlify Environment Variables
1. Go to: **https://app.netlify.com/projects/checkinpatient**
2. Click **"Site settings"**
3. Go to **"Environment variables"**
4. Click **"Add variable"**
5. Add:
   ```
   Key: VITE_API_BASE_URL
   Value: https://your-railway-app.railway.app/api
   ```
   (Replace with your actual Railway URL)

### Step 6: Redeploy Frontend
1. Go to **"Deploys"** tab in Netlify
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete

## 🧪 **Test Your Live Application**

### Test Backend
Visit: `https://your-railway-app.railway.app/api/health`
Should return: `{"message": "Patient Check-in API is running", "status": "healthy"}`

### Test Frontend
Visit: **https://checkinpatient.netlify.app**
- Complete a patient check-in flow
- Check admin interface at `/admin`
- Verify data is being saved

## 🎉 **Success!**

Your complete Patient Check-in System will be live with:
- ✅ **Frontend**: https://checkinpatient.netlify.app
- ✅ **Backend**: https://your-app.railway.app
- ✅ **Admin**: https://checkinpatient.netlify.app/admin

## 🆘 **Troubleshooting**

### If Railway deployment fails:
- Check that root directory is set to `backend`
- Verify package.json exists in backend folder
- Check Railway logs for error messages

### If frontend can't connect to backend:
- Verify VITE_API_BASE_URL is set correctly
- Make sure it ends with `/api`
- Trigger new Netlify deployment after adding variables

### If CORS errors occur:
- Verify ALLOWED_ORIGINS includes your Netlify URL
- Make sure there are no trailing slashes

## 📞 **Need Help?**
- Railway logs: Check your Railway dashboard
- Netlify logs: Check your Netlify deploy logs
- API testing: Use browser dev tools or Postman

**You're almost there! Just a few clicks in the Railway web interface!**