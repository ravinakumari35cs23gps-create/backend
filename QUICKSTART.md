# 🚀 Quick Start Guide - Result Management System Backend

## ✅ What's Been Built

A complete, production-ready backend API for a Result Management System with:

### Core Features
- ✅ **Authentication System**: JWT-based auth with access & refresh tokens
- ✅ **Role-Based Access Control**: Admin, Teacher, Student roles
- ✅ **User Management**: Complete CRUD for users with role-specific profiles
- ✅ **Student Management**: Student records with class assignments
- ✅ **Results Management**: Mark entry, verification, report cards
- ✅ **Security**: Rate limiting, password hashing, input validation
- ✅ **Error Handling**: Comprehensive error handling system
- ✅ **Logging**: Winston-based structured logging
- ✅ **Testing**: Jest test framework setup
- ✅ **Docker Support**: Dockerfile and docker-compose configuration

### Database Models
1. **User**: Supports admin, teacher, and student roles
2. **Class**: Class management with students and subjects
3. **Subject**: Subject definition with marks configuration
4. **Result**: Student results with automatic grade calculation

### API Endpoints (30+ endpoints)
- Authentication (7 endpoints)
- Students (5 endpoints)
- Results (7 endpoints)

## 🛠️ Getting Started

### Option 1: Using Docker (Recommended)

```bash
cd backend
docker-compose up -d
```

Your API will be available at: `http://localhost:5000`

### Option 2: Local Development

#### Prerequisites
You need MongoDB running locally or use MongoDB Atlas

**Start MongoDB (Windows):**
```bash
# Install MongoDB from: https://www.mongodb.com/try/download/community
# Start MongoDB service
net start MongoDB
```

**Or use MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` file with your Atlas URI

#### Start the Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

## 📡 Testing the API

### Method 1: Import Postman Collection
1. Open Postman
2. Import `RMS-API.postman_collection.json`
3. Set `baseUrl` variable to `http://localhost:5000/api/v1`

### Method 2: cURL Commands

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Register Admin User:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin User\",\"email\":\"admin@rms.com\",\"password\":\"Admin123\",\"role\":\"admin\"}"
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@rms.com\",\"password\":\"Admin123\"}"
```

**Get Profile (replace TOKEN):**
```bash
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Method 3: Browser
Visit: `http://localhost:5000/health`

## 🎯 Next Steps

### 1. Connect Your Angular Frontend

Update your Angular service to point to the backend:

```typescript
// In your Angular app
const API_URL = 'http://localhost:5000/api/v1';

// Example login
login(email: string, password: string) {
  return this.http.post(`${API_URL}/auth/login`, { email, password });
}
```

### 2. Create Initial Admin Account

Use the registration endpoint or create directly in MongoDB:

```javascript
// Register via API
POST /api/v1/auth/register
{
  "name": "System Admin",
  "email": "admin@rms.com",
  "password": "SecurePassword123",
  "role": "admin"
}
```

### 3. Add More Features

The foundation is ready. You can now add:
- [ ] Class management endpoints
- [ ] Subject management endpoints
- [ ] Attendance tracking
- [ ] PDF report generation
- [ ] Email notifications
- [ ] File uploads
- [ ] Analytics dashboard
- [ ] Bulk operations

## 📂 Project Structure Overview

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, error handling, rate limiting
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── app.js           # Express setup
│   └── server.js        # Entry point
├── logs/                # Application logs
├── .env                 # Environment variables
├── Dockerfile           # Docker configuration
└── docker-compose.yml   # Docker Compose setup
```

## 🔑 Default Environment

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rms_db
NODE_ENV=development
```

## 📊 API Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description"
  }
}
```

## 🛡️ Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ Input Validation
- ✅ Role-Based Access Control

## 📚 Documentation

- **README.md**: Complete documentation
- **Postman Collection**: API testing
- **Code Comments**: Inline documentation

## 🐛 Troubleshooting

**MongoDB Connection Error:**
```
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- For Atlas, whitelist your IP address
```

**Port 5000 Already in Use:**
```
- Change PORT in .env file
- Or kill the process using port 5000
```

**JWT Errors:**
```
- Ensure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set
- Check token format: "Bearer <token>"
```

## 📞 Support

- Check logs in `logs/` directory
- Review error messages in console
- Test endpoints with Postman

## 🎉 You're Ready!

Your Result Management System backend is now ready to use. Start building your frontend integration or test the API endpoints!

**API Base URL**: `http://localhost:5000/api/v1`
**Health Check**: `http://localhost:5000/health`
