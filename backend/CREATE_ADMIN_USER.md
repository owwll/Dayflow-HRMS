# Creating First Admin User - Step by Step Guide

## Problem
You're getting a 401 error because there's no admin user in the database yet. The `/auth/register` endpoint requires admin authentication, so we need to create the first admin manually.

---

## Solution: Create Admin User via Prisma Studio

### Step 1: Open Prisma Studio
```bash
cd /Users/vishh/Documents/Dhruvin/Project\'s/Dayflow-HRMS/backend
npm run prisma:studio
```

This will open Prisma Studio in your browser at `http://localhost:5555`

---

### Step 2: Create User Record

1. In Prisma Studio, click on **"User"** model in the left sidebar
2. Click **"Add record"** button (top right)
3. Fill in the following fields:

**Required Fields:**

| Field | Value | Notes |
|-------|-------|-------|
| `id` | Leave blank | Auto-generated |
| `email` | `admin@company.com` | Your admin email |
| `loginId` | `ADMIN001` | Admin login ID |
| `passwordHash` | `$2b$10$zMcc/2RdIP2IhvWzKE0pQuKnZTbkglhJUuOWOz8FLuuiUIMf9VNsS` | Hash for password: `Admin@123` |
| `role` | `ADMIN` | Select from dropdown |
| `firstName` | `Admin` | First name |
| `lastName` | `User` | Last name |
| `profilePicUrl` | Leave blank | Optional |
| `isVerified` | `true` | Check the box |
| `isFirstLogin` | `false` | Uncheck the box |
| `createdAt` | Leave blank | Auto-generated |
| `updatedAt` | Leave blank | Auto-generated |

4. Click **"Save 1 change"** button

---

### Step 3: Verify User Creation

1. You should see the new user in the User table
2. Note down the generated `id` (you'll need this for API calls)

---

## Alternative: Create User via SQL

If you prefer using SQL directly:

### Step 1: Connect to Database

Use your PostgreSQL client or Neon Console SQL Editor.

### Step 2: Run This SQL

```sql
INSERT INTO "User" (
  id,
  email,
  "loginId",
  "passwordHash",
  role,
  "firstName",
  "lastName",
  "profilePicUrl",
  "isVerified",
  "isFirstLogin",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@company.com',
  'ADMIN001',
  '$2b$10$zMcc/2RdIP2IhvWzKE0pQuKnZTbkglhJUuOWOz8FLuuiUIMf9VNsS',
  'ADMIN',
  'Admin',
  'User',
  NULL,
  true,
  false,
  NOW(),
  NOW()
);
```

### Step 3: Verify

```sql
SELECT * FROM "User" WHERE email = 'admin@company.com';
```

---

## Testing Authentication in Postman

### Step 1: Login (Get OTP)

**Endpoint:** `POST http://localhost:5001/api/v1/auth/login`

**Body (raw JSON):**
```json
{
  "email": "admin@company.com",
  "password": "Admin@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to registered email",
  "data": {
    "requiresOTP": true,
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Action:** Check your email for the OTP code

---

### Step 2: Check Email for OTP

The OTP will be sent to `admin@company.com`. 

**If you don't receive the email:**
- Check your `.env` file email configuration
- Verify SMTP credentials are correct
- Check spam folder
- Look at server logs for email errors

**For Testing Without Email:**

You can temporarily check the OTP in the database:

```sql
SELECT "otpHash", "expiresAt", "isUsed" 
FROM "OTP" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'admin@company.com')
ORDER BY "createdAt" DESC 
LIMIT 1;
```

Then you need to compare the hash with bcrypt. Alternatively, modify the code temporarily to log the OTP.

---

### Step 3: Verify OTP

**Endpoint:** `POST http://localhost:5001/api/v1/auth/verify-otp`

**Headers:**
```
Authorization: Bearer {tempToken from step 1}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "user": {
      "id": "clx...",
      "email": "admin@company.com",
      "role": "ADMIN",
      "firstName": "Admin",
      "lastName": "User",
      "profilePic": null,
      "loginId": "ADMIN001",
      "isFirstLogin": false
    }
  }
}
```

**Action:** Save the `accessToken` for subsequent requests

---

### Step 4: Test Protected Endpoint

**Endpoint:** `GET http://localhost:5001/api/v1/dashboard`

**Headers:**
```
Authorization: Bearer {accessToken from step 3}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEmployees": 0,
      "presentToday": 0,
      "onLeave": 0,
      "pendingApprovals": 0
    },
    "employeeCards": [],
    "pendingActions": [...]
  }
}
```

---

## Quick Test Script

Create a file `create-admin.js` in the backend folder:

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@company.com' }
    });

    if (existing) {
      console.log('❌ Admin user already exists!');
      console.log('Email:', existing.email);
      console.log('Login ID:', existing.loginId);
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@company.com',
        loginId: 'ADMIN001',
        passwordHash,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
        isVerified: true,
        isFirstLogin: false,
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Login ID:', admin.loginId);
    console.log('Password: Admin@123');
    console.log('\nYou can now login with these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
```

**Run it:**
```bash
node create-admin.js
```

---

## Troubleshooting

### Issue: "Email already exists"
**Solution:** The admin user is already created. Try logging in.

### Issue: "Invalid credentials"
**Solution:** 
- Verify the password is exactly `Admin@123`
- Check the passwordHash in the database matches the one provided

### Issue: "OTP not received"
**Solution:**
- Check `.env` email configuration
- Verify SMTP credentials
- Check server logs: `tail -f logs/combined.log`
- Temporarily log OTP in code for testing

### Issue: "Invalid or expired OTP"
**Solution:**
- OTP expires in 5 minutes
- Request a new OTP by logging in again
- Check system time is correct

### Issue: "Token expired"
**Solution:**
- Access tokens expire in 15 minutes
- Login again to get a new token
- Or use refresh token endpoint

---

## Password Hash Reference

If you need to create different passwords:

```javascript
// Run this in Node.js
import bcrypt from 'bcrypt';

const password = 'YourPassword123';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

Or use the temp script:
```bash
echo "import bcrypt from 'bcrypt'; const hash = await bcrypt.hash('Admin@123', 10); console.log(hash);" > hash.js
node hash.js
rm hash.js
```

---

## Next Steps After Admin Creation

1. ✅ Login with admin credentials
2. ✅ Verify OTP
3. ✅ Get access token
4. ✅ Create employees using `/auth/register` endpoint
5. ✅ Test all other endpoints

---

## Summary

**Admin Credentials:**
- Email: `admin@company.com`
- Password: `Admin@123`
- Login ID: `ADMIN001`

**Password Hash (for database):**
```
$2b$10$zMcc/2RdIP2IhvWzKE0pQuKnZTbkglhJUuOWOz8FLuuiUIMf9VNsS
```

This hash corresponds to password: `Admin@123`
