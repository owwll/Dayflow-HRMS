import { useState, useEffect } from 'react';
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
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { leaveService } from '@/services/leave.service';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { LeaveRequest, EmployeeCard } from '@/types';
import { getImageUrlWithCacheBust } from '@/lib/utils';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [recentEmployees, setRecentEmployees] = useState<EmployeeCard[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch dashboard summary
      const dashboardData = await dashboardService.getDashboardData();
      if (dashboardData.summary) {
        setSummary(dashboardData.summary);
      }
      if (dashboardData.employeeCards) {
        setRecentEmployees(dashboardData.employeeCards.slice(0, 5));
      }

      // Fetch pending leave requests
      const leaveData = await leaveService.getLeaveRequests('PENDING', 1, 5);
      setPendingLeaves(leaveData.requests || []);
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

  const stats = [
    {
      title: 'Total Employees',
      value: summary.totalEmployees.toString(),
      change: '',
      trend: 'neutral' as const,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Present Today',
      value: summary.presentToday.toString(),
      change: summary.totalEmployees > 0 ? `${Math.round((summary.presentToday / summary.totalEmployees) * 100)}%` : '0%',
      trend: 'up' as const,
      icon: Clock,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Pending Leaves',
      value: summary.pendingApprovals.toString(),
      change: '',
      trend: 'neutral' as const,
      icon: CalendarDays,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'On Leave Today',
      value: summary.onLeave.toString(),
      change: '',
      trend: 'neutral' as const,
      icon: CalendarDays,
      color: 'bg-accent text-accent-foreground',
    },
  ];

  const quickActions = [
    { label: 'Add Employee', href: '/admin/employees/new', icon: UserPlus },
    { label: 'Approve Leaves', href: '/admin/leave', icon: CheckCircle2 },
    { label: 'View Reports', href: '/admin/reports', icon: TrendingUp },
    { label: 'Run Payroll', href: '/admin/payroll', icon: Wallet },
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No pending leave requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingLeaves.map((leave) => {
                      const employeeName = leave.employeeName || leave.employee?.name || 'Unknown';
                      const startDateObj = leave.startDate ? new Date(leave.startDate) : null;
                      const endDateObj = leave.endDate ? new Date(leave.endDate) : null;
                      const startLabel = startDateObj && !isNaN(startDateObj.getTime()) ? format(startDateObj, 'MMM dd') : 'N/A';
                      const endLabel = endDateObj && !isNaN(endDateObj.getTime()) ? format(endDateObj, 'MMM dd, yyyy') : 'N/A';
                      const dates = leave.startDate === leave.endDate ? startLabel : `${startLabel} - ${endLabel}`;
                      const days = leave.duration || 0;
                      return (
                        <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium">{employeeName}</p>
                            <p className="text-sm text-muted-foreground">
                              {leave.leaveType} • {dates} ({days} day{days > 1 ? 's' : ''})
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8"
                              onClick={async () => {
                                try {
                                  await leaveService.approveLeave(leave.id, 'reject');
                                  toast({ title: 'Leave rejected', variant: 'default' });
                                  fetchDashboardData();
                                } catch (error: any) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to reject leave',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8"
                              onClick={async () => {
                                try {
                                  await leaveService.approveLeave(leave.id, 'approve');
                                  toast({ title: 'Leave approved', variant: 'default' });
                                  fetchDashboardData();
                                } catch (error: any) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to approve leave',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employee Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Employees</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/employees">
                    View all
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : recentEmployees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No employees found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEmployees.map((emp) => (
                      <div key={emp.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {emp.profilePic ? (
                            <img src={getImageUrlWithCacheBust(emp.profilePic) || emp.profilePic} alt={emp.name} className="h-full w-full object-cover" key={emp.profilePic} />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-sm text-muted-foreground">{emp.role || emp.department || 'Employee'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {emp.attendance?.checkIn ? `In: ${format(new Date(emp.attendance.checkIn), 'h:mm a')}` : 'Not checked in'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
