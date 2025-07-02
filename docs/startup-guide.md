# OmnisecAI Platform Startup Guide

This guide provides step-by-step instructions to start the OmnisecAI platform across all supported platforms: Web App (Docker), Mobile App, and Desktop App.

## Prerequisites

Before starting any application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**

For mobile development:
- **React Native CLI**: `npm install -g @react-native-community/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 1. Web Application (Docker Setup)

### Quick Start with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone https://github.com/omnisecai/omnisecai-platform.git
   cd omnisecai-platform
   ```

2. **Start the complete stack:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Database (PostgreSQL)**: localhost:5432
   - **Redis**: localhost:6379

### Manual Docker Setup

If you prefer to run components separately:

1. **Build and run the backend:**
   ```bash
   cd backend
   docker build -t omnisecai-backend .
   docker run -p 5000:5000 --env-file .env omnisecai-backend
   ```

2. **Build and run the frontend:**
   ```bash
   cd frontend
   docker build -t omnisecai-frontend .
   docker run -p 3000:3000 omnisecai-frontend
   ```

3. **Run PostgreSQL:**
   ```bash
   docker run -d \
     --name omnisecai-postgres \
     -e POSTGRES_DB=omnisecai \
     -e POSTGRES_USER=omnisecai \
     -e POSTGRES_PASSWORD=secure_password \
     -p 5432:5432 \
     postgres:15
   ```

4. **Run Redis:**
   ```bash
   docker run -d \
     --name omnisecai-redis \
     -p 6379:6379 \
     redis:alpine
   ```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://omnisecai:secure_password@localhost:5432/omnisecai

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key

# API
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Development Mode

For development with hot reloading:

```bash
# Start backend in development mode
cd backend
npm install
npm run dev

# Start frontend in development mode (new terminal)
cd frontend
npm install
npm run dev
```

---

## 2. Mobile Application (React Native)

### Android Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Start Metro bundler:**
   ```bash
   npm start
   ```

3. **Run on Android device/emulator:**
   ```bash
   # Make sure Android emulator is running or device is connected
   npm run android
   ```

### iOS Setup (macOS only)

1. **Install iOS dependencies:**
   ```bash
   cd mobile
   npm install
   cd ios
   pod install
   cd ..
   ```

2. **Start Metro bundler:**
   ```bash
   npm start
   ```

3. **Run on iOS simulator/device:**
   ```bash
   npm run ios
   ```

### Development Configuration

Create `mobile/.env`:

```env
API_BASE_URL=http://localhost:5000
WS_URL=ws://localhost:5000
ENVIRONMENT=development
```

For physical devices, replace `localhost` with your computer's IP address:

```env
API_BASE_URL=http://192.168.1.100:5000
WS_URL=ws://192.168.1.100:5000
```

### Build for Production

**Android:**
```bash
cd mobile
npm run build:android
# APK will be generated in android/app/build/outputs/apk/release/
```

**iOS:**
```bash
cd mobile
npm run build:ios
# Open ios/OmnisecAIMobile.xcworkspace in Xcode to archive
```

---

## 3. Desktop Application (Electron)

### Development Mode

1. **Install dependencies:**
   ```bash
   cd desktop
   npm install
   ```

2. **Start in development mode:**
   ```bash
   npm run dev
   ```

This will:
- Start the main Electron process with hot reloading
- Start the renderer development server
- Open the desktop application window

### Build for Production

**Build for current platform:**
```bash
cd desktop
npm run dist
```

**Build for specific platforms:**
```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

Built applications will be in the `desktop/release/` directory.

### Development Configuration

The desktop app will automatically connect to:
- **Development**: http://localhost:3000 (if web app is running)
- **Production**: Bundled renderer files

---

## Complete Development Workflow

To run the entire development environment:

1. **Start the backend services:**
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Start the backend API:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Start the mobile app (new terminal):**
   ```bash
   cd mobile
   npm start
   # Then run: npm run android or npm run ios
   ```

5. **Start the desktop app (new terminal):**
   ```bash
   cd desktop
   npm run dev
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Frontend (3000), Backend (5000), PostgreSQL (5432), Redis (6379)
   - Change ports in configuration files if needed

2. **Database connection errors:**
   - Ensure PostgreSQL is running: `docker ps`
   - Check connection string in `.env`

3. **Mobile app not connecting:**
   - Use your computer's IP address instead of localhost
   - Check firewall settings

4. **Desktop app blank screen:**
   - Ensure frontend is running on port 3000
   - Check Electron developer tools (Ctrl+Shift+I)

### Logs and Debugging

- **Backend logs**: Check terminal where `npm run dev` is running
- **Frontend logs**: Check browser developer tools
- **Mobile logs**: Use `npx react-native log-android` or `npx react-native log-ios`
- **Desktop logs**: Check Electron developer tools or `~/.config/OmnisecAI/logs/`

### Support

For additional support:
- Check the [GitHub Issues](https://github.com/omnisecai/omnisecai-platform/issues)
- Review the [API Documentation](https://docs.omnisecai.com)
- Contact support at support@omnisecai.com