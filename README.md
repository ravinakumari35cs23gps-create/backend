# Result Management System - Backend API

A robust, secure, and scalable backend API for managing educational results, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Teacher, Student)
- **User Management**: Complete user lifecycle management with role-specific profiles
- **Student Management**: CRUD operations for student records
- **Results Management**: Mark entry, verification, and report card generation
- **Security**: Rate limiting, input validation, password hashing, CORS protection
- **API Documentation**: RESTful API with consistent response format
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Logging**: Winston-based structured logging
- **Testing**: Jest and Supertest for unit and integration tests
- **Containerization**: Docker support with docker-compose

## 📋 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Containerization**: Docker

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   └── resultController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── Subject.js
│   │   └── Result.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   └── resultRoutes.js
│   ├── utils/           # Utility functions
│   │   ├── apiResponse.js
│   │   ├── errors.js
│   │   ├── jwt.js
│   │   └── logger.js
│   ├── __tests__/       # Test files
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── logs/                # Log files
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Local Development Setup

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB** (if using local MongoDB)
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

5. **Run the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Docker Setup

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000

2. **View logs**
```bash
docker-compose logs -f backend
```

3. **Stop containers**
```bash
docker-compose down
```

## 📡 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/refresh` | Refresh access token | Public |
| POST | `/logout` | Logout user | Private |
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update profile | Private |
| PUT | `/change-password` | Change password | Private |

### Students (`/api/v1/students`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all students | Admin, Teacher |
| GET | `/:id` | Get student by ID | Admin, Teacher |
| POST | `/` | Create student | Admin |
| PUT | `/:id` | Update student | Admin |
| DELETE | `/:id` | Delete student | Admin |

### Results (`/api/v1/results`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/enter-marks` | Enter marks | Admin, Teacher |
| GET | `/` | Get results (filtered) | All authenticated |
| GET | `/:id` | Get result by ID | All authenticated |
| GET | `/report-card/:studentId/:year/:term` | Get report card | All authenticated |
| PUT | `/:id` | Update result | Admin, Teacher |
| PUT | `/:id/verify` | Verify result | Admin |
| DELETE | `/:id` | Delete result | Admin |

## 🔐 Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "student",
  "phone": "+1234567890"
}
```

2. **Login**: `POST /api/v1/auth/login`
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

3. **Use Access Token**: Include in Authorization header
```
Authorization: Bearer <accessToken>
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🌱 Data Migration (Seeder)

To migrate data from local MongoDB to MongoDB Atlas:

1. Ensure you have data in your local MongoDB database
2. Update the MongoDB Atlas connection string in your `.env` file
3. Run the seeder script:

```bash
npm run seed
```

This will copy all data from your local MongoDB to the MongoDB Atlas cluster.

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation using Joi
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers protection
- **Error Handling**: Safe error messages (no stack traces in production)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/rms_db |
| `JWT_ACCESS_SECRET` | JWT access token secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - |
| `JWT_ACCESS_EXPIRY` | Access token expiry | 15m |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | 7d |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds | 10 |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:4200 |
| `LOG_LEVEL` | Logging level | info |

## 🚀 Deployment

### Using Docker

```bash
docker build -t rms-backend .
docker run -p 5000:5000 --env-file .env rms-backend
```

### Using Docker Compose

```bash
docker-compose up -d
```

## 📈 Monitoring & Logging

Logs are stored in the `logs/` directory:
- `error.log`: Error level logs
- `all.log`: All logs

Log format includes:
- Timestamp
- Log level
- Message
- Context (path, method, etc.)

## 🛡️ Best Practices Implemented

- ✅ Environment-based configuration
- ✅ Centralized error handling
- ✅ Structured logging
- ✅ Input validation
- ✅ Rate limiting
- ✅ Security headers
- ✅ Password hashing
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Database indexing
- ✅ Graceful shutdown
- ✅ Health check endpoint

## 📚 Next Steps

To extend this system, consider adding:
- [ ] Email notifications (Nodemailer)
- [ ] SMS notifications (Twilio)
- [ ] PDF report generation (Puppeteer/PDFKit)
- [ ] File upload (AWS S3/Multer)
- [ ] Redis caching
- [ ] OpenAPI/Swagger documentation
- [ ] Background jobs (BullMQ)
- [ ] Analytics endpoints
- [ ] Attendance tracking
- [ ] Real-time notifications (Socket.io)

## 📄 License

MIT License

## 👥 Support

For issues and questions, please create an issue in the repository.
