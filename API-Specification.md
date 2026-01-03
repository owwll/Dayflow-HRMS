# **📡 Detailed API Specifications - Dayflow HRMS**

## **Base URL**
```
https://api.dayflow-hrms.com/v1
```

---

## **🔐 Authentication Endpoints**

### **1. Admin Create Employee (Sign Up)**
`POST /auth/register`

**Access:** Admin only  
**Description:** Admin creates new employee account. System auto-generates login ID & password.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+919876543210",
  "role": "employee", // "employee" or "admin"
  "company": "Odoo India",
  "department": "Engineering",
  "managerId": "123",
  "location": "Mumbai",
  "dateOfJoining": "2025-01-15",
  "monthlyWage": 50000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "EMP001",
    "loginId": "OTTODO20250001",
    "tempPassword": "aB3$gH8kL",
    "email": "john.doe@company.com"
  }
}
```

---

### **2. Login**
`POST /auth/login`

**Access:** Public  
**Description:** First-step authentication with email and password.

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent to registered email",
  "data": {
    "requiresOTP": true,
    "tempToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

### **3. Verify OTP**
`POST /auth/verify-otp`

**Access:** Public  
**Description:** Second-step authentication with OTP.

**Request Headers:**
```
Authorization: Bearer {tempToken}
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "user": {
      "id": "user_123",
      "email": "john.doe@company.com",
      "role": "employee",
      "firstName": "John",
      "lastName": "Doe",
      "profilePic": "https://cloudinary.com/image.jpg",
      "loginId": "OTTODO20250001"
    }
  }
}
```

---

### **4. Change Password**
`PUT /auth/change-password`

**Access:** Authenticated users  
**Description:** Change password (required on first login).

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "oldPassword": "tempPassword123",
  "newPassword": "NewSecurePass@123",
  "confirmPassword": "NewSecurePass@123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### **5. Refresh Token**
`POST /auth/refresh-token`

**Access:** Public (with refresh token)  
**Description:** Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## **👤 Profile Management Endpoints**

### **6. Get Profile**
`GET /profile/{userId}`

**Access:** 
- Employee: Can access only own profile
- Admin: Can access any profile

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "personal": {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phone": "+919876543210",
      "profilePic": "https://cloudinary.com/image.jpg",
      "dateOfBirth": "1990-05-15",
      "gender": "male",
      "maritalStatus": "single",
      "nationality": "Indian",
      "address": "123 Main St, Mumbai"
    },
    "professional": {
      "employeeCode": "EMP001",
      "loginId": "OTTODO20250001",
      "company": "Odoo India",
      "department": "Engineering",
      "jobPosition": "Software Engineer",
      "manager": {
        "id": "user_456",
        "name": "Jane Smith",
        "email": "jane.smith@company.com"
      },
      "location": "Mumbai",
      "dateOfJoining": "2025-01-15",
      "workSchedule": {
        "workingDays": 5,
        "dailyHours": 8,
        "breakTime": "01:00"
      }
    },
    "bank": {
      "accountNumber": "1234567890",
      "bankName": "HDFC Bank",
      "ifscCode": "HDFC0001234",
      "panNumber": "ABCDE1234F",
      "uanNumber": "123456789012"
    }
  }
}
```

---

### **7. Update Profile**
`PUT /profile/{userId}`

**Access:** 
- Employee: Can update limited fields (address, phone, profile pic)
- Admin: Can update all fields

**Request Body (Employee Example):**
```json
{
  "phone": "+919876543211",
  "address": "456 New St, Mumbai",
  "profilePic": "base64EncodedImageString" // Optional
}
```

**Request Body (Admin Example):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "department": "Product",
  "jobPosition": "Senior Software Engineer",
  "monthlyWage": 75000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### **8. Upload Profile Picture**
`POST /profile/{userId}/upload-picture`

