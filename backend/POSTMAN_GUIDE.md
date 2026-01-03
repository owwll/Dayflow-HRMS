# Postman API Testing Guide - Dayflow HRMS

## Setup

**Base URL:** `http://localhost:5001/api/v1`

> **Note:** Make sure to update your `.env` file to set `PORT=5001` before starting the server.

---

## 📋 Testing Workflow

Follow this sequence to test all endpoints:

### Step 1: Create First Admin User (Database Setup)

Since registration requires admin authentication, create the first admin manually:

**Using Prisma Studio:**
```bash
npm run prisma:studio
```

Create a User record:
- email: `admin@company.com`
- loginId: `ADMIN001`
- passwordHash: Use bcrypt to hash `Admin@123` → `$2b$10$...`
- role: `ADMIN`
- firstName: `Admin`
- lastName: `User`
- isVerified: `true`
- isFirstLogin: `false`

---

## 🔐 Authentication Flow

### 1. Login - Step 1 (Get OTP)

**Endpoint:** `POST /api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@company.com",
  "password": "Admin@123"
}
```

**Expected Response (200):**
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

**Action:** 
- Check your email for the OTP
- Copy the `tempToken` from response

---

### 2. Verify OTP - Step 2 (Get Access Token)

**Endpoint:** `POST /api/v1/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {tempToken from previous step}
```

**Body (raw JSON):**
```json
{
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "user": {
      "id": "user_123",
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

**Action:**
- Copy the `accessToken` - you'll use this for all subsequent requests
- Save it as an environment variable in Postman: `{{accessToken}}`

---

### 3. Create Employee (Admin Only)

**Endpoint:** `POST /api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body (raw JSON):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+919876543210",
  "role": "EMPLOYEE",
  "company": "Odoo India",
  "department": "Engineering",
  "location": "Mumbai",
  "dateOfJoining": "2025-01-15",
  "monthlyWage": 50000
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "EMP001",
    "loginId": "OTJODO20260001",
    "tempPassword": "aB3$gH8kL",
    "email": "john.doe@company.com"
  }
}
```

**Action:** Employee receives welcome email with credentials

---

## 👤 Profile Management

### 4. Get Profile

**Endpoint:** `GET /api/v1/profile/{userId}`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**URL:** Replace `{userId}` with actual user ID from login response

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "personal": {
      "id": "user_123",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@company.com",
      "phone": null,
      "profilePic": null,
      "dateOfBirth": null,
      "gender": null,
      "maritalStatus": null,
      "nationality": null,
      "address": null
    },
    "professional": {
      "employeeCode": null,
      "loginId": "ADMIN001",
      "company": null,
      "department": null,
      "jobPosition": null,
      "manager": null,
      "location": null,
      "dateOfJoining": null,
      "workSchedule": {
        "workingDays": null,
        "dailyHours": null,
        "breakTime": null
      }
    },
    "bank": {
      "accountNumber": null,
      "bankName": null,
      "ifscCode": null,
      "panNumber": null,
      "uanNumber": null
    }
  }
}
```

---

### 5. Update Profile

**Endpoint:** `PUT /api/v1/profile/{userId}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body (raw JSON):**
```json
{
  "phone": "+919876543211",
  "address": "123 Main Street, Mumbai",
  "dateOfBirth": "1990-05-15",
  "gender": "male"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### 6. Upload Profile Picture 📸

**Endpoint:** `POST /api/v1/profile/{userId}/upload-picture`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Body (form-data):**
- Key: `profilePic`
- Type: `File`
- Value: Select an image file (JPG, PNG)

**Steps in Postman:**
1. Select "Body" tab
2. Choose "form-data"
3. Add key: `profilePic`
4. Change type from "Text" to "File" (dropdown on right)
5. Click "Select Files" and choose an image

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "profilePicUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/hrms/profiles/profile_user_123.jpg"
  }
}
```

---

## 📊 Dashboard

### 7. Get Dashboard Data

**Endpoint:** `GET /api/v1/dashboard`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Expected Response (200) - Admin:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEmployees": 1,
      "presentToday": 0,
      "onLeave": 0,
      "pendingApprovals": 0
    },
    "employeeCards": [
      {
        "id": "user_456",
        "name": "John Doe",
        "profilePic": null,
        "role": null,
        "department": "Engineering",
        "status": "absent",
        "attendance": {
          "checkIn": null,
          "checkOut": null
        }
      }
    ],
    "pendingActions": [
      {
        "type": "leave_approval",
        "count": 0,
        "items": []
      }
    ]
  }
}
```

