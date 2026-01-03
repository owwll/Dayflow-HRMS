# Dayflow HRMS Backend - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required Configurations:**

#### Database (Neon Console)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in `.env`

#### Email Service (Gmail Example)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update email settings in `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

#### Cloudinary
1. Sign up at https://cloudinary.com
2. Get your credentials from the dashboard
3. Update in `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

#### JWT Secrets
Generate random secure strings:
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use any random string generator
```

Update in `.env`:
```
JWT_ACCESS_SECRET=your-generated-secret-1
JWT_REFRESH_SECRET=your-generated-secret-2
```

### 3. Set Up Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Or run migrations (recommended for production)
npm run prisma:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Test the API
Visit: `http://localhost:5000/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

## Creating the First Admin User

Since the `/auth/register` endpoint requires admin authentication, you need to create the first admin user manually in the database.

### Option 1: Using Prisma Studio
```bash
npm run prisma:studio
```

1. Open the `User` model
2. Click "Add record"
3. Fill in the details:
   - email: admin@company.com
   - loginId: ADMIN001
   - passwordHash: (use bcrypt to hash a password)
   - role: ADMIN
   - firstName: Admin
   - lastName: User
   - isVerified: true
   - isFirstLogin: false

### Option 2: Using SQL
Connect to your database and run:
```sql
-- First, hash your password using bcrypt (rounds=10)
-- For password "Admin@123", the hash would be generated

INSERT INTO "User" (id, email, "loginId", "passwordHash", role, "firstName", "lastName", "isVerified", "isFirstLogin", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@company.com',
  'ADMIN001',
  '$2b$10$YourHashedPasswordHere',
  'ADMIN',
  'Admin',
  'User',
  true,
  false,
  NOW(),
  NOW()
);
```

## Common Issues

### Database Connection Error
- Verify your `DATABASE_URL` is correct
- Check if your IP is whitelisted in Neon Console
- Ensure the database exists

### Email Not Sending
- Verify SMTP credentials
- Check if less secure app access is enabled (for Gmail)
- Use App Password instead of regular password

### Cloudinary Upload Fails
- Verify API credentials
- Check file size limits
- Ensure proper MIME types

### Port Already in Use
Change the port in `.env`:
```
PORT=3001
```

## Development Tips

### View Database
```bash
npm run prisma:studio
```

### Check Logs
Logs are stored in the `logs/` directory:
- `error.log` - Error logs
- `combined.log` - All logs

### Reset Database
```bash
npx prisma migrate reset
```
⚠️ This will delete all data!

## Next Steps

1. Create your first admin user
2. Use the admin account to register employees via `/api/v1/auth/register`
3. Test the complete authentication flow
4. Explore other endpoints

## API Testing

Use the provided API specification document to test all endpoints with Postman or Thunder Client.

Base URL: `http://localhost:5000/api/v1`

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build the project: `npm run build`
3. Start with: `npm start`
4. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name dayflow-hrms
   ```

## Support

For issues, refer to:
- API Specification document
- System Description document
- README.md
