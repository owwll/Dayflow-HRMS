# Dayflow HRMS Frontend

Modern, responsive React frontend for the Dayflow HRMS system built with TypeScript, Material-UI, and Vite.

## 🚀 Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI) v5
- **Routing:** React Router v6
- **State Management:** Context API + React Query
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod
- **Charts:** Recharts
- **Notifications:** React Toastify
- **Date Handling:** date-fns

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend server running on `http://localhost:5001`

## 🔧 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:5001/api/v1
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── assets/              # Images, logos, icons
├── components/          # Reusable components
│   ├── common/          # Buttons, Cards, Modals
│   ├── layout/          # Header, Sidebar, Footer
│   └── forms/           # Form components
├── pages/               # Page components
│   ├── Auth/            # Login, OTP, Password Change
│   ├── Dashboard/       # Employee & Admin dashboards
│   ├── Profile/         # Profile view & edit
│   ├── Attendance/      # Attendance tracking
│   ├── Leave/           # Leave management
│   ├── Payroll/         # Salary & payslips
│   └── Admin/           # Admin-only pages
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── services/            # API services
├── types/               # TypeScript types
├── utils/               # Utility functions
├── theme/               # MUI theme
├── App.tsx              # Main app
└── main.tsx             # Entry point
```

## 🎨 Features

### Authentication
- ✅ Email/password login
- ✅ OTP verification
- ✅ First-time password change
- ✅ Token refresh mechanism
- ✅ Persistent login

### Dashboard
- ✅ Role-specific views (Employee/Admin)
- ✅ Quick-access cards
- ✅ Real-time attendance status
- ✅ Notifications panel
- ✅ Recent activity feed

### Profile Management
- ✅ View/edit profile
- ✅ Profile picture upload
- ✅ Role-based permissions
- ✅ Tabbed interface

### Attendance
- ✅ Check-in/check-out
- ✅ Geolocation tracking
- ✅ Monthly calendar view
- ✅ Work hours calculation
- ✅ Attendance history

### Leave Management
- ✅ Apply for leave
- ✅ File attachments
- ✅ Leave balance tracking
- ✅ Status tracking
- ✅ Admin approval interface

### Payroll
- ✅ Salary breakdown
- ✅ Component-wise details
- ✅ Payslip generation
- ✅ Charts and visualization

### Admin Features
- ✅ Employee management
- ✅ Create employees
- ✅ Approve/reject leaves
- ✅ View all attendance
- ✅ Manage salary structures

## 🛠 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
VITE_APP_NAME=Dayflow HRMS
VITE_APP_VERSION=1.0.0
```

## 🎯 Key Pages

### Login (`/login`)
- Email and password input
- OTP verification modal
- Auto-redirect on first login

### Dashboard (`/dashboard`)
- **Employee:** Quick stats, attendance, leave balance
- **Admin:** Employee cards, summary, pending approvals

### Profile (`/profile`)
- Personal, Professional, Bank details tabs
- Edit mode with validation
- Profile picture upload

### Attendance (`/attendance`)
- Check-in/check-out buttons
- Monthly calendar view
- Attendance history with filters

### Leave (`/leave`)
- Apply for leave form
- Leave requests list
- Admin approval interface

### Payroll (`/payroll`)
- Salary information
- Component breakdown
- Payslip viewer

## 🎨 Design System

### Colors
- **Primary:** #1976d2 (Blue)
- **Secondary:** #dc004e (Pink)
- **Success:** #4caf50 (Green)
- **Warning:** #ff9800 (Orange)
- **Error:** #f44336 (Red)

### Typography
- **Font:** Roboto
- **Headings:** Bold, larger sizes
- **Body:** Regular weight

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile (375px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1920px+)

## 🔒 Security

- JWT token authentication
- Automatic token refresh
- Protected routes
- Role-based access control
- Secure file uploads

## 🐛 Troubleshooting

### CORS Error
Ensure backend CORS is configured to allow `http://localhost:5173`

### API Connection Failed
- Check if backend is running on port 5001
- Verify `VITE_API_BASE_URL` in `.env`

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- [Material-UI Docs](https://mui.com/)
- [React Router Docs](https://reactrouter.com/)
- [Vite Docs](https://vitejs.dev/)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

## 📄 License

ISC

## 👥 Support

For issues and questions, please contact your system administrator.

---

**Built with ❤️ for Dayflow HRMS**
