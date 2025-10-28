# Azure Deployment Guide for DatChat Web App

This guide will walk you through deploying your DatChat application to Azure Web App Services using GitHub Actions.

## 📋 Prerequisites

- Azure account with active subscription
- GitHub account with your code repository
- VS Code with Azure extensions (optional but helpful)
- Two Azure Web App Services already created:
  - **Frontend (UI)**: `datchat-ui.azurewebsites.net`
  - **Backend (API)**: `datchat-api.azurewebsites.net`

---

## 🎯 Architecture Overview

\`\`\`
┌─────────────────┐         ┌──────────────────┐
│   GitHub Repo   │────────▶│  GitHub Actions  │
└─────────────────┘         └──────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
            ┌───────────────┐              ┌──────────────────┐
            │  Azure Web    │              │   Azure Web      │
            │  App (UI)     │─────────────▶│   App (Backend)  │
            │  Port 8080    │   API Calls  │   Port 8080      │
            └───────────────┘              └──────────────────┘
                    │                                 │
                    │                                 │
                    ▼                                 ▼
            Next.js Frontend              Node.js Express API
            (Standalone Build)            (SQL + OpenAI)
\`\`\`

---

## 📁 Project Structure

\`\`\`
datchat-webapp/
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml    # Backend deployment workflow
│       └── deploy-frontend.yml   # Frontend deployment workflow
├── backend/
│   ├── index.js                  # Main backend server
│   ├── package.json              # Backend dependencies
│   ├── web.config                # IIS configuration for Azure
│   └── ecosystem.config.cjs      # PM2 config (optional)
├── app/                          # Next.js pages
├── components/                   # React components
├── lib/
│   └── config.ts                 # API URL configuration
├── server.js                     # Custom Next.js server for Azure
├── web.config                    # Frontend IIS configuration
├── next.config.mjs               # Next.js configuration
└── package.json                  # Frontend dependencies
\`\`\`

---

## 🚀 Step-by-Step Deployment Instructions

### **STEP 1: Configure Azure Web App Services**

#### 1.1 Backend Web App Configuration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your **Backend Web App** (`datchat-api`)
3. Go to **Configuration** → **General settings**
   - **Stack**: Node
   - **Node version**: 20 LTS
   - **Startup Command**: `node index.js`
   - **Always On**: Enable this (important!)
4. Click **Save**

#### 1.2 Frontend Web App Configuration

1. Navigate to your **Frontend Web App** (`datchat-ui`)
2. Go to **Configuration** → **General settings**
   - **Stack**: Node
   - **Node version**: 20 LTS
   - **Startup Command**: `node server.js`
   - **Always On**: Enable this
3. Click **Save**

---

### **STEP 2: Set Environment Variables in Azure**

#### 2.1 Backend Environment Variables

1. Go to **Backend Web App** → **Configuration** → **Application settings**
2. Click **+ New application setting** for each variable:

\`\`\`
Name: OPEN_API_KEY
Value: github_pat_YOUR_ACTUAL_KEY_HERE

Name: DB_USER
Value: admin-sah-sa

Name: DB_PASSWORD
Value: YOUR_ACTUAL_PASSWORD_HERE

Name: DB_SERVER
Value: mssql-spends-analytics.database.windows.net

Name: DB_DATABASE
Value: db-spends-analytics-pnx-energy

Name: NODE_ENV
Value: production

Name: PORT
Value: 8080
\`\`\`

3. Click **Save** (this will restart the app)

#### 2.2 Frontend Environment Variables

1. Go to **Frontend Web App** → **Configuration** → **Application settings**
2. Add this variable:

\`\`\`
Name: NEXT_PUBLIC_API_URL
Value: https://datchat-api.azurewebsites.net

Name: NODE_ENV
Value: production

Name: PORT
Value: 8080
\`\`\`

3. Click **Save**

---

### **STEP 3: Get Azure Publish Profiles**

#### 3.1 Download Backend Publish Profile

1. Go to **Backend Web App** (`datchat-api`)
2. Click **Get publish profile** (top menu)
3. Save the downloaded `.PublishSettings` file
4. Open it in a text editor and **copy the entire contents**

#### 3.2 Download Frontend Publish Profile

1. Go to **Frontend Web App** (`datchat-ui`)
2. Click **Get publish profile**
3. Save and **copy the entire contents**

---

### **STEP 4: Configure GitHub Secrets**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

**Secret 1:**
\`\`\`
Name: AZURE_BACKEND_PUBLISH_PROFILE
Value: [Paste the entire contents of backend publish profile]
\`\`\`

**Secret 2:**
\`\`\`
Name: AZURE_FRONTEND_PUBLISH_PROFILE
Value: [Paste the entire contents of frontend publish profile]
\`\`\`

---

### **STEP 5: Push Code to GitHub**

If you haven't already pushed your code to GitHub:

\`\`\`bash
# In VS Code terminal, navigate to your project root
cd /path/to/datchat-webapp

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with Azure deployment setup"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to main branch
git push -u origin main
\`\`\`

---

### **STEP 6: Verify GitHub Actions**

1. Go to your GitHub repository
2. Click the **Actions** tab
3. You should see two workflows running:
   - ✅ **Deploy Backend to Azure**
   - ✅ **Deploy Frontend to Azure**

4. Click on each workflow to see the deployment progress
5. Wait for both to complete (green checkmark ✅)

---

### **STEP 7: Test Your Deployment**

#### 7.1 Test Backend

Open your browser and visit:
\`\`\`
https://datchat-api.azurewebsites.net/health
\`\`\`

You should see:
\`\`\`json
{
  "status": "healthy",
  "service": "Spend Analytix Backend",
  "version": "1.0.0",
  "timestamp": "2025-01-28T..."
}
\`\`\`

#### 7.2 Test Frontend

Visit:
\`\`\`
https://datchat-ui.azurewebsites.net/
\`\`\`

Your application should load successfully!

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Backend shows "Application Error"

**Solution**:
1. Go to Azure Portal → Backend Web App → **Log stream**
2. Check for errors
3. Common fixes:
   - Verify environment variables are set correctly
   - Check database connection string
   - Ensure `PORT` is set to `8080`
   - Verify startup command is `node index.js`

**Problem**: Database connection fails

**Solution**:
1. Check Azure SQL firewall rules
2. Add Azure Web App's outbound IP addresses to SQL firewall
3. Go to SQL Server → **Firewalls and virtual networks**
4. Add rule: `0.0.0.0` to `0.0.0.0` (allows all Azure services)

### Frontend Issues

**Problem**: Frontend loads but can't connect to backend

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` is set correctly in Azure
2. Verify CORS is enabled in backend (`cors()` middleware)
3. Check browser console for errors

