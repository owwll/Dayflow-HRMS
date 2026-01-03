import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  CalendarDays, 
  Wallet, 
  TrendingUp,
  TrendingDown,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Employees',
      value: '48',
      change: '+3',
      trend: 'up',
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Present Today',
      value: '42',
      change: '87%',
      trend: 'up',
      icon: Clock,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Pending Leaves',
      value: '5',
      change: '+2',
      trend: 'neutral',
      icon: CalendarDays,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Payroll This Month',
      value: '₹12,45,000',
      change: '+8%',
      trend: 'up',
      icon: Wallet,
      color: 'bg-accent text-accent-foreground',
    },
  ];

  const quickActions = [
    { label: 'Add Employee', href: '/admin/employees/new', icon: UserPlus },
    { label: 'Approve Leaves', href: '/admin/leave', icon: CheckCircle2 },
    { label: 'View Reports', href: '/admin/reports', icon: TrendingUp },
    { label: 'Run Payroll', href: '/admin/payroll', icon: Wallet },
  ];

  const pendingLeaves = [
    { id: 1, name: 'Rahul Kumar', type: 'Paid Leave', dates: 'Jan 5-7', days: 3 },
    { id: 2, name: 'Ananya Patel', type: 'Sick Leave', dates: 'Jan 8', days: 1 },
    { id: 3, name: 'Vikram Singh', type: 'Unpaid Leave', dates: 'Jan 10-12', days: 3 },
  ];

  const recentHires = [
    { id: 1, name: 'Sneha Reddy', position: 'Software Engineer', date: 'Dec 28' },
    { id: 2, name: 'Arjun Mehta', position: 'Marketing Manager', date: 'Dec 20' },
    { id: 3, name: 'Kavya Nair', position: 'HR Specialist', date: 'Dec 15' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <PageContainer>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.firstName}. Here's what's happening today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stat.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-success" />
                        ) : stat.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-warning" />
                        )}
                        <span className="text-xs text-muted-foreground">{stat.change}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            {quickActions.map((action) => (
              <Button key={action.href} variant="outline" asChild>
                <Link to={action.href}>
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Leave Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Pending Leave Requests</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/leave">
                    View all
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{leave.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.type} • {leave.dates} ({leave.days} day{leave.days > 1 ? 's' : ''})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                          Reject
                        </Button>
                        <Button size="sm" className="h-8">
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Hires */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Hires</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/employees">
                    View all
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentHires.map((hire) => (
                    <div key={hire.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {hire.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{hire.name}</p>
                        <p className="text-sm text-muted-foreground">{hire.position}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{hire.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Overview Chart Placeholder */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Attendance chart will be displayed here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    (Charts coming in Phase 7)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </main>
    </div>
  );
}
