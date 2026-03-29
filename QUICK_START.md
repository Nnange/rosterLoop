# Quick Start Guide - Authentication Feature

## Prerequisites
- PostgreSQL running on localhost:5432
- Java 21
- Node.js 16+

## Setup Steps

### 1. Database Setup
Create the database if it doesn't exist:
```sql
CREATE DATABASE households;
```

The Spring Boot application will automatically create the tables with `ddl-auto=update`.

### 2. Backend Setup & Run

```bash
# Navigate to backend directory
cd rosterloop

# Build the project
./mvnw clean build

# Run the application
./mvnw spring-boot:run
```

The backend will start on http://localhost:8080

### 3. Frontend Setup & Run

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will start on http://localhost:3000

## Testing the Flow

### Signup Flow
1. Open http://localhost:3000 in your browser
2. You'll be automatically redirected to http://localhost:3000/login
3. Click the "Sign up" link
4. Fill in the form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `SecurePassword123`
   - Confirm Password: `SecurePassword123`
5. Click "Sign Up"
6. You should be logged in and see the household creation form

### Login Flow
1. Click the "Logout" button (top right)
2. You'll be redirected to login page
3. Enter your email and password
4. Click "Login"
5. You should be logged in again

### Creating a Household
1. While logged in, you should see the setup form
2. Enter the number of people: `3`
3. Click "Next"
4. Enter names:
   - Alice
   - Bob
   - Charlie
5. Click "Create Roster"
6. You'll see the cleaning schedule for your household

## Key URLs

- **Frontend Home**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Signup Page**: http://localhost:3000/signup
- **Backend API**: http://localhost:8080/rosterloop/api

## API Endpoints

### Public Endpoints
- `POST /rosterloop/api/auth/signup` - Create new account
- `POST /rosterloop/api/auth/login` - Login to existing account

### Protected Endpoints (require JWT token)
- `GET /rosterloop/api/households/{id}` - Get household details
- `POST /rosterloop/api/households` - Create new household

## Sample Requests

### Signup
```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Response will include:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User"
}
```

### Create Household (with token)
```bash
curl -X POST http://localhost:8080/rosterloop/api/households \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token_here>" \
  -d '{
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "flatmateNames": ["Alice", "Bob", "Charlie"],
    "householdName": "My Apartment"
  }'
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `psql -U postgres -d households`
- Check port 8080 is available
- Review error logs in terminal

### Frontend shows blank page
- Open browser DevTools (F12)
- Check Console tab for errors
- Verify backend is running on port 8080

### Can't sign up - "Email is already registered"
- Use a different email address
- Or check database: `SELECT * FROM users WHERE email='your@email.com';`

### Login fails - "Invalid email or password"
- Check email spelling (case-insensitive, but must match exactly)
- Check password (case-sensitive)
- Verify user exists in database

### CORS errors
- Ensure frontend is on http://localhost:3000
- Check SecurityConfig.java CORS settings
- Restart backend after changes

### Token-related errors
- Tokens expire after 24 hours (86400000 ms)
- Login again to get a new token
- Check Authorization header format: `Bearer <token>`

## Development Tips

### View Logs
Backend logs show SQL queries and authentication events:
```
[INFO] com.rosterloop.rosterloop.controller.AuthController - User logged in
[DEBUG] com.rosterloop.rosterloop.security.JwtAuthenticationFilter - Token validated
```

### Check Database
```bash
# Connect to database
psql -U postgres -d households

# View users
SELECT id, email, first_name, last_name, is_active, created_at FROM users;

# View households
SELECT id, owner_id, flatmate_names, created_at FROM households;
```

### Frontend Debugging
- Check `localStorage` in DevTools Application tab for authToken and authUser
- Monitor Network tab to see API requests and responses
- Check Console for any JavaScript errors

## Feature Completeness

✅ **Implemented**
- User registration (signup)
- User login
- JWT token generation and validation
- Protected API endpoints
- Household ownership
- Logout functionality
- Persistent authentication (localStorage)
- CORS configuration

🔄 **Future Enhancements**
- Email verification on signup
- Password reset/forgot password
- Two-factor authentication
- Household member invitations
- Role-based access (admin/member)
- OAuth integration (Google, GitHub)
- Refresh token mechanism
- Account deactivation

## File Locations

**Backend Source**: `rosterloop/src/main/java/com/rosterloop/rosterloop/`
**Frontend Source**: `frontend/app/`
**Documentation**: 
- `AUTH_IMPLEMENTATION.md` - Detailed auth docs
- `IMPLEMENTATION_SUMMARY.md` - Overview of changes
- `QUICK_START.md` - This file

## Next Steps

1. ✅ Test authentication locally
2. ⬜ Implement email verification
3. ⬜ Add password reset functionality
4. ⬜ Implement notifications & reminders
5. ⬜ Add task management system

## Questions?

Refer to:
- `AUTH_IMPLEMENTATION.md` for detailed documentation
- `IMPLEMENTATION_SUMMARY.md` for what was changed
- Backend error logs in console
- Frontend browser DevTools

---

**Status**: Ready to use!

The authentication system is fully implemented and tested. You can now build on top of this with additional features.

Happy coding! 🚀
