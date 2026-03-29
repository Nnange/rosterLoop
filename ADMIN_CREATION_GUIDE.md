# Admin User Creation Guide

## Overview

The RosterLoop application uses a role-based access control system where only **ADMIN** users can create households. This guide explains how to securely create admin users.

## Security Approach

The admin creation endpoint is protected by a secure token mechanism:
- Only requests with a valid `adminToken` are accepted
- The token must be configured in `application.properties`
- The endpoint returns `403 Forbidden` if the token is invalid or missing

## Configuration

### 1. Generate a Secure Token

Generate a random token using OpenSSL (or similar):

```bash
openssl rand -base64 32
```

Example output:
```
aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3C4d5E6f7G8h9=
```

### 2. Set the Token in application.properties

Edit `rosterloop/src/main/resources/application.properties`:

```properties
# Admin Configuration
app.admin.creation-token=your-generated-token-here
```

### 3. Restart the Backend

```bash
mvn clean spring-boot:run
```

## Creating an Admin User

### Endpoint

```
POST /rosterloop/api/auth/create-admin
```

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "firstName": "Admin",
  "lastName": "User",
  "adminToken": "your-generated-token-here"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address (must be unique) |
| `password` | string | Yes | Password (minimum 6 characters) |
| `firstName` | string | No | User's first name |
| `lastName` | string | No | User's last name |
| `adminToken` | string | Yes | Must match `app.admin.creation-token` from configuration |

### Response (Success - 201 Created)

```json
{
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ROLE_ADMIN",
  "message": "Admin user created successfully"
}
```

### Response (Error Cases)

#### Invalid Token (403 Forbidden)
```json
{
  "error": "Error",
  "message": "Invalid or missing admin token"
}
```

#### Duplicate Email (409 Conflict)
```json
{
  "error": "Error",
  "message": "Email is already registered"
}
```

#### Invalid Password (400 Bad Request)
```json
{
  "error": "Error",
  "message": "Password must be at least 6 characters"
}
```

## Example: Using cURL

```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@myapartment.com",
    "password": "MySecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "adminToken": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3C4d5E6f7G8h9="
  }'
```

## Example: Using Postman

1. Create a new POST request
2. URL: `http://localhost:8080/rosterloop/api/auth/create-admin`
3. Headers:
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "email": "admin@myapartment.com",
     "password": "MySecurePassword123",
     "firstName": "John",
     "lastName": "Doe",
     "adminToken": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3C4d5E6f7G8h9="
   }
   ```
5. Send the request

## Security Best Practices

1. **Change the Default Token**
   - Always generate a new secure token for your deployment
   - Never use the example token in production

2. **Protect the Token**
   - Keep the token secret (similar to API keys)
   - Don't commit the real token to version control
   - Use environment variables in production

3. **Use HTTPS**
   - Always use HTTPS in production to protect the token in transit

4. **Store Securely**
   - Use secrets management systems (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Don't hardcode tokens in code

5. **Limited Access**
   - Only expose this endpoint on private networks if possible
   - Use VPN or firewall rules to restrict access

## Environment-Specific Configuration

### Development (application.properties)
```properties
app.admin.creation-token=dev-token-12345
```

### Production (environment variables)
```bash
export APP_ADMIN_CREATION_TOKEN="$(openssl rand -base64 32)"
```

Then use in `application.properties`:
```properties
app.admin.creation-token=${APP_ADMIN_CREATION_TOKEN}
```

## Admin User Roles and Permissions

After an admin is created, they have the following permissions:
- ✅ Create new households
- ✅ Edit households they own
- ✅ Manage household members
- ✅ View all households they own

Regular users (ROLE_USER) can:
- ❌ Cannot create households
- ✅ Can view households they're members of
- ✅ Can view the shared roster

## Testing the Admin Flow

### 1. Create Admin User
```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "firstName": "Test",
    "lastName": "Admin",
    "adminToken": "your-token"
  }'
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

### 3. Create a Household (Admin only)
```bash
curl -X POST http://localhost:8080/rosterloop/api/households \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "householdName": "Apartment 5B",
    "members": ["member1@test.com", "member2@test.com"]
  }'
```

## Troubleshooting

### "Invalid or missing admin token"
- Ensure the token in your request matches the one in `application.properties`
- Check for whitespace issues
- Verify the backend was restarted after configuration changes

### "Email is already registered"
- The email already exists in the system
- Use a different email address

### "Password must be at least 6 characters"
- Ensure password is at least 6 characters long

## Next Steps

1. Create admin user using this endpoint
2. Implement household member management UI
3. Add admin panel for managing users and permissions
4. Implement email invitations for adding household members