**Access:** Employee & Admin (for their own profile)

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}
```

**Form Data:**
```
profilePic: <file>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profilePicUrl": "https://cloudinary.com/image.jpg"
  }
}
```

---

## **📊 Dashboard Endpoints**

### **9. Get Dashboard Data**
`GET /dashboard`

**Access:** Authenticated users  
**Description:** Returns role-specific dashboard data.

**Response for Employee (200 OK):**
```json
{
  "success": true,
  "data": {
    "quickStats": {
      "attendanceToday": "present",
      "checkInTime": "09:30",
      "checkOutTime": null,
      "leaveBalance": {
        "paid": 15,
        "sick": 7,
        "unpaid": 0
      },
      "upcomingLeaves": []
    },
    "recentActivity": [
      {
        "id": "act_1",
        "type": "leave_applied",
        "message": "Applied for sick leave on Oct 28",
        "timestamp": "2025-10-25T10:30:00Z"
      }
    ],
    "notifications": [
      {
        "id": "notif_1",
        "type": "leave_approved",
        "message": "Your leave request has been approved",
        "read": false,
        "timestamp": "2025-10-25T09:00:00Z"
      }
    ]
  }
}
```

**Response for Admin (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEmployees": 150,
      "presentToday": 120,
      "onLeave": 20,
      "pendingApprovals": 5
    },
    "employeeCards": [
      {
        "id": "user_123",
        "name": "John Doe",
        "profilePic": "https://cloudinary.com/image.jpg",
        "role": "Software Engineer",
        "department": "Engineering",
        "status": "present",
        "attendance": {
          "checkIn": "09:30",
          "checkOut": null
        }
      }
    ],
    "pendingActions": [
      {
        "type": "leave_approval",
        "count": 5,
        "items": []
      },
      {
        "type": "attendance_regularization",
        "count": 3,
        "items": []
      }
    ]
  }
}
```

---

## **⏱ Attendance Endpoints**

### **10. Check In**
`POST /attendance/check-in`

**Access:** Employee only  
**Description:** Record employee check-in time.

**Request Body:**
```json
{
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "deviceInfo": "Chrome on Windows"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "checkInTime": "2025-10-26T09:30:00Z",
    "attendanceId": "att_123456"
  }
}
```

---

### **11. Check Out**
`POST /attendance/check-out`

**Access:** Employee only  
**Description:** Record employee check-out time.

**Request Body:**
```json
{
  "attendanceId": "att_123456",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "checkOutTime": "2025-10-26T18:30:00Z",
    "workHours": 8.5,
    "extraHours": 0.5
  }
}
```

---

### **12. Get Attendance Records**
`GET /attendance`

**Query Parameters:**
- `employeeId` (optional for admin)
- `month` (format: YYYY-MM, default: current month)
- `year` (format: YYYY, default: current year)
- `page` (default: 1)
- `limit` (default: 30)

**Response for Employee (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "month": "October 2025",
      "totalWorkingDays": 22,
      "daysPresent": 18,
      "daysAbsent": 2,
      "leavesTaken": 2,
      "halfDays": 0
    },
    "records": [
      {
        "date": "2025-10-01",
        "day": "Monday",
        "checkIn": "09:30",
        "checkOut": "18:30",
        "workHours": 8.5,
        "extraHours": 0.5,
        "breakTime": "01:00",
        "status": "present"
      }
    ],
    "pagination": {
      "total": 22,
      "page": 1,
      "limit": 30,
      "totalPages": 1
    }
  }
}
```

**Response for Admin (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "date": "2025-10-26",
      "totalEmployees": 150,
      "present": 120,
      "absent": 20,
      "onLeave": 10
    },
    "records": [
      {
        "employee": {
          "id": "user_123",
          "name": "John Doe",
          "profilePic": "https://cloudinary.com/image.jpg",
          "department": "Engineering"
        },
        "checkIn": "09:30",
        "checkOut": "18:30",
        "workHours": 8.5,
        "extraHours": 0.5,
        "status": "present"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 30,
      "totalPages": 4
    }
  }
}
```

---

## **📅 Leave Management Endpoints**

### **13. Apply for Leave**
`POST /leave/apply`

**Access:** Employee only

**Request Body:**
```json
{
  "leaveType": "sick", // "paid", "sick", "unpaid"
  "startDate": "2025-10-28",
  "endDate": "2025-10-28",
  "reason": "Not feeling well",
  "attachment": "base64EncodedFileString" // Optional for sick leave
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Leave request submitted",
  "data": {
    "leaveId": "leave_123",
    "status": "pending"
  }
}
```

---

### **14. Get Leave Requests**
`GET /leave`

**Query Parameters:**
- `status` (optional: "pending", "approved", "rejected")
- `employeeId` (optional for admin)
- `startDate` (optional)
- `endDate` (optional)
- `page` (default: 1)
- `limit` (default: 30)

