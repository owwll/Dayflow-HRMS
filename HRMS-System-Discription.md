# **Project Documentation: Dayflow HRMS**
**Version:** 1.0  
**Date:** 26/10/2025  
**Project:** Human Resource Management System  
**Tech Stack:** React (Frontend), Node.js + Express (Backend), PostgreSQL (Neon Console)

---

## **📘 Overview**

Dayflow HRMS is an internal web-based Human Resource Management System designed to streamline HR operations such as employee onboarding, attendance tracking, leave management, payroll visibility, and approval workflows. The system supports two main user roles: **Admin/HR Officer** and **Employee**, each with distinct permissions and views.

---

## **🎯 Objectives**

- Digitize HR processes
- Provide role-based access control
- Ensure secure authentication with OTP & email verification
- Deliver clean, intuitive UI with responsive design
- Implement secure backend with proper API structure
- Enable real-time data visualization and reporting

---

## **👥 User Roles & Permissions**

| Role         | Permissions                                                                 |
|--------------|-----------------------------------------------------------------------------|
| Admin/HR     | Full access: manage employees, approve leave/attendance, view/edit payroll, view all data |
| Employee     | Limited access: view own profile, attendance, leave requests, and payroll   |

---

# **📄 Documentation for Frontend Team (React)**

## **🛠 Tech Stack**
- **Framework:** React 18+ with TypeScript
- **Routing:** React Router v6
- **State Management:** Context API / Redux Toolkit
- **UI Library:** Material-UI / Ant Design / Custom Components
- **HTTP Client:** Axios
- **Charts:** Recharts / Chart.js
- **Icons:** React Icons
- **Build Tool:** Vite

---

## **📁 Folder Structure**

```
src/
├── assets/           # Images, logos, icons
├── components/       # Reusable UI components
│   ├── common/
│   ├── layout/
│   ├── cards/
│   ├── forms/
│   └── modals/
├── pages/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Profile/
│   ├── Attendance/
│   ├── Leave/
│   ├── Payroll/
│   └── Admin/
├── contexts/         # Auth, Theme, etc.
├── hooks/            # Custom hooks
├── services/         # API calls (axios instances)
├── utils/            # Helpers, constants
├── types/            # TypeScript interfaces
└── App.tsx
```

---

## **🎨 UI/UX Guidelines**

- Clean, minimal design
- Consistent spacing, typography, and color palette
- Mobile-responsive layouts
- Accessible components (ARIA labels, keyboard navigation)
- Loading states, error boundaries, and toast notifications

---

## **🔐 Authentication Flow**

### 1. **Sign Up (Admin-Only Creation)**
   - Admin creates employee → system auto-generates:
     - **Login ID:** `OT + First2Last2 + Year + Serial`
       - Example: `OTTODO20220001`
     - **Password:** Auto-generated, sent via email
   - Employee receives welcome email with credentials + OTP
   - First login requires password change

### 2. **Sign In**
   - Email + Password + OTP (sent via email)
   - Redirect to role-specific dashboard

---

## **📊 Page-wise Requirements**

### **1. Login Page**
- Email, password fields
- “Forgot Password” link
- OTP input after credentials
- Redirect to dashboard on success

### **2. Employee Dashboard**
- Quick-access cards: Profile, Attendance, Leave, Logout
- Recent activity/notifications
- Check-in / Check-out button with real-time status

### **3. Admin Dashboard**
- Employee cards grid (photo, name, role, department)
- Click card → opens employee detail view
- Tabs: Profile, Attendance, Leave, Payroll

### **4. Profile Page**
- **Employee View:** Editable limited fields (address, phone, photo)
- **Admin View:** Editable all fields + Salary Info tab (visible only to admin)
- Profile picture upload with preview

### **5. Attendance Page**
- **Employee:** Day-wise view for current month (Check-in/out times, breaks)
- **Admin:** List view of all employees’ attendance with search & filter
- Visual indicators: Present/Absent/Half-day/Leave

### **6. Leave Management**
- **Employee:** Apply leave (type, date range, remarks, attachment for sick leave)
- **Admin:** View all requests, approve/reject with comments
- Leave balance display

### **7. Payroll Page**
- **Employee:** Read-only salary slip view
- **Admin:** Editable salary structure with auto-calculation of components
- Visual breakdown of salary components (charts)

---

## **🔄 API Integration**
- Use Axios with interceptors for auth tokens
- Handle loading, success, error states
- Implement request/response logging in dev mode

---

## **🎯 Key Features to Implement**

