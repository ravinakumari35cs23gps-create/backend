# 🚦 MongoDB Setup Guide

## Current Issue
The backend is running but cannot connect to MongoDB:
```
Error connecting to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

## Solutions (Choose One)

---

## ✅ Option 1: Use MongoDB Atlas (Cloud - Recommended)

**Why**: No local installation needed, free tier available, always accessible

### Steps:

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select region closest to you
   - Click "Create"

3. **Setup Database Access**
   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - Create username: `rmsuser`
   - Create password: `RmsPass123` (save this!)
   - Select "Built-in Role": Read and write to any database
   - Click "Add User"

4. **Setup Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" (left menu)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://rmsuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Update Backend .env**
   ```bash
   # Open: c:\Users\Rabina\OneDrive\Desktop\firstApp\backend\.env
   
   # Replace the MONGODB_URI line with your Atlas connection string:
   MONGODB_URI=mongodb+srv://rmsuser:RmsPass123@cluster0.xxxxx.mongodb.net/rms_db?retryWrites=true&w=majority
   ```
   
   **Important**: Replace `<password>` with `RmsPass123` and `xxxxx` with your cluster ID

7. **Restart Backend**
   - The nodemon should auto-restart
   - Or press `rs` in the terminal
   - Look for: `MongoDB Connected: cluster0-shard-...`

---

## ✅ Option 2: Install MongoDB Locally (Windows)

**Why**: Full control, offline development, no cloud dependency

### Steps:

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Choose: Windows x64
   - Download the `.msi` installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Keep default data directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Finish installation

3. **Verify Installation**
   ```powershell
   # Check if MongoDB service is running
   Get-Service mongodb
   
   # If not running, start it:
   net start MongoDB
   ```

4. **Test Connection**
   ```powershell
   # Open MongoDB Shell
   mongosh
   
   # You should see: "Connected to: mongodb://localhost:27017"
   # Type: exit
   ```

5. **Your .env is Already Correct**
   ```
   MONGODB_URI=mongodb://localhost:27017/rms_db
   ```

6. **Restart Backend**
   - Backend will automatically connect
   - Look for: `MongoDB Connected: localhost`

---

## ✅ Option 3: Use Docker (Both Backend + MongoDB)

**Why**: Easiest setup, everything containerized, consistent environment

### Steps:

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Navigate to Backend**
   ```powershell
   cd c:\Users\Rabina\OneDrive\Desktop\firstApp\backend
   ```

3. **Start with Docker Compose**
   ```powershell
   docker-compose up -d
   ```

   This starts:
   - MongoDB container on port 27017
   - Backend container on port 5000

4. **Check Logs**
   ```powershell
   docker-compose logs -f backend
   ```

5. **Stop Containers**
   ```powershell
   docker-compose down
   ```

---

## 🔍 Verification

After choosing an option, verify the connection:

### Check Backend Logs
You should see:
```
✓ MongoDB Connected: <your-host>
✓ Server running in development mode on port 5000
```

### Test Health Endpoint
```powershell
# PowerShell
Invoke-WebRequest http://localhost:5000/health

# Or open in browser:
# http://localhost:5000/health
```

### Test API
```powershell
# Register a test user
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"name":"Test User","email":"test@test.com","password":"Test1234","role":"student"}'
```

---

## 📊 Recommendation

For **Development**: Use **MongoDB Atlas** (Option 1) - Quick, free, no installation
For **Production**: Use **MongoDB Atlas** with paid tier or managed hosting
For **Learning**: Use **Local MongoDB** (Option 2) - Full control, offline capability

---

## 🐛 Troubleshooting

### Issue: Still can't connect after Atlas setup
**Solution**: 
- Check Network Access allows your IP
- Verify connection string has correct password
- No `<` or `>` brackets in connection string

### Issue: Local MongoDB won't start
**Solution**:
```powershell
# Check if service exists
Get-Service mongodb

# Start service
net start MongoDB

# If error, reinstall MongoDB as Administrator
```

### Issue: Docker containers won't start
**Solution**:
- Ensure Docker Desktop is running
- Check ports 27017 and 5000 are not in use
- Run: `docker-compose down` then `docker-compose up -d`

---

## ✅ Once Connected

Your backend will be fully operational! You can then:
1. Test authentication endpoints
2. Create admin account
3. Use the Angular frontend
4. Import Postman collection for testing

**Next Step**: Choose your MongoDB option and follow the steps above!