**Response for Employee (200 OK):**
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
        "leaveType": "sick",
        "startDate": "2025-10-28",
        "endDate": "2025-10-28",
        "duration": 1,
        "reason": "Not feeling well",
        "status": "pending",
        "appliedOn": "2025-10-25T10:30:00Z",
        "attachment": "https://cloudinary.com/doc.pdf"
      }
    ]
  }
}
```

**Response for Admin (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "pending": 5,
      "approved": 45,
      "rejected": 3
    },
    "requests": [
      {
        "id": "leave_123",
        "employee": {
          "id": "user_123",
          "name": "John Doe",
          "department": "Engineering"
        },
        "leaveType": "sick",
        "startDate": "2025-10-28",
        "endDate": "2025-10-28",
        "duration": 1,
        "reason": "Not feeling well",
        "status": "pending",
        "appliedOn": "2025-10-25T10:30:00Z",
        "attachment": "https://cloudinary.com/doc.pdf"
      }
    ],
    "pagination": {
      "total": 53,
      "page": 1,
      "limit": 30,
      "totalPages": 2
    }
  }
}
```

---

### **15. Approve/Reject Leave**
`PUT /leave/{leaveId}/approve`

**Access:** Admin only

**Request Body:**
```json
{
  "action": "approve", // "approve" or "reject"
  "comments": "Approved as per policy"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Leave request approved",
  "data": {
    "leaveId": "leave_123",
    "status": "approved",
    "updatedBy": "admin_user_id",
    "updatedAt": "2025-10-25T14:30:00Z"
  }
}
```

---

## **💰 Payroll Endpoints**

### **16. Get Salary Information**
`GET /payroll/{employeeId}`

**Access:** 
- Employee: Can view own salary info (read-only)
- Admin: Can view and edit

**Response (200 OK):**
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
      },
      {
        "name": "Professional Tax",
        "type": "fixed",
        "amount": 200
      }
    ],
    "totals": {
      "grossSalary": 50000,
      "totalDeductions": 6200,
      "netSalary": 43800,
      "employerPF": 3000,
      "employerContribution": 3000
    },
    "workingSchedule": {
      "workingDaysPerWeek": 5,
      "workingHoursPerDay": 8,
      "breakTime": "01:00"
    }
  }
}
```

---

### **17. Update Salary Structure**
`PUT /payroll/{employeeId}/structure`

**Access:** Admin only

**Request Body:**
```json
{
  "monthlyWage": 75000,
  "components": [
    {
      "name": "Basic Salary",
      "type": "percentage",
      "percentage": 50
    },
    {
      "name": "House Rent Allowance",
      "type": "percentage_of_basic",
      "percentage": 50
    },
    {
      "name": "Standard Allowance",
      "type": "fixed",
      "amount": 4167
    }
  ],
  "deductions": [
    {
      "name": "Provident Fund",
      "percentage": 12
    },
    {
      "name": "Professional Tax",
      "amount": 200
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Salary structure updated",
  "data": {
    "recalculated": true,
    "newMonthlyWage": 75000,
    "netSalary": 65700
  }
}
```

---

### **18. Generate Payslip**
`POST /payroll/{employeeId}/payslip`

**Query Parameters:**
- `month` (required, format: YYYY-MM)
- `year` (required, format: YYYY)

**Access:** Employee (own payslip), Admin (any payslip)

**Response (200 OK):**
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
      "month": "October",
      "year": 2025,
      "paymentDate": "2025-11-05"
    },
    "attendance": {
      "totalDays": 22,
      "presentDays": 20,
      "leaves": 2,
      "payableDays": 20
    },
    "earnings": [
      {
        "component": "Basic Salary",
        "amount": 25000,
        "payableAmount": 22727.27 // Pro-rated based on payable days
      }
    ],
    "deductions": [
      {
        "component": "Provident Fund",
        "amount": 3000,
        "payableAmount": 2727.27
      }
    ],
    "summary": {
      "grossEarnings": 50000,
      "totalDeductions": 6200,
      "netPayable": 43800,
      "proRatedAmount": 39818.18,
      "inWords": "Thirty Nine Thousand Eight Hundred Eighteen Rupees and Eighteen Paise Only"
    },
    "pdfUrl": "https://cloudinary.com/payslip_oct_2025.pdf"
  }
}
```

---

## **👥 Admin Management Endpoints**

### **19. Get All Employees**
`GET /admin/employees`

**Query Parameters:**
- `department` (optional)
- `status` (optional: "active", "inactive")
- `search` (optional: search by name, email, employee code)
- `page` (default: 1)
- `limit` (default: 50)

**Access:** Admin only

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "user_123",
        "employeeCode": "EMP001",
        "name": "John Doe",
        "email": "john.doe@company.com",
        "profilePic": "https://cloudinary.com/image.jpg",
        "department": "Engineering",
        "jobPosition": "Software Engineer",
        "location": "Mumbai",
        "status": "active",
        "attendanceToday": {
          "status": "present",
          "checkIn": "09:30",
          "checkOut": null
        }
      }
    ],
    "summary": {
      "total": 150,
      "active": 145,
      "onLeave": 10,
      "departments": [
        {
          "name": "Engineering",
          "count": 50
        }
      ]
    },
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "totalPages": 3
    }
  }
}
```

---

### **20. Update Employee Status**
`PUT /admin/employees/{employeeId}/status`

**Access:** Admin only

**Request Body:**
```json
{
  "status": "inactive", // "active", "inactive", "terminated"
  "reason": "Employee resigned",
  "effectiveDate": "2025-10-31"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employee status updated to inactive"
}
```

---

## **📊 Analytics Endpoints**

### **21. Get HR Analytics**
`GET /analytics/hr`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `department` (optional)

**Access:** Admin only

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attendanceTrends": {
      "daily": [
        {
          "date": "2025-10-26",
          "present": 120,
          "absent": 20,
          "onLeave": 10
        }
      ],
      "monthly": [
        {
          "month": "October 2025",
          "avgAttendance": 85.5,
          "avgOvertime": 4.2
        }
      ]
    },
    "leaveAnalytics": {
      "byType": [
        {
          "type": "paid",
          "count": 45,
          "percentage": 65
        }
      ],
      "byDepartment": [
        {
          "department": "Engineering",
          "leavesTaken": 120,
          "avgLeaves": 2.4
        }
      ]
    },
    "salaryAnalytics": {
      "byDepartment": [
        {
          "department": "Engineering",
          "avgSalary": 75000,
          "minSalary": 40000,
          "maxSalary": 150000
        }
      ],
      "distribution": {
        "0-50000": 25,
        "50001-100000": 60,
        "100001+": 15
      }
    }
  }
}
```

