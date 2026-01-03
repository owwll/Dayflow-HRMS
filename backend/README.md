# Dayflow HRMS Backend

A comprehensive Human Resource Management System backend built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Two-factor authentication with OTP via email
  - Role-based access control (Admin/Employee)
  - Secure password hashing with bcrypt

- **Employee Management**
  - Employee registration and profile management
  - Auto-generated login IDs and temporary passwords
  - Profile picture upload with Cloudinary
  - Employee status management

- **Attendance Tracking**
  - Check-in/check-out with location tracking
  - Work hours and overtime calculation
  - Monthly attendance reports
  - Admin attendance overview

- **Leave Management**
  - Leave application with attachments
  - Leave approval/rejection workflow
  - Leave balance tracking
  - Email notifications for leave status

- **Payroll System**
  - Salary structure management
  - Automated salary calculations
  - Payslip generation with pro-rating
  - Attendance-based payroll computation

- **Notifications**
  - Real-time notifications for important events
  - Email notifications for critical actions
  - Notification management system

- **Analytics & Reporting**
  - Dashboard with role-specific data
  - Employee statistics
  - Attendance and leave analytics

## 🛠 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon Console)
- **ORM:** Prisma
- **Authentication:** JWT, Bcrypt
- **Email:** Nodemailer
- **File Upload:** Multer, Cloudinary
- **Validation:** Zod
- **Logging:** Winston, Morgan
- **Security:** Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL database (Neon Console recommended)
- Cloudinary account for file uploads
- Email service credentials (Gmail/SendGrid/etc.)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string from Neon Console
   - `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: Random secure strings
   - Email credentials (SMTP settings)
   - Cloudinary credentials (cloud name, API key, API secret)

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```
   
   Or push schema directly (for development):
   ```bash
   npm run prisma:push
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Database Management
```bash
# Open Prisma Studio
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Authentication
- `POST /auth/register` - Admin creates employee
- `POST /auth/login` - Login with email/password
- `POST /auth/verify-otp` - Verify OTP
- `PUT /auth/change-password` - Change password
- `POST /auth/refresh-token` - Refresh access token

### Profile
- `GET /profile/:userId` - Get user profile
- `PUT /profile/:userId` - Update profile
- `POST /profile/:userId/upload-picture` - Upload profile picture

### Dashboard
- `GET /dashboard` - Get role-specific dashboard data

### Attendance
- `POST /attendance/check-in` - Check in
- `POST /attendance/check-out` - Check out
- `GET /attendance` - Get attendance records

### Leave Management
- `POST /leave/apply` - Apply for leave
- `GET /leave` - Get leave requests
- `PUT /leave/:leaveId/approve` - Approve/reject leave

### Payroll
- `GET /payroll/:employeeId` - Get salary information
- `PUT /payroll/:employeeId/structure` - Update salary structure
- `POST /payroll/:employeeId/payslip` - Generate payslip

### Admin
- `GET /admin/employees` - Get all employees
- `PUT /admin/employees/:employeeId/status` - Update employee status

### Notifications
- `GET /notifications` - Get notifications
- `PUT /notifications/:notificationId/read` - Mark as read

## 🔒 Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting on all endpoints
- Enhanced rate limiting on authentication endpoints
- JWT token expiration
- Password hashing with bcrypt
- Input validation with Zod
- SQL injection prevention via Prisma ORM

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` - Email service config
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary config

## 🗄 Database Schema

The application uses Prisma ORM with the following main models:
- User
- Employee
- Attendance
- LeaveRequest
- SalaryComponent
- OTP
- RefreshToken
- Notification

See `prisma/schema.prisma` for the complete schema.

## 📚 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Request validators
│   ├── types/           # TypeScript types
│   └── index.ts         # Application entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## 🧪 Testing

The API can be tested using:
- Postman
- Thunder Client
- cURL
- Any HTTP client

## 📄 License

ISC

## 👥 Support

For issues and questions, please contact your system administrator.
