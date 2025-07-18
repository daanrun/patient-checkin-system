# Patient Check-in System - Deployment Guide

This guide will help you deploy the Patient Check-in System to production using Netlify for the frontend and a cloud service for the backend.

## 🚀 Quick Deployment Overview

### Frontend (Netlify)
- ✅ **Ready to deploy** - Build files are in `frontend/dist/`
- ✅ **Configuration complete** - `netlify.toml` and `_redirects` files created
- ✅ **Environment variables** - Production config ready

### Backend (Cloud Service)
- ✅ **Production ready** - Express server with SQLite database
- ✅ **Security features** - Error handling and input validation
- ✅ **File uploads** - Local storage with security controls

## 📋 Step-by-Step Deployment

### Part 1: Deploy Frontend to Netlify

#### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Prepare the repository**
   ```bash
   # Make sure your code is committed to Git
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Connect your Git repository
   - Netlify will automatically detect the `netlify.toml` configuration
   - Click "Deploy site"

3. **Configure environment variables** (if needed)
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add `VITE_API_BASE_URL` with your backend URL (once deployed)

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and deploy**
   ```bash
   netlify login
   netlify deploy --prod --dir=frontend/dist
   ```

### Part 2: Deploy Backend to Cloud Service

#### Option A: Railway (Recommended)

1. **Prepare backend for Railway**
   ```bash
   # Create a start script in backend/package.json
   cd backend
   npm init -y  # if package.json doesn't exist
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set the root directory to `backend/`
   - Railway will automatically detect and deploy your Node.js app

3. **Configure environment variables**
   - In Railway dashboard, go to Variables
   - Add:
     - `NODE_ENV=production`
     - `PORT=5001` (Railway will override this)
     - `ALLOWED_ORIGINS=https://your-netlify-site.netlify.app`

#### Option B: Render

1. **Deploy to Render**
   - Go to [render.com](https://render.com) and sign in
   - Click "New" → "Web Service"
   - Connect your Git repository
   - Configure:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

2. **Configure environment variables**
   - Add the same variables as Railway above

#### Option C: Heroku

1. **Prepare for Heroku**
   ```bash
   # Create Procfile in backend directory
   echo "web: node server.js" > backend/Procfile
   ```

2. **Deploy to Heroku**
   ```bash
   # Install Heroku CLI and login
   heroku create your-app-name
   
   # Deploy backend subdirectory
   git subtree push --prefix backend heroku main
   ```

### Part 3: Connect Frontend to Backend

1. **Update frontend environment variables**
   - In Netlify dashboard, go to Site settings → Environment variables
   - Update `VITE_API_BASE_URL` with your deployed backend URL
   - Example: `https://your-backend.railway.app/api`

2. **Trigger a new frontend build**
   - In Netlify dashboard, go to Deploys
   - Click "Trigger deploy" → "Deploy site"

## 🔧 Configuration Files Explained

### `netlify.toml`
```toml
[build]
  base = "frontend/"           # Build from frontend directory
  publish = "dist/"           # Serve files from dist directory
  command = "npm run build"   # Build command

[[redirects]]
  from = "/*"                 # All routes
  to = "/index.html"         # Redirect to React app
  status = 200               # SPA routing
```

### `frontend/dist/_redirects`
```
# Handle React Router
/*    /index.html   200

# API proxy (optional)
/api/*  https://your-backend-url.com/api/:splat  200
```

### Environment Variables

#### Frontend (Netlify)
- `VITE_API_BASE_URL` - Backend API URL (e.g., `https://your-backend.railway.app/api`)

#### Backend (Railway/Render/Heroku)
- `NODE_ENV=production`
- `PORT` - Automatically set by hosting service
- `ALLOWED_ORIGINS` - Your Netlify site URL for CORS

## 🧪 Testing Your Deployment

### 1. Test Frontend
- Visit your Netlify site URL
- Navigate through all pages (Demographics → Insurance → Clinical Forms → Confirmation)
- Test admin interface at `/admin`
- Check mobile responsiveness

### 2. Test Backend
- Visit your backend health endpoint: `https://your-backend-url.com/api/health`
- Should return: `{"message": "Patient Check-in API is running", "status": "healthy"}`

### 3. Test Integration
- Complete a full patient check-in flow
- Verify data appears in admin interface
- Test file uploads (insurance card images)

## 🔒 Security Considerations

### Production Checklist
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS configured with specific origins (not `*`)
- [ ] Environment variables properly set
- [ ] Database backups configured (if using external DB)
- [ ] File upload limits and validation in place
- [ ] Error logging configured

### Recommended Security Headers
Already configured in `netlify.toml`:
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` with restricted sources

## 📊 Monitoring and Maintenance

### Netlify Monitoring
- Check deploy logs for build errors
- Monitor site analytics in Netlify dashboard
- Set up form notifications if needed

### Backend Monitoring
- Monitor application logs in your hosting service
- Set up uptime monitoring (e.g., UptimeRobot)
- Monitor database size and performance

### Regular Maintenance
- Update dependencies regularly
- Monitor for security vulnerabilities
- Backup database periodically
- Review and rotate API keys/secrets

## 🆘 Troubleshooting

### Common Issues

#### Frontend Issues
- **404 on page refresh**: Check `_redirects` file is in place
- **API calls failing**: Verify `VITE_API_BASE_URL` environment variable
- **Build failures**: Check Node.js version compatibility

#### Backend Issues
- **Server won't start**: Check environment variables and port configuration
- **Database errors**: Ensure SQLite file permissions are correct
- **CORS errors**: Verify `ALLOWED_ORIGINS` includes your frontend URL

#### Integration Issues
- **File uploads failing**: Check file size limits and storage permissions
- **Admin interface empty**: Verify backend API endpoints are accessible
- **Form submissions not saving**: Check database connection and table creation

### Getting Help
1. Check application logs in your hosting service dashboard
2. Test API endpoints directly using curl or Postman
3. Use browser developer tools to debug frontend issues
4. Check this repository's issues for common problems

## 🎉 Success!

Once deployed, your Patient Check-in System will be available at:
- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: `https://your-backend-url.com`
- **Admin Interface**: `https://your-site-name.netlify.app/admin`

The system is now ready for production use with:
- ✅ Secure HTTPS connections
- ✅ Mobile-responsive design
- ✅ Complete patient check-in workflow
- ✅ Admin interface for managing submissions
- ✅ File upload capabilities
- ✅ Production-ready error handling

## 📈 Next Steps

Consider these enhancements for your production deployment:
- Set up automated backups
- Implement user authentication for admin interface
- Add email notifications for new submissions
- Set up monitoring and alerting
- Consider migrating to PostgreSQL for larger scale
- Implement automated testing in CI/CD pipeline