---

## **📧 Notification Endpoints**

### **22. Get Notifications**
`GET /notifications`

**Query Parameters:**
- `unreadOnly` (optional: true/false)
- `type` (optional: "leave", "attendance", "payroll", "system")
- `page` (default: 1)
- `limit` (default: 20)

**Access:** Authenticated users

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "leave_approved",
        "title": "Leave Request Approved",
        "message": "Your leave request for Oct 28 has been approved",
        "read": false,
        "timestamp": "2025-10-25T14:30:00Z",
        "metadata": {
          "leaveId": "leave_123",
          "actionBy": "Jane Smith"
        }
      }
    ],
    "unreadCount": 3
  }
}
```

---

### **23. Mark Notification as Read**
`PUT /notifications/{notificationId}/read`

**Access:** Authenticated users

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## **🛡 Error Responses**

All endpoints follow this error format:

**HTTP Status: 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "email": "Must be a valid email address"
    }
  }
}
```

**HTTP Status: 401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**HTTP Status: 403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

**HTTP Status: 404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found"
  }
}
```

---

## **🔗 API Rate Limiting**

- **Authentication endpoints:** 5 requests per minute per IP
- **Other endpoints:** 100 requests per minute per user
- **Admin endpoints:** 200 requests per minute per admin

---

## **📝 API Versioning**

- Version in URL: `/v1/`
- Version in headers: `X-API-Version: 1.0`
- Backward compatibility maintained for at least 6 months

---

## **📡 Webhook Events**

**Endpoint:** `POST /webhooks/{eventType}`

**Events:**
- `employee.created`
- `leave.approved`
- `leave.rejected`
- `attendance.regularized`
- `payslip.generated`

---

**Note for Developers:** All date-time fields are in ISO 8601 format (UTC). All monetary values are in INR (₹). File uploads accept base64 strings or multipart form data as specified.