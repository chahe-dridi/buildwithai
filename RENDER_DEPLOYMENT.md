# 🚀 Deploy Tetris Game to Render

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at https://render.com (free tier available)
3. **All files committed** - Make sure all changes are pushed to GitHub

---

## 🔧 Render Configuration

### 1. Create New Web Service

Go to Render Dashboard → **New** → **Web Service**

### 2. Connect Your Repository

- Select your GitHub repository: `chahe-dridi/buildwithai`
- Click **Connect**

### 3. Configure Web Service Settings

| Setting | Value |
|---------|-------|
| **Name** | `tetris-game` (or your preferred name) |
| **Region** | Choose closest to your users |
| **Branch** | `master` |
| **Root Directory** | Leave empty |
| **Runtime** | `Python 3` |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn tetris_project.wsgi:application` |
| **Instance Type** | `Free` (or paid for better performance) |

---

## 🔐 Environment Variables

Click **Advanced** → **Add Environment Variable**

Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `SECRET_KEY` | Generate a new secret key | [Generator](https://djecrety.ir/) |
| `DEBUG` | `False` | Important for production! |
| `ALLOWED_HOSTS` | `your-app-name.onrender.com` | Replace with your Render URL |
| `PYTHON_VERSION` | `3.9.6` | Match your development version |

**Note**: `DATABASE_URL` is automatically provided by Render when you add a PostgreSQL database.

---

## 🗄️ Add PostgreSQL Database

1. In your Render Web Service, go to **Environment** tab
2. Scroll down to **Add Database**
3. Click **New PostgreSQL**
4. Configure:
   - **Name**: `tetris-db`
   - **Database**: Auto-generated
   - **User**: Auto-generated
   - **Region**: Same as your web service
   - **PostgreSQL Version**: `15` (latest)
   - **Instance Type**: `Free`
5. Click **Create Database**

Render will automatically:
- Create the database
- Add `DATABASE_URL` to your environment variables
- Link it to your web service

---

## 📦 Files Required (Already Created)

### ✅ `requirements.txt`
```txt
Django==4.2.7
gunicorn==21.2.0
whitenoise==6.6.0
psycopg2-binary==2.9.9
dj-database-url==2.1.0
python-decouple==3.8
```

### ✅ `build.sh`
```bash
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

### ✅ `settings.py` (Updated)
- Uses environment variables via `python-decouple`
- PostgreSQL for production, SQLite for development
- WhiteNoise for serving static files
- Security settings configured

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin master
```

### Step 2: Create Web Service on Render
1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Fill in settings (see configuration above)

### Step 3: Add PostgreSQL Database
1. From your web service page, click **Environment**
2. Scroll down and click **New PostgreSQL**
3. Create the database (free tier)

### Step 4: Set Environment Variables
Add the environment variables listed above in the Render dashboard

### Step 5: Deploy!
- Render will automatically start building
- Wait for build to complete (3-5 minutes)
- Your app will be live at: `https://your-app-name.onrender.com`

---

## 🎮 Post-Deployment

### Create Superuser (Admin)
1. Go to your Render dashboard
2. Click on your web service
3. Click **Shell** tab (or use Render Shell)
4. Run:
```bash
python manage.py createsuperuser
```

### Access Your App
- **Homepage**: https://your-app-name.onrender.com
- **Admin Panel**: https://your-app-name.onrender.com/admin
- **Play Game**: https://your-app-name.onrender.com/play/
- **Multiplayer**: https://your-app-name.onrender.com/multiplayer/

---

## 🔍 Troubleshooting

### Build Fails
- Check **Logs** tab in Render dashboard
- Common issues:
  - Missing dependencies in `requirements.txt`
  - Build script errors in `build.sh`
  - Python version mismatch

### App Crashes on Start
- Check **Logs** tab for error messages
- Common issues:
  - Missing `SECRET_KEY` environment variable
  - Wrong `ALLOWED_HOSTS` value
  - Database connection issues

### Static Files Not Loading
- Verify `STATIC_ROOT` is set in settings
- Check `build.sh` runs `collectstatic`
- Ensure WhiteNoise middleware is enabled

### Database Errors
- Make sure PostgreSQL database is created and linked
- Check `DATABASE_URL` is in environment variables
- Verify migrations ran successfully in build logs

---

## 🔒 Security Checklist

Before going live, ensure:
- ✅ `DEBUG = False` in production
- ✅ Strong `SECRET_KEY` (never commit to Git)
- ✅ `ALLOWED_HOSTS` is properly configured
- ✅ Database credentials are secure (use Render's PostgreSQL)
- ✅ `.env` file is in `.gitignore`
- ✅ Static files served via WhiteNoise
- ✅ HTTPS enabled (Render provides this automatically)

---

## 📊 Monitoring

### View Logs
```
Render Dashboard → Your Service → Logs
```

### Metrics
```
Render Dashboard → Your Service → Metrics
```
- CPU Usage
- Memory Usage
- Request Count
- Response Times

---

## 💰 Pricing (Free Tier Limits)

**Web Service (Free)**:
- 750 hours/month (sleeps after 15 min inactivity)
- 512 MB RAM
- Shared CPU
- Automatic SSL

**PostgreSQL (Free)**:
- 1 GB storage
- 90 days data retention
- Expires after 90 days (upgrade to keep)

**To avoid sleep**: Upgrade to paid plan ($7/month)

---

## 🔄 Auto-Deploy

Render automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update game features"
git push origin master
```

Render will:
1. Detect the push
2. Run build script
3. Deploy new version
4. Keep old version running until new one is ready
5. Switch traffic to new version

---

## 🎯 Quick Start Checklist

- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] Create Web Service
- [ ] Add PostgreSQL database
- [ ] Set environment variables
- [ ] Wait for build to complete
- [ ] Test deployed app
- [ ] Create superuser
- [ ] Share your game! 🎮

---

## 📝 Render Dashboard URLs

- **Dashboard**: https://dashboard.render.com
- **Services**: https://dashboard.render.com/services
- **Databases**: https://dashboard.render.com/databases
- **Settings**: https://dashboard.render.com/settings

---

## 🎉 Your App is Live!

Once deployed, share your game:
- Share URL: `https://your-app-name.onrender.com`
- QR codes work automatically
- Multiplayer rooms accessible from anywhere
- Leaderboards persist in PostgreSQL

**Congratulations! Your Tetris game is now live on the internet!** 🚀🎮✨
