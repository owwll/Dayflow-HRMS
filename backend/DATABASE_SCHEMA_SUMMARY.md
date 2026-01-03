# Database Schema Summary - Profile Information Storage

## ✅ All Profile Information Columns Are Available

Your database schema includes **all necessary columns** to store complete profile information. Here's what's available:

### User Table (`User`)
Stores basic user authentication and identity:
- `id` - Unique identifier
- `email` - User email (unique)
- `loginId` - Login ID (unique)
- `passwordHash` - Hashed password
- `role` - User role (ADMIN/EMPLOYEE)
- `firstName` - First name
- `lastName` - Last name
- `profilePicUrl` - Profile picture URL
- `isVerified` - Email verification status
- `isFirstLogin` - First login flag
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Employee Table (`Employee`)
Stores all employee-specific profile information:

#### Personal Information
- `id` - Unique identifier
- `userId` - Reference to User table (unique)
- `employeeCode` - Employee code (unique)
- `dateOfBirth` - Date of birth (optional)
- `gender` - Gender (optional)
- `maritalStatus` - Marital status (optional)
- `nationality` - Nationality (optional)
- `address` - Address (optional)
- `phone` - Phone number (optional)

#### Professional Information
- `company` - Company name
- `department` - Department
- `jobPosition` - Job position (optional)
- `managerId` - Manager reference (optional)
- `location` - Work location
- `dateOfJoining` - Date of joining
- `status` - Employee status (ACTIVE/INACTIVE/TERMINATED)

#### Work Schedule
- `workingDays` - Working days per week (default: 5)
- `dailyHours` - Daily working hours (default: 8)
- `breakTime` - Break time (default: "01:00")

#### Salary Information
- `monthlyWage` - Monthly wage/salary

#### Bank & Legal Details
- `accountNumber` - Bank account number (optional)
- `bankName` - Bank name (optional)
- `ifscCode` - IFSC code (optional)
- `panNumber` - PAN number (optional)
- `uanNumber` - UAN number (optional)

## Database Status

✅ **Database is in sync with schema**
- All tables exist
- All columns are available
- All relationships are properly configured

## How to Verify

Run this command to verify your database structure:
```bash
cd backend
npm run prisma:studio
```

This will open Prisma Studio where you can:
1. View all tables
2. See all columns
3. Browse existing data
4. Verify data structure

## Profile Update Flow

When updating profile information:

1. **Personal Info** (firstName, lastName, phone, address, dateOfBirth, gender, maritalStatus, nationality)
   - Stored in: `User` table (firstName, lastName) and `Employee` table (others)

2. **Professional Info** (company, department, jobPosition, location, dateOfJoining)
   - Stored in: `Employee` table

3. **Bank Details** (accountNumber, bankName, ifscCode, panNumber, uanNumber)
   - Stored in: `Employee` table

## API Endpoints for Profile Updates

- `PUT /api/v1/profile/:userId` - Update profile
  - Admin can update: All fields
  - Employee can update: phone, address only

- `GET /api/v1/profile/:userId` - Get profile
  - Returns all profile information in structured format

## Next Steps

Your database is ready! All columns exist and are properly configured. You can now:

1. ✅ Update profiles via API
2. ✅ Store all profile information
3. ✅ View data in Prisma Studio
4. ✅ Use all profile fields in your application

## Troubleshooting

If you encounter issues:

1. **Verify database connection:**
   ```bash
   npm run prisma:studio
   ```

2. **Check schema sync:**
   ```bash
   npm run prisma:push
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

All profile information columns are available and ready to use! 🎉

