# 🎮 Tetris - Full Stack Django Game

A fully-featured Tetris game built with Django, MongoDB, Django Channels, HTMX, and Alpine.js. Features single-player mode, multiplayer battles, leaderboards, and real-time gameplay.

## ✨ Features

### Core Gameplay
- 🎯 **Single Player Mode** - Classic Tetris with scoring and levels
- ⚔️ **Multiplayer Mode** - Real-time battles via WebSockets
- 🎨 **7 Tetromino Shapes** - All classic pieces with full rotation
- 👻 **Ghost Piece** - Preview where your piece will land
- 📦 **Hold Piece** - Save a piece for later use
- 🔊 **Sound Effects** - Audio feedback for moves and clears
- 🏆 **Leaderboard** - Track high scores (daily, weekly, all-time)

### Technical Features
- 🚀 **Server-Side Rendering** with Django Templates
- ⚡ **Real-time Updates** with Django Channels + WebSockets
- 🎨 **Modern UI** with TailwindCSS
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔐 **User Authentication** - Register, login, track your stats
- 📊 **MongoDB Database** - Flexible NoSQL storage

## 🛠️ Tech Stack

- **Backend**: Django 4.2+
- **Database**: MongoDB (via djongo)
- **Real-time**: Django Channels + Redis
- **Frontend**: Django Templates + HTMX + Alpine.js
- **Styling**: TailwindCSS (CDN)
- **Game Logic**: Vanilla JavaScript + HTML Canvas

## 📋 Prerequisites

- Python 3.8+
- MongoDB (local or MongoDB Atlas)
- Redis (for WebSocket support)

## 🚀 Quick Start (Windows PowerShell)

### 1. Clone and Setup Virtual Environment

```powershell
# Navigate to project directory
cd "c:\Users\DARK\Desktop\scripts\cur\New folder\buildwithai"

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Start MongoDB

Make sure MongoDB is running on `localhost:27017`. 

**Option A**: MongoDB installed locally
```powershell
# Start MongoDB service
net start MongoDB
```

**Option B**: Use MongoDB Atlas (cloud)
- Update `DATABASES` in `tetris_project/settings.py` with your Atlas connection string

### 4. Start Redis

Download and run Redis for Windows:
- Download from: https://github.com/microsoftarchive/redis/releases
- Extract and run: `redis-server.exe`

Or use WSL:
```powershell
wsl
sudo service redis-server start
exit
```

### 5. Run Migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional)

```powershell
python manage.py createsuperuser
```

### 7. Run the Server

```powershell
# For development with WebSocket support
daphne -p 8000 tetris_project.asgi:application
```

### 8. Open Your Browser

Navigate to: **http://localhost:8000**

## 🎮 How to Play

### Controls
- **← →** - Move left/right
- **↑** - Rotate clockwise
- **Z** - Rotate counter-clockwise
- **↓** - Soft drop (faster fall)
- **Space** - Hard drop (instant fall)
- **C** - Hold piece
- **P** - Pause game

### Scoring
- **Single (1 line)**: 100 points × level
- **Double (2 lines)**: 300 points × level
- **Triple (3 lines)**: 500 points × level
- **Tetris (4 lines)**: 800 points × level
- **Soft drop**: +1 point per row
- **Hard drop**: +2 points per row

### Multiplayer
1. Click **Multiplayer** in navigation
2. **Create Room** or **Join Room** with a code
3. Share room code with opponent
4. Battle! Clearing 2+ lines sends garbage to opponent
5. First to game over loses

## 📁 Project Structure

```
buildwithai/
├── tetris_project/          # Django project settings
│   ├── settings.py          # Configuration
│   ├── asgi.py              # ASGI config for Channels
│   └── urls.py              # Root URL config
├── game/                    # Game app
│   ├── models.py            # Database models
│   ├── views.py             # View functions
│   ├── urls.py              # Game URLs
│   ├── consumers.py         # WebSocket consumers
│   ├── routing.py           # WebSocket routing
│   └── admin.py             # Admin configuration
├── accounts/                # Authentication app
│   ├── views.py             # Login/register views
│   └── urls.py              # Account URLs
├── templates/               # HTML templates
│   ├── base/                # Base template
│   ├── game/                # Game templates
│   └── accounts/            # Account templates
├── static/                  # Static files
│   └── js/                  # JavaScript files
│       ├── tetrominoes.js   # Piece definitions
│       ├── sounds.js        # Sound effects
│       ├── game.js          # Main game engine
│       └── multiplayer-game.js  # Multiplayer logic
├── manage.py                # Django management
└── requirements.txt         # Python dependencies
```

## 🔧 Configuration

### Environment Variables

For production, set these environment variables:

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=mongodb://username:password@host:port/database
REDIS_URL=redis://localhost:6379
```

### Database Configuration

Edit `tetris_project/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'tetris_db',
        'CLIENT': {
            'host': 'mongodb://localhost:27017',
        }
    }
}
```

### Redis Configuration

```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}
```

## 🐳 Docker Deployment

### Build and Run

```powershell
docker-compose up --build
```

This starts:
- Django app (port 8000)
- MongoDB (port 27017)
- Redis (port 6379)

## 📊 Admin Panel

Access the admin panel at: **http://localhost:8000/admin**

Manage:
- User profiles
- Game sessions
- Leaderboard entries
- Multiplayer rooms

## 🧪 Testing

Run tests:

```powershell
python manage.py test
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `net start MongoDB`
- Check connection string in settings.py

### Redis Connection Error
- Ensure Redis is running
- Check CHANNEL_LAYERS configuration

### WebSocket Not Working
- Make sure you're using `daphne` instead of `runserver`
- Check Redis is running and accessible

### Import Error with djongo
- Try: `pip install pymongo==3.12.3`
- Djongo requires specific pymongo version

## 📝 Development Commands

```powershell
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (for production)
python manage.py collectstatic

# Run development server (without WebSockets)
python manage.py runserver

# Run with WebSocket support
daphne -p 8000 tetris_project.asgi:application
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- [ ] Mobile touch controls
- [ ] Tournament mode
- [ ] Power-ups and special pieces
- [ ] Custom themes and skins
- [ ] Achievement system
- [ ] Replay system
- [ ] AI opponent
- [ ] Voice chat in multiplayer

## 💡 Credits

Built with ❤️ using Django, MongoDB, and modern web technologies.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Django and Channels docs

---

**Happy Gaming! 🎮**
