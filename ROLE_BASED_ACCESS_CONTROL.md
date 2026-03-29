# Admin Role-Based Access Control Implementation

## Overview

This document describes the implementation of role-based access control in RosterLoop with secure admin creation.

## Changes Made

### 1. Backend Changes

#### New Classes Created

**`AdminConfig.java`** - Configuration class for admin token validation
- Loads `app.admin.creation-token` from `application.properties`
- Provides `isValidAdminToken()` method for token validation

**DTOs Created:**
- `CreateAdminRequest.java` - Request body for creating admin users
- `AdminCreatedResponse.java` - Response for successful admin creation
- `ErrorResponse.java` - Generic error response DTO

#### Modified Classes

**`User.java`** - Already had role field (no changes needed)
- Role field: `ROLE_ADMIN` or `ROLE_USER`
- Properly implements `UserDetails` interface with role authorities

**`AuthResponse.java`** - Added role field
- Now includes user's role in authentication response
- Added overloaded constructor with role parameter
- Added getRole() and setRole() methods

**`AuthService.java`** - Added admin creation method
- New method: `createAdmin(email, password, firstName, lastName)`
- Returns User object with `ROLE_ADMIN` role
- Method sets `isEmailVerified = true` for admins

**`AuthController.java`** - Added admin creation endpoint
- New endpoint: `POST /rosterloop/api/auth/create-admin`
- Validates admin token before creating user
- Returns appropriate HTTP status codes:
  - `201 Created` - Admin successfully created
  - `403 Forbidden` - Invalid/missing admin token
  - `409 Conflict` - Email already exists
  - `400 Bad Request` - Invalid input
  - `500 Internal Server Error` - Server error

#### Configuration Updated

**`application.properties`**
- Added `app.admin.creation-token` property
- Default value: `your-secure-admin-creation-token-change-this-in-production`

### 2. API Endpoint Specification

#### Create Admin User

**Endpoint:** `POST /rosterloop/api/auth/create-admin`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "firstName": "Admin",
  "lastName": "User",
  "adminToken": "your-secure-admin-creation-token"
}
```

**Response (201 Created):**
```json
{
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ROLE_ADMIN",
  "message": "Admin user created successfully"
}
```

**Error Responses:**
- `403 Forbidden`: Invalid admin token
- `409 Conflict`: Email already registered
- `400 Bad Request`: Missing/invalid required fields

### 3. User Roles and Permissions

#### ROLE_ADMIN
- ✅ Create households
- ✅ Edit own households
- ✅ Manage household members
- ✅ Delete households
- ✅ View all member rosters
- ✅ Can access admin panel (future)

#### ROLE_USER
- ❌ Cannot create households
- ✅ View households they're members of
- ✅ See assignment in roster
- ✅ Mark tasks complete (future)
- ❌ Cannot manage members

### 4. Security Features

1. **Secure Token Validation**
   - Admin creation protected by secret token
   - Token must be configured in properties
   - Token validation happens before any database operations

2. **Password Hashing**
   - All passwords hashed with BCrypt (strength 10)
   - Token hash stored, never plain text

3. **Role-Based Authorization**
   - Stored in user record
   - Returned in JWT token (via role field)
   - Used by Spring Security for access control

4. **Input Validation**
   - Email format validation
   - Password minimum length: 6 characters
   - Duplicate email prevention

## Setup Instructions

### 1. Generate Admin Token

```bash
openssl rand -base64 32
```

### 2. Configure Token

Edit `rosterloop/src/main/resources/application.properties`:

```properties
app.admin.creation-token=<your-generated-token>
```

### 3. Restart Backend

```bash
cd rosterloop
mvn clean spring-boot:run
```

### 4. Create Admin User

```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@myapartment.com",
    "password": "MySecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "adminToken": "<your-generated-token>"
  }'
```

## Frontend Implementation (Next Steps)

### Update AuthContext

Add role to auth context state:
```typescript
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;  // NEW: 'ROLE_ADMIN' or 'ROLE_USER'
}
```

### Update AuthResponse Handling

When logging in/signing up, extract and store role:
```typescript
setUser({
  id: response.userId,
  email: response.email,
  firstName: response.firstName,
  lastName: response.lastName,
  role: response.role  // NEW
});
```

### Frontend Access Control

Create utility function to check roles:
```typescript
// utils/roleUtils.ts
export const isAdmin = (role?: string) => role === 'ROLE_ADMIN';
export const isUser = (role?: string) => role === 'ROLE_USER';
```

### Update Components

**Home/Households Page:**
- Admin users: Show "Create Household" button
- Regular users: Show "Waiting for admin to set up household" message

**Header Component:**
- Display user role next to name
- Show "Admin" badge if admin

### Create Admin Dashboard (Future)

- Only accessible to ROLE_ADMIN
- Manage household members
- Invite new users
- View admin statistics

## Database Changes Required

No database migration needed - the `role` column already exists in `users` table.

However, if needed to add role to existing tables:

```sql
-- Verify role column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- If missing, add it:
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'ROLE_USER';
```

## Testing Checklist

- [ ] Generate secure admin token
- [ ] Add token to application.properties
- [ ] Restart backend
- [ ] Create admin user via endpoint
- [ ] Login as admin
- [ ] Verify JWT token contains role
- [ ] Create household (admin only)
- [ ] Create regular user (signup)
- [ ] Verify regular user cannot create household
- [ ] Add role check to frontend UI
- [ ] Test admin/user specific features

## Files Changed Summary

| File | Type | Changes |
|------|------|---------|
| `AdminConfig.java` | Created | New config class for admin token |
| `CreateAdminRequest.java` | Created | DTO for admin creation request |
| `AdminCreatedResponse.java` | Created | DTO for admin creation response |
| `ErrorResponse.java` | Created | Generic error response DTO |
| `AuthResponse.java` | Modified | Added role field and getter/setter |
| `AuthService.java` | Modified | Added createAdmin() method |
| `AuthController.java` | Modified | Added /create-admin endpoint |
| `application.properties` | Modified | Added app.admin.creation-token |

## Next Phase: Household Member Management

Once admin creation is working:

1. **Add Members Endpoint**: `POST /rosterloop/api/households/{id}/members`
   - Admin can add/remove household members
   - Send invites via email
   
2. **Update Household Visibility**
   - All household members can view the roster
   - Only admin can edit/delete household

3. **Admin Panel UI**
   - Manage members
   - Invite users
   - View admin statistics

## Security Considerations for Production

1. **Environment Variables**: Store admin token in environment, not config file
2. **HTTPS Only**: Always use HTTPS to protect token in transit
3. **Rate Limiting**: Implement rate limiting on admin creation endpoint
4. **Audit Logging**: Log all admin creation requests
5. **Token Rotation**: Periodically rotate admin token
6. **IP Whitelisting**: Restrict admin creation to known IPs

## Related Documentation

- See `ADMIN_CREATION_GUIDE.md` for detailed usage examples
- See `AUTH_IMPLEMENTATION.md` for authentication flow details