- ✅ Role-based routing
- ✅ OTP-based login flow
- ✅ Profile picture upload & display
- ✅ Real-time attendance tracking UI
- ✅ Leave request/approval workflow
- ✅ Salary calculator with auto-update
- ✅ Responsive data tables & cards
- ✅ Toast notifications for actions

---

# **📄 Documentation for Backend Team (Node.js + PostgreSQL)**

## **🛠 Tech Stack**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon Console)
- **ORM:** Prisma / Sequelize
- **Auth:** JWT, Bcrypt, Nodemailer (OTP)
- **File Upload:** Multer + Cloudinary / Local storage
- **Validation:** Joi / Zod
- **Logging:** Winston / Morgan

---

## **🗄 Database Schema (Key Tables)**

### **Users**
```sql
id, email, login_id, password_hash, role, first_name, last_name, profile_pic_url, is_verified, created_at
```

### **Employees**
```sql
id, user_id, employee_code, company, department, manager_id, location, date_of_joining, salary, ...
```

### **Attendance**
```sql
id, employee_id, check_in, check_out, work_hours, extra_hours, status, date
```

### **LeaveRequests**
```sql
id, employee_id, leave_type, start_date, end_date, status, remarks, attachment_url, approved_by
```

### **SalaryComponents**
```sql
id, employee_id, basic, hra, standard_allowance, performance_bonus, lta, fixed_allowance, pf, professional_tax, month_year
```

---

## **🔐 Authentication & Security**

### **1. OTP System**
- Generate 6-digit OTP on login attempt
- Store hashed OTP in DB with expiry (5 mins)
- Send via Nodemailer
- Verify OTP before issuing JWT

### **2. JWT Tokens**
- Access token (short-lived) + Refresh token
- Role-based middleware
- Secure HTTP-only cookies

### **3. Password Policy**
- Auto-generate on user creation
- Force change on first login
- Bcrypt hashing

---

## **📬 Email Templates**

### **Welcome Email**
```
Subject: Welcome to Dayflow HRMS
Body: Your login ID: {login_id}, Temp password: {password}
Please login and change your password.
```

### **OTP Email**
```
Subject: Your OTP for Dayflow Login
Body: Your OTP is {otp}. Valid for 5 minutes.
```

---

## **🔗 API Endpoints**

| Method | Endpoint                | Description                     | Access      |
|--------|-------------------------|---------------------------------|-------------|
| POST   | /auth/register          | Admin creates employee          | Admin       |
| POST   | /auth/login             | Login with email + password     | All         |
| POST   | /auth/verify-otp        | Verify OTP                      | All         |
| POST   | /auth/change-password   | Change password                 | All         |
| GET    | /profile/:id            | Get profile                     | Role-based  |
| PUT    | /profile/:id            | Update profile                  | Role-based  |
| POST   | /attendance/check-in    | Check-in                        | Employee    |
| POST   | /attendance/check-out   | Check-out                       | Employee    |
| GET    | /attendance             | Get attendance records          | Role-based  |
| POST   | /leave/apply            | Apply leave                     | Employee    |
| PUT    | /leave/:id/approve      | Approve/reject leave            | Admin       |
| GET    | /payroll/:employee_id   | Get payroll data                | Role-based  |
| PUT    | /payroll/:employee_id   | Update salary structure         | Admin       |

---

## **🖼 Image Handling**

- Use Multer for upload
- Store in Cloudinary or `/uploads` with unique filename
- Store URL in DB
- Serve via static route

---

## **📈 Business Logic**

### **Salary Calculation**
- Auto-calculate components based on wage
- Ensure total ≤ wage
- Recalculate on wage update

### **Attendance → Payroll**
- Use attendance records to compute payable days
- Deduct unpaid leaves automatically

---

## **🔒 Security Checklist**
- ✅ SQL injection prevention (ORM)
- ✅ XSS protection (sanitize inputs)
- ✅ Rate limiting on auth routes
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ HTTPS enforcement in production

---

## **📦 Deployment Notes**
- Use PM2 / Docker
- Environment: `development`, `staging`, `production`
- Database backups automated
- Log rotation enabled

---

## **📞 Collaboration**

- Frontend & Backend teams to agree on API contract (OpenAPI/Swagger)
- Weekly sync for integration testing
- Use shared mock server in early dev phase

---

## **✅ Deliverables**

### **Frontend:**
- Clean, responsive UI matching prototypes
- Role-based navigation & views
- Integrated API calls with error handling
- OTP login flow
- Profile picture upload

### **Backend:**
- Secure REST API with JWT & OTP
- PostgreSQL schema with relationships
- Automated email service
- File upload system
- Salary calculation logic
- Attendance-based payroll computation

---