---

## ⏱ Attendance

### 8. Check In

**Endpoint:** `POST /api/v1/attendance/check-in`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body (raw JSON):**
```json
{
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "deviceInfo": "Chrome on Windows"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "checkInTime": "2026-01-03T05:30:00.000Z",
    "attendanceId": "att_123456"
  }
}
```

**Action:** Save `attendanceId` for check-out

---

### 9. Check Out

**Endpoint:** `POST /api/v1/attendance/check-out`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body (raw JSON):**
```json
{
  "attendanceId": "att_123456",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  }
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "checkOutTime": "2026-01-03T14:30:00.000Z",
    "workHours": 8.5,
    "extraHours": 0.5
  }
}
```

---

### 10. Get Attendance Records

**Endpoint:** `GET /api/v1/attendance`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Parameters:**
- `month`: `2026-01` (optional)
- `year`: `2026` (optional)
- `page`: `1` (optional)
- `limit`: `30` (optional)

**URL Example:**
```
http://localhost:5001/api/v1/attendance?month=2026-01&page=1&limit=30
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "month": "January 2026",
      "totalWorkingDays": 22,
      "daysPresent": 1,
      "daysAbsent": 0,
      "leavesTaken": 0,
      "halfDays": 0
    },
    "records": [
      {
        "date": "2026-01-03",
        "day": "Friday",
        "checkIn": "05:30",
        "checkOut": "14:30",
        "workHours": 8.5,
        "extraHours": 0.5,
        "breakTime": "01:00",
        "status": "PRESENT"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 30,
      "totalPages": 1
    }
  }
}
```

---

## 📅 Leave Management

### 11. Apply for Leave

**Endpoint:** `POST /api/v1/leave/apply`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Body (form-data):**
- `leaveType`: `SICK` (Text)
- `startDate`: `2026-01-10` (Text)
- `endDate`: `2026-01-10` (Text)
- `reason`: `Not feeling well` (Text)
- `attachment`: Select file (File) - Optional

**Steps in Postman:**
1. Select "Body" tab
2. Choose "form-data"
3. Add text fields as shown above
4. For attachment: Change type to "File" and select a PDF/image

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Leave request submitted",
  "data": {
    "leaveId": "leave_123",
    "status": "PENDING"
  }
}
```

---

### 12. Get Leave Requests

**Endpoint:** `GET /api/v1/leave`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Parameters:**
- `status`: `PENDING` (optional)
- `page`: `1` (optional)

**Expected Response (200) - Employee:**
```json
{
  "success": true,
  "data": {
    "balance": {
      "paid": 15,
      "sick": 7,
      "unpaid": 0
    },
    "requests": [
      {
        "id": "leave_123",
        "leaveType": "SICK",
        "startDate": "2026-01-10",
        "endDate": "2026-01-10",
        "duration": 1,
        "reason": "Not feeling well",
        "status": "PENDING",
        "appliedOn": "2026-01-03T05:45:00.000Z",
        "attachment": "https://cloudinary.com/..."
      }
    ]
  }
}
```

---

### 13. Approve/Reject Leave (Admin Only)

**Endpoint:** `PUT /api/v1/leave/{leaveId}/approve`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body (raw JSON):**
```json
{
  "action": "approve",
  "comments": "Approved as per policy"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Leave request approved",
  "data": {
    "leaveId": "leave_123",
    "status": "APPROVED",
    "updatedBy": "user_123",
    "updatedAt": "2026-01-03T06:00:00.000Z"
  }
}
```

---

## 💰 Payroll

### 14. Get Salary Information

**Endpoint:** `GET /api/v1/payroll/{employeeId}`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "basic": {
      "monthlyWage": 50000,
      "yearlyWage": 600000
    },
    "components": [
      {
        "name": "Basic Salary",
        "type": "percentage",
        "percentage": 50,
        "amount": 25000,
        "formula": "50% of monthly wage"
      },
      {
        "name": "House Rent Allowance",
        "type": "percentage_of_basic",
        "percentage": 50,
        "amount": 12500,
        "formula": "50% of basic salary"
      }
    ],
    "deductions": [
      {
        "name": "Provident Fund (Employee)",
        "type": "percentage",
        "percentage": 12,
        "amount": 3000,
        "formula": "12% of basic salary"
      }
    ],
    "totals": {
      "grossSalary": 50000,
      "totalDeductions": 3200,
      "netSalary": 46800,
      "employerPF": 3000,
      "employerContribution": 3000
    }
  }
}
```