**Problem**: "502 Bad Gateway" error

**Solution**:
1. Check if `server.js` exists in root directory
2. Verify startup command is `node server.js`
3. Check Log stream for Node.js errors

---

## 🔄 Making Updates

### Update Backend Only

\`\`\`bash
# Make changes to backend files
git add backend/
git commit -m "Update backend logic"
git push origin main
\`\`\`

The backend workflow will automatically deploy.

### Update Frontend Only

\`\`\`bash
# Make changes to frontend files
git add app/ components/ lib/
git commit -m "Update UI components"
git push origin main
\`\`\`

The frontend workflow will automatically deploy.

---

## 📊 Monitoring

### View Logs

**Backend Logs:**
\`\`\`
Azure Portal → datchat-api → Log stream
\`\`\`

**Frontend Logs:**
\`\`\`
Azure Portal → datchat-ui → Log stream
\`\`\`

### Application Insights (Optional)

1. Create Application Insights resource in Azure
2. Add connection string to Web App configuration
3. Monitor performance, errors, and usage

---

## 🎉 Success Checklist

- ✅ Both Web Apps created in Azure
- ✅ Environment variables configured in Azure
- ✅ GitHub secrets added (publish profiles)
- ✅ Code pushed to GitHub
- ✅ GitHub Actions workflows completed successfully
- ✅ Backend health check returns 200 OK
- ✅ Frontend loads in browser
- ✅ Chat functionality works end-to-end

---

## 💡 Pro Tips

1. **Always On**: Keep this enabled to prevent cold starts
2. **Scaling**: Use Azure's scale-up/scale-out features for production
3. **Custom Domains**: Add your own domain in Azure Web App settings
4. **SSL**: Azure provides free SSL certificates
5. **Staging Slots**: Use deployment slots for testing before production

---

## 🆘 Need Help?

If you encounter issues:

1. Check Azure Log Stream for real-time errors
2. Review GitHub Actions logs for deployment failures
3. Verify all environment variables are set correctly
4. Ensure database firewall allows Azure connections
5. Check that both Web Apps are running (not stopped)

---

## 📝 Environment Variables Reference

### Backend (.env equivalent in Azure)
\`\`\`
OPEN_API_KEY=github_pat_***
DB_USER=admin-sah-sa
DB_PASSWORD=***
DB_SERVER=mssql-spends-analytics.database.windows.net
DB_DATABASE=db-spends-analytics-pnx-energy
NODE_ENV=production
PORT=8080
\`\`\`

### Frontend (.env equivalent in Azure)
\`\`\`
NEXT_PUBLIC_API_URL=https://datchat-api.azurewebsites.net
NODE_ENV=production
PORT=8080
\`\`\`

---

**🎊 Congratulations! Your application is now running in Azure!**
