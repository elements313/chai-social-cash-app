# 🚀 Azure Deployment Guide

This guide will help you deploy the Cash Tracker PWA to Azure using GitHub Actions.

## 📋 Prerequisites

1. **Azure Account** with active subscription
2. **GitHub Repository** (already done ✅)
3. **Azure CLI** (optional, for manual setup)

## 🔧 Step 1: Create Azure App Service

### Option A: Using Azure Portal (Recommended)
1. **Go to [Azure Portal](https://portal.azure.com)**
2. **Create Resource** → **App Service**
3. **Fill in the details:**
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `chai-social-cash-app` (must be globally unique)
   - **Publish**: `Code`
   - **Runtime Stack**: `Node 18 LTS`
   - **Operating System**: `Linux`
   - **Region**: Choose closest to your users
   - **Pricing Plan**: `Free F1` (for testing) or `Basic B1` (for production)

4. **Click Review + Create** → **Create**

### Option B: Using Azure CLI
```bash
# Login to Azure
az login

# Create resource group
az group create --name chai-social-rg --location "East US"

# Create App Service plan
az appservice plan create --name chai-social-plan --resource-group chai-social-rg --sku F1 --is-linux

# Create Web App
az webapp create --resource-group chai-social-rg --plan chai-social-plan --name chai-social-cash-app --runtime "NODE:18-lts"
```

## 🔑 Step 2: Get Publish Profile

1. **Go to your App Service** in Azure Portal
2. **Click "Get publish profile"** (download button in overview)
3. **Save the downloaded file** - you'll need its contents

## 🔒 Step 3: Set up GitHub Secrets

1. **Go to your GitHub repository**: `https://github.com/elements313/chai-social-cash-app`
2. **Click Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Create secret:**
   - **Name**: `AZUREAPPSERVICE_PUBLISHPROFILE`
   - **Value**: Paste the entire contents of the downloaded publish profile file
5. **Click "Add secret"**

## 🚀 Step 3: Deploy

### Automatic Deployment
Once you commit and push the workflow files to your repository:

```bash
# Add and commit the workflow files
git add .github/
git add AZURE_DEPLOYMENT.md
git add server/server.js
git commit -m "Add Azure deployment workflow

- GitHub Actions workflow for automated deployment
- Azure-optimized server configuration
- Production-ready deployment setup

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

The deployment will trigger automatically on:
- ✅ Push to `main` branch
- ✅ Pull request to `main` branch

### Manual Deployment
You can also trigger the deployment manually:
1. **Go to Actions tab** in your GitHub repository
2. **Click "Deploy to Azure App Service"**
3. **Click "Run workflow"**

## 📊 Step 4: Verify Deployment

1. **Check GitHub Actions**:
   - Go to **Actions** tab in your repository
   - Verify the workflow completed successfully

2. **Test your deployed app**:
   - Visit: `https://chai-social-cash-app.azurewebsites.net`
   - Or: `https://YOUR_APP_NAME.azurewebsites.net`

3. **Check Azure logs** if needed:
   - Go to App Service → **Log stream**

## 🔧 Configuration

### Environment Variables
If you need to add environment variables:
1. **Azure Portal** → **App Service** → **Configuration**
2. **Application settings** → **New application setting**
3. Add variables like:
   - `NODE_ENV=production`
   - `PORT=8080` (Azure will set this automatically)

### Custom Domain (Optional)
1. **App Service** → **Custom domains**
2. **Add custom domain**
3. Follow Azure's instructions for DNS setup

## 🗄️ Database Considerations

### Current Setup
- Uses **SQLite** database (file-based)
- Database file is created automatically
- ⚠️ **Note**: SQLite files may be lost during deployments

### Production Recommendations
For production, consider upgrading to:
1. **Azure Database for PostgreSQL**
2. **Azure SQL Database**
3. **CosmosDB**

## 📈 Monitoring & Troubleshooting

### Application Insights
1. **App Service** → **Application Insights**
2. **Enable** Application Insights
3. Monitor performance, errors, and usage

### Common Issues
1. **Build Failures**:
   - Check GitHub Actions logs
   - Verify package.json dependencies

2. **Runtime Errors**:
   - Check Azure Log Stream
   - Verify environment variables

3. **File Upload Issues**:
   - Ensure upload directory permissions
   - Consider Azure Blob Storage for production

## 🔄 Continuous Deployment

The GitHub Actions workflow automatically:
- ✅ **Installs dependencies**
- ✅ **Builds React app**
- ✅ **Creates deployment package**
- ✅ **Deploys to Azure**
- ✅ **Configures IIS settings**

## 🎯 What Gets Deployed

```
deployment/
├── index.html          (React app entry point)
├── static/             (CSS, JS, assets)
├── server.js           (Express backend)
├── package.json        (Production dependencies)
└── web.config          (IIS/Azure configuration)
```

## 💰 Cost Estimation

- **Free Tier (F1)**: $0/month (limited resources, good for testing)
- **Basic (B1)**: ~$13/month (better for production)
- **Standard (S1)**: ~$56/month (auto-scaling, custom domains)

## 🔄 Updates

To update your deployed app:
1. **Make changes** to your code
2. **Commit and push** to main branch
3. **GitHub Actions** will automatically redeploy

---

**Your Cash Tracker PWA will be available at:**
**https://chai-social-cash-app.azurewebsites.net** 🎉