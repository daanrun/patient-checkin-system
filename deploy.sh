#!/bin/bash

# Patient Check-in System Deployment Script
# This script prepares the application for deployment

echo "🚀 Patient Check-in System - Deployment Preparation"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the frontend
echo "📦 Building frontend for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build successful!"

# Check if dist directory exists and has content
if [ ! -d "frontend/dist" ] || [ -z "$(ls -A frontend/dist)" ]; then
    echo "❌ Error: Frontend dist directory is empty or doesn't exist"
    exit 1
fi

# Verify important files exist
echo "🔍 Verifying deployment files..."

files_to_check=(
    "netlify.toml"
    "frontend/dist/_redirects"
    "frontend/.env.production"
    "DEPLOYMENT.md"
    "README.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

# Check backend files
echo "🔍 Verifying backend files..."

backend_files=(
    "backend/server.js"
    "backend/package.json"
    "backend/database/db.js"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

# Display deployment summary
echo ""
echo "🎉 Deployment preparation complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Commit and push your code to Git:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy frontend to Netlify:"
echo "   - Go to netlify.com"
echo "   - Create new site from Git"
echo "   - Select your repository"
echo "   - Netlify will auto-detect configuration"
echo ""
echo "3. Deploy backend to Railway/Render/Heroku:"
echo "   - See DEPLOYMENT.md for detailed instructions"
echo ""
echo "4. Update frontend environment variables:"
echo "   - Set VITE_API_BASE_URL to your backend URL"
echo "   - Trigger new deployment"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🌐 Your app will be available at:"
echo "   Frontend: https://your-site.netlify.app"
echo "   Backend:  https://your-backend.railway.app"
echo "   Admin:    https://your-site.netlify.app/admin"

# Display file sizes for reference
echo ""
echo "📊 Build Statistics:"
echo "==================="
echo "Frontend build size:"
du -sh frontend/dist/
echo ""
echo "Main files:"
ls -lh frontend/dist/assets/ 2>/dev/null || echo "No assets directory found"

echo ""
echo "✨ Ready for deployment! ✨"