# User Authentication Implementation

## Overview
This document describes the user authentication system implemented in rosterLoop. The system uses JWT (JSON Web Tokens) for stateless authentication with secure password hashing.

## Features Implemented

### Backend (Spring Boot)
1. **User Entity** - Extended database model with authentication fields:
   - Email (unique, case-sensitive)
   - Password (BCrypt hashed)
   - First & Last Name
   - Email verification status
   - Active/Inactive status
   - Role-based access control (ROLE_USER, ROLE_ADMIN)
   - Account creation and last login timestamps

2. **JWT Token Provider** - `JwtTokenProvider.java`
   - Generates tokens with user ID and email claims
   - Validates token signatures
   - Extracts claims (email, user ID)
   - Configurable expiration time (default: 24 hours)
   - HS256 algorithm for signing

3. **Security Configuration** - `SecurityConfig.java`
   - CORS enabled for frontend origins (localhost:3000, localhost:3001)
   - Stateless session management
   - JWT authentication filter
   - Password encoding using BCrypt
   - Protected endpoints require authentication
   - Public endpoints for auth operations (/rosterloop/api/auth/*)

4. **Authentication Endpoints**:
   - `POST /rosterloop/api/auth/signup` - User registration
   - `POST /rosterloop/api/auth/login` - User login
   - `GET /rosterloop/api/auth/me` - Get current user (future enhancement)

5. **Household Authorization**:
   - Each household is owned by a user
   - Users can only access households they own
   - Admin panel can be extended for household invitations

### Frontend (Next.js)
1. **Auth Context** - `AuthContext.tsx`
   - Global authentication state management
   - Persists auth state in localStorage
   - Methods: login, signup, logout
   - Error and loading states
   - Automatic token injection in API requests

2. **Protected Routes**:
   - Home page redirects to login if not authenticated
   - Login page at `/login`
   - Signup page at `/signup`
   - Roster pages require authentication

3. **UI Components**:
   - Login form with email/password validation
   - Signup form with password confirmation
   - User info display in Header
   - Logout button

4. **API Integration**:
   - Axios interceptor automatically adds Bearer token to requests
   - Handles token refresh on 401 responses (can be enhanced)

## API Request/Response Examples

### Signup
**Request:**
```http
POST /rosterloop/api/auth/signup
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
**Request:**
```http
POST /rosterloop/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** (Same as signup)

### Create Household (Authenticated)
**Request:**
```http
POST /rosterloop/api/households
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "uuid-here",
  "flatmateNames": ["Alice", "Bob", "Charlie"],
  "householdName": "My Apartment"
}
```

### Get Household (Authenticated)
**Request:**
```http
GET /rosterloop/api/households/{id}
Authorization: Bearer <token>
```

## Configuration

### Backend (application.properties)
```properties
# JWT Configuration
app.jwtSecret=mySecretKeyThatIsAtLeast256BitsLongForHS256SigningAlgorithmUseCaseRosterLoop12345678
app.jwtExpirationMs=86400000  # 24 hours

# Server Port
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/households
spring.datasource.username=postgres
```

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Security Considerations

1. **Password Security**:
   - Minimum 8 characters
   - Hashed with BCrypt (10 rounds)
   - Never stored or transmitted in plain text

2. **Token Security**:
   - JWT tokens are stateless and verified by signature
   - Stored in localStorage (consider httpOnly cookies for production)
   - Automatically included in API requests via interceptor
   - Expires after 24 hours

3. **CORS Protection**:
   - Only allows requests from whitelisted origins
   - Can be configured per environment

4. **Email Uniqueness**:
   - Database constraint ensures unique emails
   - Case-insensitive comparison in authentication

## Future Enhancements

1. **Email Verification**:
   - Send verification email on signup
   - Verify email before allowing household creation
   - Resend verification email functionality

2. **Password Reset**:
   - Forgot password flow
   - Time-limited reset tokens
   - Email-based password reset

3. **Two-Factor Authentication (2FA)**:
   - TOTP-based authentication
   - SMS-based verification (optional)

4. **OAuth Integration**:
   - Google/GitHub login
   - Automatic account creation

5. **Role-Based Access Control (RBAC)**:
   - Admin role for household management
   - Invite household members
   - Different permission levels

6. **Session Management**:
   - Token refresh mechanism
   - Logout from all devices
   - Session tracking

7. **Audit Logging**:
   - Track login attempts
   - Failed authentication logging
   - Access history per user

## Database Schema Changes

### New Tables
- `users` - User accounts and credentials

### Modified Tables
- `households` - Added `owner_id` foreign key to users table

### Migration Steps
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  role VARCHAR(50) DEFAULT 'ROLE_USER',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  last_login TIMESTAMP
);

-- Add owner_id to households table
ALTER TABLE households ADD COLUMN owner_id UUID NOT NULL REFERENCES users(id);
```

## Running the Application

### Prerequisites
- PostgreSQL database running
- Java 21
- Node.js 16+

### Backend
```bash
cd rosterloop
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Testing
1. Navigate to http://localhost:3000
2. Click "Sign Up" to create a new account
3. Log in with credentials
4. Create or manage household rosters

## Troubleshooting

### Common Issues

1. **"Email is already registered"**
   - User account already exists
   - Try logging in instead

2. **"Invalid email or password"**
   - Check credentials are correct
   - Email is case-insensitive, password is case-sensitive

3. **CORS errors**
   - Ensure frontend URL is in CORS whitelist
   - Check Origins in SecurityConfig

4. **Token expiration**
   - Token expires after 24 hours
   - User will need to log in again
   - Can implement refresh token mechanism

5. **Household access denied**
   - User is not the owner of the household
   - Only household owner can view/modify it
   - Implement invite system for members

## Code Files Reference

### Backend
- `User.java` - User entity with UserDetails implementation
- `UserRepository.java` - Database queries
- `AuthService.java` - Authentication business logic
- `CustomUserDetailsService.java` - Spring Security user details
- `JwtTokenProvider.java` - JWT token generation/validation
- `JwtAuthenticationFilter.java` - Request-level JWT validation
- `SecurityConfig.java` - Spring Security configuration
- `AuthController.java` - Authentication endpoints
- `HouseholdController.java` - Updated with auth checks

### Frontend
- `AuthContext.tsx` - Global auth state
- `login/page.tsx` - Login form
- `signup/page.tsx` - Signup form
- `api.ts` - API client with token interceptor
- `layout.tsx` - Root layout with AuthProvider
- `page.tsx` - Home page with auth redirect
- `Header.tsx` - User info and logout

## Performance Notes

- JWT validation is performed on every request (server-side)
- Token verification is fast (cryptographic signature check)
- No database queries needed for token validation
- Consider implementing caching for user permissions

## Support & Maintenance

For issues or questions:
1. Check this documentation
2. Review error messages in console/logs
3. Ensure database migrations are applied
4. Verify environment variables are set correctly
