# 🚀 Quick Reference Card - rosterLoop Authentication

## Getting Started (30 seconds)

```bash
# Terminal 1: Start Backend
cd rosterloop && ./mvnw spring-boot:run

# Terminal 2: Start Frontend  
cd frontend && npm install && npm run dev
```

Then open http://localhost:3000

---

## Key URLs

| Page | URL |
|------|-----|
| Frontend | http://localhost:3000 |
| Signup | http://localhost:3000/signup |
| Login | http://localhost:3000/login |
| Roster | http://localhost:3000/roster/{id} |
| Backend API | http://localhost:8080/rosterloop/api |

---

## Authentication Endpoints

### Sign Up (Public)
```
POST /rosterloop/api/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login (Public)
```
POST /rosterloop/api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Create Household (Protected)
```
POST /rosterloop/api/households
Authorization: Bearer <token>
{
  "id": "uuid",
  "flatmateNames": ["Alice", "Bob"],
  "householdName": "My Apartment"
}
```

### Get Household (Protected)
```
GET /rosterloop/api/households/{id}
Authorization: Bearer <token>
```

---

## Test Credentials

```
Email:     test@example.com
Password:  TestPassword123
First:     Test
Last:      User
```

---

## Default Configuration

| Setting | Value |
|---------|-------|
| Backend Port | 8080 |
| Frontend Port | 3000 |
| JWT Expiration | 24 hours |
| Database | localhost:5432/households |
| Password Algorithm | BCrypt (10 rounds) |
| Token Algorithm | HS256 |

---

## Important Files

### Backend
- **User Entity**: `rosterloop/src/.../entity/User.java`
- **Auth Service**: `rosterloop/src/.../service/AuthService.java`
- **Security Config**: `rosterloop/src/.../config/SecurityConfig.java`
- **Auth Controller**: `rosterloop/src/.../controller/AuthController.java`

### Frontend
- **Auth Context**: `frontend/app/context/AuthContext.tsx`
- **Login Page**: `frontend/app/login/page.tsx`
- **Signup Page**: `frontend/app/signup/page.tsx`

### Documentation
- **QUICK_START.md** - Setup instructions
- **AUTH_IMPLEMENTATION.md** - Technical details
- **FINAL_SUMMARY.md** - Complete overview

---

## Common Commands

### Database
```bash
# Connect to database
psql -U postgres -d households

# View users
SELECT email, first_name, last_name, created_at FROM users;

# View households
SELECT id, owner_id FROM households;
```

### Maven
```bash
# Build
./mvnw clean build

# Run
./mvnw spring-boot:run

# Test
./mvnw test
```

### NPM
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | `lsof -ti:8080 \| xargs kill -9` |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| DB connection error | Start PostgreSQL: `brew services start postgresql` |
| CORS error | Check SecurityConfig.java allowed origins |
| Token expired | Log in again (24-hour expiration) |
| Can't find user | Check email spelling and case sensitivity |

---

## Feature Checklist

- ✅ User registration
- ✅ User login
- ✅ User logout
- ✅ JWT authentication
- ✅ Protected endpoints
- ✅ Owner verification
- ✅ Password hashing
- ✅ Session persistence
- ✅ Error handling
- ✅ Form validation

---

## Architecture Overview

```
[Browser]
    ↓
[Next.js Frontend]
    ↓
[Axios + JWT Token]
    ↓
[Spring Boot Backend]
    ↓
[JWT Filter]
    ↓
[Security Config]
    ↓
[Protected Endpoints]
    ↓
[Database: PostgreSQL]
```

---

## Security Quick Reference

| Layer | Implementation |
|-------|-----------------|
| Password | BCrypt (10 rounds) |
| API Token | JWT HS256 |
| Token Storage | localStorage |
| Token Expiry | 24 hours |
| CORS | Whitelisted origins |
| Ownership | User ID verification |
| Validation | Frontend + Backend |

---

## Response Examples

### Successful Login
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Error Response
```json
{
  "status": 401,
  "message": "Invalid email or password"
}
```

---

## Next Priority Features

1. 📧 Email notifications
2. ✅ Task management
3. 📊 Performance tracking

---

## Support Resources

1. **QUICK_START.md** - Quick setup
2. **AUTH_IMPLEMENTATION.md** - Technical details
3. **IMPLEMENTATION_SUMMARY.md** - What was built
4. **IMPLEMENTATION_CHECKLIST.md** - Development checklist
5. **README.md** - Project overview

---

## Key Shortcuts

| Action | Command |
|--------|---------|
| Format Code (VS Code) | Cmd+Shift+P → Format Document |
| Run Tests | `./mvnw test` |
| View Logs | Console / VS Code Terminal |
| Restart Backend | Ctrl+C then `./mvnw spring-boot:run` |
| Restart Frontend | Ctrl+C then `npm run dev` |
| Clear Cache | Cmd+Shift+Delete (Browser DevTools) |

---

## Links

- [Spring Security Docs](https://spring.io/projects/spring-security)
- [JWT.io](https://jwt.io)
- [Next.js Docs](https://nextjs.org)
- [React Context Guide](https://react.dev/reference/react/useContext)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

**Last Updated**: March 29, 2026
**Status**: ✅ Ready to Use

Keep this card handy for quick reference! 📌
