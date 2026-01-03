import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  User, 
  Clock, 
  CalendarDays, 
  Wallet, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'My Profile',
      description: 'View and update your personal information',
      href: '/profile',
      icon: User,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Attendance',
      description: 'Check in/out and view attendance history',
      href: '/attendance',
      icon: Clock,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Leave Requests',
      description: 'Apply for leave or check request status',
      href: '/leave',
      icon: CalendarDays,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Payroll',
      description: 'View salary details and pay slips',
      href: '/payroll',
      icon: Wallet,
      color: 'bg-accent text-accent-foreground',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'attendance',
      message: 'Checked in at 9:00 AM',
      time: 'Today',
      icon: CheckCircle2,
      iconColor: 'text-success',
    },
    {
      id: 2,
      type: 'leave',
      message: 'Leave request approved for Dec 25-26',
      time: 'Yesterday',
      icon: CheckCircle2,
      iconColor: 'text-success',
    },
    {
      id: 3,
      type: 'payroll',
      message: 'December salary credited',
      time: '2 days ago',
      icon: Wallet,
      iconColor: 'text-primary',
    },
    {
      id: 4,
      type: 'leave',
      message: 'Leave request pending approval',
      time: '3 days ago',
      icon: AlertCircle,
      iconColor: 'text-warning',
    },
  ];

  const stats = [
    { label: 'Days Present', value: '22', subtext: 'This month' },
    { label: 'Leave Balance', value: '12', subtext: 'Days remaining' },
    { label: 'Pending Requests', value: '1', subtext: 'Awaiting approval' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <PageContainer>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-semibold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Card key={action.href} className="hover:shadow-md transition-shadow">
                  <Link to={action.href}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <action.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <activity.icon className={`h-5 w-5 mt-0.5 ${activity.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link to="/notifications">View all activity</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Check-in Card */}
        <Card className="mt-6">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-medium">Ready to start your day?</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't checked in yet today.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/attendance">
                  Check In Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
