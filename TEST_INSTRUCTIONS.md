## Quick Test: Admin Role-Based Access Control

### 1. Generate Admin Token
```bash
openssl rand -base64 32
```
Copy the output token.

### 2. Set Token in Backend Config
Edit `rosterloop/src/main/resources/application.properties`:
```properties
app.admin.creation-token=<paste-your-token-here>
```

### 3. Start Backend
```bash
cd rosterloop
mvn clean spring-boot:run
```

### 4. Start Frontend (new terminal)
```bash
cd frontend
npm run dev
```

### 5. Create Admin User (using Postman or curl)
```bash
curl -X POST http://localhost:8080/rosterloop/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apartment.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "adminToken": "<your-token-here>"
  }'
```

### 6. Create Regular User
1. Go to http://localhost:3000/signup
2. Signup with a different email

### 7. Test Flow
- **Login as Admin:**
  1. Login with admin@apartment.com
  2. Should redirect to `/households` page
  3. See "Create Household" button (or "No Households Yet")
  
- **Login as Regular User:**
  1. Signup or login with regular user account
  2. Should redirect to `/waiting` page
  3. See "waiting for admin to set up household" message
  4. Should NOT see create household button

### 8. Test Household Creation
- **As Admin:** 
  - Click "Create Household" button → should create
  
- **As Regular User:**
  - If trying to hit API directly: should get 403 Forbidden

### Expected Behavior
✅ Admin can create households
❌ Regular users cannot create households
✅ Regular users see waiting page
✅ Admin sees households list/create page