---

### 15. Generate Payslip

**Endpoint:** `POST /api/v1/payroll/{employeeId}/payslip`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Parameters:**
- `month`: `01`
- `year`: `2026`

**URL Example:**
```
http://localhost:5001/api/v1/payroll/user_456/payslip?month=01&year=2026
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "employee": {
      "name": "John Doe",
      "employeeCode": "EMP001",
      "department": "Engineering"
    },
    "period": {
      "month": "January",
      "year": 2026,
      "paymentDate": "2026-02-05"
    },
    "attendance": {
      "totalDays": 22,
      "presentDays": 1,
      "leaves": 0,
      "payableDays": 1
    },
    "summary": {
      "grossEarnings": 50000,
      "totalDeductions": 3200,
      "netPayable": 46800,
      "proRatedAmount": 2127.27,
      "inWords": "Two Thousand One Hundred Twenty Seven Rupees Only"
    }
  }
}
```

---

## 👥 Admin Endpoints

### 16. Get All Employees

**Endpoint:** `GET /api/v1/admin/employees`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Parameters:**
- `department`: `Engineering` (optional)
- `status`: `ACTIVE` (optional)
- `search`: `john` (optional)
- `page`: `1` (optional)
- `limit`: `50` (optional)

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "user_456",
        "employeeCode": "EMP001",
        "name": "John Doe",
        "email": "john.doe@company.com",
        "profilePic": null,
        "department": "Engineering",
        "jobPosition": null,
        "location": "Mumbai",
        "status": "ACTIVE",
        "attendanceToday": {
          "status": "PRESENT",
          "checkIn": "05:30",
          "checkOut": "14:30"
        }
      }
    ],
    "summary": {
      "total": 1,
      "active": 1,
      "onLeave": 0,
      "departments": [
        {
          "name": "Engineering",
          "count": 1
        }
      ]
    },
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

## 🔔 Notifications

### 17. Get Notifications

**Endpoint:** `GET /api/v1/notifications`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Parameters:**
- `unreadOnly`: `true` (optional)
- `type`: `LEAVE_APPROVED` (optional)
- `page`: `1` (optional)

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "LEAVE_APPLIED",
        "title": "New Leave Request",
        "message": "John Doe applied for sick leave",
        "read": false,
        "timestamp": "2026-01-03T05:45:00.000Z",
        "metadata": {
          "leaveId": "leave_123"
        }
      }
    ],
    "unreadCount": 1
  }
}
```

---

## 🧪 Postman Collection Setup

### Create Environment Variables

1. Click "Environments" in Postman
2. Create new environment: "Dayflow HRMS Local"
3. Add variables:
   - `baseUrl`: `http://localhost:5001/api/v1`
   - `accessToken`: (will be set after login)
   - `userId`: (will be set after login)

### Use Variables in Requests

Replace hardcoded values with:
- URL: `{{baseUrl}}/auth/login`
- Headers: `Authorization: Bearer {{accessToken}}`

---

## 🎯 Quick Test Checklist

- [ ] Login and get OTP
- [ ] Verify OTP and get access token
- [ ] Create employee
- [ ] Get profile
- [ ] Update profile
- [ ] Upload profile picture
- [ ] Check in
- [ ] Check out
- [ ] Get attendance records
- [ ] Apply for leave
- [ ] Approve leave (admin)
- [ ] Get salary info
- [ ] Generate payslip
- [ ] Get all employees
- [ ] Get notifications

---

## 🐛 Common Issues

### 1. Port Already in Use
Update `.env` file: `PORT=5001`

### 2. CORS Error
Ensure `CORS_ORIGIN` in `.env` matches your request origin

### 3. Token Expired
Login again to get a new access token

### 4. File Upload Fails
- Check file size (max 5MB)
- Verify file type (JPG, PNG, PDF only)
- Ensure Cloudinary credentials are configured

### 5. Database Connection Error
Verify `DATABASE_URL` in `.env` is correct

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values are in INR (₹)
- File uploads use `multipart/form-data`
- Other requests use `application/json`
- Access tokens expire in 15 minutes
- Use refresh token to get new access token

Happy Testing! 🚀
