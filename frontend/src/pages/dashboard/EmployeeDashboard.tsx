import { useState, useEffect } from 'react';
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
  ArrowRight,
  Loader2
} from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { attendanceService } from '@/services/attendance.service';
import { leaveService } from '@/services/leave.service';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    daysPresent: 0,
    leaveBalance: { paid: 0, sick: 0, unpaid: 0 },
    pendingRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<{
    isCheckedIn: boolean;
    checkInTime: string | null;
    checkOutTime: string | null;
  }>({
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

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

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch dashboard data
      const dashboardData = await dashboardService.getDashboardData();
      
      // Update stats from dashboard data
      if (dashboardData.quickStats) {
        const totalLeaveBalance = dashboardData.quickStats.leaveBalance.paid + 
                                  dashboardData.quickStats.leaveBalance.sick;
        setStats({
          daysPresent: 0, // Will be calculated from attendance
          leaveBalance: dashboardData.quickStats.leaveBalance,
          pendingRequests: 0, // Will be calculated from leave requests
        });
        
        // Set attendance status
        setAttendanceStatus({
          isCheckedIn: dashboardData.quickStats.attendanceToday === 'present' && !!dashboardData.quickStats.checkInTime,
          checkInTime: dashboardData.quickStats.checkInTime,
          checkOutTime: dashboardData.quickStats.checkOutTime,
        });
      }
      
      // Fetch attendance to get days present
      try {
        const currentDate = new Date();
        const month = format(currentDate, 'yyyy-MM');
        const attendanceData = await attendanceService.getAttendanceRecords(month, 1, 100);
        if (attendanceData.records) {
          const thisMonthRecords = attendanceData.records.filter(r => r.status === 'PRESENT' || r.status === 'present');
          setStats(prev => ({ ...prev, daysPresent: thisMonthRecords.length }));
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
      
      // Fetch leave requests to get pending count
      try {
        const leaveData = await leaveService.getLeaveRequests('PENDING', 1, 100);
        if (leaveData.requests) {
          setStats(prev => ({ ...prev, pendingRequests: leaveData.requests.length }));
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
      
      // Set recent activity from dashboard data
      if (dashboardData.recentActivity) {
        const activities = dashboardData.recentActivity.map((activity: any) => {
          let icon = CheckCircle2;
          let iconColor = 'text-success';
          
          if (activity.type?.includes('leave')) {
            icon = CalendarDays;
            if (activity.message?.toLowerCase().includes('pending')) {
              iconColor = 'text-warning';
              icon = AlertCircle;
            }
          } else if (activity.type?.includes('payroll')) {
            icon = Wallet;
            iconColor = 'text-primary';
          } else if (activity.type?.includes('attendance')) {
            icon = Clock;
            iconColor = 'text-success';
          }
          
          return {
            id: activity.id,
            type: activity.type,
            message: activity.message,
            time: activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Recently',
            icon,
            iconColor,
          };
        });
        setRecentActivity(activities);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Present</p>
                  <p className="text-3xl font-semibold mt-1">{isLoading ? '...' : stats.daysPresent}</p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Leave Balance</p>
                  <p className="text-3xl font-semibold mt-1">
                    {isLoading ? '...' : (stats.leaveBalance.paid + stats.leaveBalance.sick)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Days remaining</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-3xl font-semibold mt-1">{isLoading ? '...' : stats.pendingRequests}</p>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Check-in Card */}
        <Card className="mt-6">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${attendanceStatus.isCheckedIn ? 'bg-success/10' : 'bg-muted'}`}>
                  <Clock className={`h-6 w-6 ${attendanceStatus.isCheckedIn ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-medium">
                    {attendanceStatus.isCheckedIn ? 'Checked In' : 'Ready to start your day?'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {attendanceStatus.isCheckedIn 
                      ? attendanceStatus.checkInTime 
                        ? `Checked in at ${format(new Date(attendanceStatus.checkInTime), 'h:mm a')}${attendanceStatus.checkOutTime ? `, out at ${format(new Date(attendanceStatus.checkOutTime), 'h:mm a')}` : ''}`
                        : 'You are checked in'
                      : "You haven't checked in yet today."}
                  </p>
                </div>
              </div>
              {!attendanceStatus.isCheckedIn ? (
                <Button asChild>
                  <Link to="/attendance">
                    Check In Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link to="/attendance">
                    View Attendance
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
