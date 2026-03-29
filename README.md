# rosterLoop

A modern web application for creating and managing fair cleaning rosters in shared households.

## 🎯 Overview

**rosterLoop** is a full-stack web application that automatically generates and displays rotating cleaning schedules for shared flats. It eliminates arguments about who should clean by providing an algorithmic, fair rotation system.

### Key Features

- ✅ **User Authentication** - Secure signup/login with JWT tokens
- 📅 **Automated Scheduling** - Fair round-robin cleaning rotation
- 🏠 **Household Management** - Create and manage household rosters
- 📊 **Monthly Calendar View** - Visual schedule display
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔐 **Secure API** - Protected endpoints with role-based access

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Java 21
- Spring Boot 4.0.0
- PostgreSQL
- JWT (JSON Web Tokens)
- Spring Security

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios

### Project Structure

```
rosterLoop/
├── rosterloop/              # Backend (Spring Boot)
│   ├── src/main/java/
│   │   └── com/rosterloop/rosterloop/
│   │       ├── entity/          # Database models (User, Household)
│   │       ├── repository/      # Data access layer
│   │       ├── service/         # Business logic
│   │       ├── controller/      # REST endpoints
│   │       ├── security/        # JWT & auth filters
│   │       └── config/          # Spring configuration
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/        # Database migrations
│   └── pom.xml                  # Maven dependencies
├── frontend/                # Frontend (Next.js)
│   ├── app/
│   │   ├── components/      # React components
│   │   ├── context/         # Auth context
│   │   ├── utils/           # API & utilities
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   └── roster/          # Roster pages
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml       # Docker configuration
├── Jenkinsfile             # CI/CD pipeline
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Java 21+
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rosterLoop
   ```

2. **Setup Database**
   ```bash
   createdb households
   ```

3. **Start Backend**
   ```bash
   cd rosterloop
   ./mvnw spring-boot:run
   ```
   Backend runs on `http://localhost:8080`

4. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

5. **Access Application**
   - Open http://localhost:3000 in your browser
   - Sign up for a new account
   - Create your household and cleaning schedule!

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Detailed setup and testing guide
- **[AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md)** - Authentication system details
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Summary of changes and features

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for stateless authentication:

### Authentication Flow

1. **Sign Up**: Create a new account with email, password, name
2. **Login**: Authenticate with email and password
3. **Token**: Receive JWT token valid for 24 hours
4. **Requests**: Include token in Authorization header
5. **Access**: Protected endpoints verify token signature

### Endpoints

**Public:**
- `POST /rosterloop/api/auth/signup` - Create new account
- `POST /rosterloop/api/auth/login` - Login

**Protected:**
- `GET /rosterloop/api/households/{id}` - Get household
- `POST /rosterloop/api/households` - Create household

For details, see [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md)

## 📋 Features

### Current

- ✅ User authentication (signup/login/logout)
- ✅ Household creation and management
- ✅ Weekly rotating cleaning schedule
- ✅ Monthly calendar view
- ✅ Current week responsibility display
- ✅ Ownership-based access control

### Planned

- 🔄 Email notifications and reminders
- 🔄 Task management and checklists
- 🔄 Performance tracking and ratings
- 🔄 Schedule adjustments and swaps
- 🔄 Multi-user household invitations
- 🔄 Analytics and insights

See [enhancements.txt](./enhancements.txt) for full feature roadmap.

## 🔧 Configuration

### Environment Variables

**Backend** (`application.properties`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/households
spring.datasource.username=postgres
app.jwtSecret=<your-secret-key>
app.jwtExpirationMs=86400000
```

**Frontend**: 
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🧪 Testing

### Test Account
```
Email: test@example.com
Password: TestPassword123
First Name: Test
Last Name: User
```

1. **Signup**: Go to http://localhost:3000/signup and create account
2. **Login**: Go to http://localhost:3000/login with credentials
3. **Create Household**: Fill form to add flatmates
4. **View Schedule**: See the monthly calendar and cleaning assignments

## 🐳 Docker Support

The application includes Docker configuration:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Spring Boot backend
- Next.js frontend

## 📊 API Examples

### Sign Up
```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

Response includes JWT token to use in future requests.

## 🔒 Security

- **Password Hashing**: BCrypt with 10 rounds
- **Token Signing**: HS256 algorithm
- **CORS**: Configured for allowed origins
- **SQL Injection**: Protected via parameterized queries
- **XSS Protection**: React escaping and content security

⚠️ **Production Considerations**:
- Use strong, randomly-generated JWT secret
- Enable HTTPS/TLS
- Set environment-specific CORS origins
- Implement rate limiting
- Use httpOnly cookies instead of localStorage
- Enable email verification

## 🚨 Troubleshooting

### Can't connect to database
```bash
# Check PostgreSQL is running
psql -U postgres -d households

# Or start with docker
docker-compose up postgres
```

### Port already in use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or change port in application.properties
server.port=9090
```

### CORS errors
- Verify frontend URL matches CORS configuration
- Check SecurityConfig.java allowed origins
- Restart backend after changes

### Authentication fails
- Verify email/password combination
- Check user exists: `SELECT * FROM users;`
- Check JWT secret in application.properties

## 📞 Support

For issues or questions:
1. Check the [documentation files](./AUTH_IMPLEMENTATION.md)
2. Review error logs in console/DevTools
3. Verify all prerequisites are installed
4. Check database connectivity

## 📄 License

[See LICENSE file](./LICENSE)

## 👥 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🗺️ Roadmap

1. **Phase 1** ✅ - User Authentication
2. **Phase 2** 🔄 - Notifications & Reminders
3. **Phase 3** 🔄 - Task Management
4. **Phase 4** 🔄 - Analytics & Insights
5. **Phase 5** 🔄 - Mobile App

---

**Last Updated**: March 2026
**Status**: Active Development

For the latest updates, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)