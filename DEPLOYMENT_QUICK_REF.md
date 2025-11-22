# 🎮 Tetris Game - Render Deployment Quick Reference

## 📝 Render Settings (Copy & Paste)

### Web Service Configuration:
```
Name: tetris-game
Runtime: Python 3
Root Directory: (leave empty)
Build Command: ./build.sh
Start Command: gunicorn tetris_project.wsgi:application
```

### Environment Variables:
```
SECRET_KEY=<generate-at-https://djecrety.ir/>
DEBUG=False
ALLOWED_HOSTS=tetris-game.onrender.com
PYTHON_VERSION=3.9.6
```

### PostgreSQL Database:
```
Name: tetris-db
PostgreSQL Version: 15
Instance Type: Free
```

## 🚀 One-Time Setup Commands:

### 1. Make build script executable (local):
```bash
chmod +x build.sh
```

### 2. After deployment, create admin user (Render Shell):
```bash
python manage.py createsuperuser
```

## ✅ Pre-Deployment Checklist:
- [ ] All code committed and pushed to GitHub
- [ ] `requirements.txt` updated
- [ ] `build.sh` created
- [ ] `settings.py` updated for production
- [ ] `.env` variables documented

## 🔗 Quick Links:
- Render Dashboard: https://dashboard.render.com
- Secret Key Generator: https://djecrety.ir/
- Django Docs: https://docs.djangoproject.com/

---

**Ready to deploy?** Follow `RENDER_DEPLOYMENT.md` for full instructions!
