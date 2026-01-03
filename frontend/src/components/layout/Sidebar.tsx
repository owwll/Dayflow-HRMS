import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Wallet,
  FileText,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  UserCircle
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Employees', href: '/admin/employees', icon: Users },
  { label: 'Attendance', href: '/admin/attendance', icon: Clock },
  { label: 'Leave Management', href: '/admin/leave', icon: CalendarDays },
  { label: 'Payroll', href: '/admin/payroll', icon: Wallet },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
];

const bottomNavItems = [
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const getInitials = () => {
    if (!user) return 'A';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <span className="text-lg font-bold text-sidebar-primary-foreground">D</span>
            </div>
            <span className="text-lg font-semibold">Dayflow</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Switch to Employee View */}
        {!collapsed && (
          <div className="mx-3 mt-6 p-3 rounded-lg bg-sidebar-accent">
            <p className="text-xs text-sidebar-foreground/70 mb-2">Quick Switch</p>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-sidebar-primary hover:underline"
            >
              <UserCircle className="h-4 w-4" />
              Employee View
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border py-4">
        <ul className="space-y-1 px-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user?.profilePic || undefined} alt={user?.firstName} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{(user as any)?.jobPosition || 'HR Admin'}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            'mt-3 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed ? 'px-0 justify-center' : 'justify-start'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
