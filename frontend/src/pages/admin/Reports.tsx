import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, TrendingUp, Users, Clock, DollarSign, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { reportsService } from '@/services/reports.service';
import { dashboardService } from '@/services/dashboard.service';
import { adminService } from '@/services/admin.service';
import { attendanceService } from '@/services/attendance.service';
import { leaveService } from '@/services/leave.service';
import { payrollService } from '@/services/payroll.service';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { subDays, subMonths, subYears, eachDayOfInterval, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

// Dummy data for initial display
const dummyStats = {
  totalEmployees: 48,
  avgAttendance: 87,
  monthlyPayroll: 1245000,
  pendingLeaves: 5,
};

const dummyAttendanceData = [
  { date: '2025-01-01', present: 45, absent: 3, onLeave: 0 },
  { date: '2025-01-02', present: 44, absent: 2, onLeave: 2 },
  { date: '2025-01-03', present: 46, absent: 1, onLeave: 1 },
  { date: '2025-01-04', present: 45, absent: 2, onLeave: 1 },
  { date: '2025-01-05', present: 47, absent: 1, onLeave: 0 },
];

const dummyLeaveData = [
  { type: 'Paid', count: 45, percentage: 65 },
  { type: 'Sick', count: 20, percentage: 29 },
  { type: 'Unpaid', count: 4, percentage: 6 },
];

const dummySalaryData = [
  { department: 'Engineering', avgSalary: 75000, minSalary: 40000, maxSalary: 150000 },
  { department: 'Sales', avgSalary: 55000, minSalary: 30000, maxSalary: 100000 },
  { department: 'HR', avgSalary: 50000, minSalary: 35000, maxSalary: 80000 },
  { department: 'Marketing', avgSalary: 60000, minSalary: 40000, maxSalary: 120000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState('attendance');
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(dummyStats);
  const [attendanceData, setAttendanceData] = useState(dummyAttendanceData);
  const [leaveData, setLeaveData] = useState(dummyLeaveData);
  const [salaryData, setSalaryData] = useState(dummySalaryData);
  const [useDummyData, setUseDummyData] = useState(true);

  const reportCards = [
    {
      title: 'Attendance Report',
      description: 'Daily, weekly, and monthly attendance statistics',
      icon: Clock,
      color: 'bg-blue-500',
      type: 'attendance',
    },
    {
      title: 'Leave Report',
      description: 'Employee leave requests and approvals',
      icon: Calendar,
      color: 'bg-green-500',
      type: 'leave',
    },
    {
      title: 'Payroll Report',
      description: 'Salary and compensation reports',
      icon: DollarSign,
      color: 'bg-yellow-500',
      type: 'payroll',
    },
    {
      title: 'Employee Report',
      description: 'Employee demographics and statistics',
      icon: Users,
      color: 'bg-purple-500',
      type: 'employees',
    },
  ];

  useEffect(() => {
    fetchReportsData();
  }, [period]);

  const fetchReportsData = async () => {
    setIsLoading(true);
    try {
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;
      let monthParam: string;

      if (period === 'week') {
        startDate = subDays(now, 7);
        monthParam = format(now, 'yyyy-MM');
      } else if (period === 'month') {
        startDate = subMonths(now, 1);
        monthParam = format(now, 'yyyy-MM');
      } else if (period === 'quarter') {
        startDate = subMonths(now, 3);
        monthParam = format(now, 'yyyy-MM');
      } else if (period === 'year') {
        startDate = subYears(now, 1);
        monthParam = format(now, 'yyyy-MM');
      } else {
        startDate = subMonths(now, 1);
        monthParam = format(now, 'yyyy-MM');
      }

      // Fetch dashboard summary and employees for stats
      let dashboard = null;
      let employeesResponse = null;
      try {
        dashboard = await dashboardService.getDashboardData();
        employeesResponse = await adminService.getEmployees(1, 100);
      } catch (error) {
        console.warn('Failed to fetch dashboard/employees data:', error);
      }

      // Fetch attendance data and aggregate by date
      let attendanceRecords: any[] = [];
      try {
        const attendanceResponse = await attendanceService.getAttendanceRecords(monthParam, 1, 1000);
        attendanceRecords = attendanceResponse.records || [];
      } catch (error) {
        console.warn('Failed to fetch attendance data:', error);
      }

      // Aggregate attendance by date
      const attendanceByDate = new Map<string, { present: number; absent: number; onLeave: number }>();
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

      // Initialize all dates in range
      dateRange.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        attendanceByDate.set(dateStr, { present: 0, absent: 0, onLeave: 0 });
      });

      // Process attendance records
      attendanceRecords.forEach((record: any) => {
        if (!record.date) return;
        let recordDate: Date;
        try {
          recordDate = parseISO(record.date);
        } catch {
          return;
        }

        if (isWithinInterval(recordDate, { start: startOfDay(startDate), end: endOfDay(endDate) })) {
          const dateStr = format(recordDate, 'yyyy-MM-dd');
          const current = attendanceByDate.get(dateStr) || { present: 0, absent: 0, onLeave: 0 };
          
          const status = (record.status || '').toLowerCase();
          if (status === 'present' || status === 'presence') {
            current.present++;
          } else if (status === 'absent') {
            current.absent++;
          } else if (status === 'on_leave' || status === 'on leave') {
            current.onLeave++;
          }
          
          attendanceByDate.set(dateStr, current);
        }
      });

      // Convert to array for chart
      const attendanceChartData = Array.from(attendanceByDate.entries())
        .map(([date, data]) => ({
          date,
          present: data.present,
          absent: data.absent,
          onLeave: data.onLeave,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (attendanceChartData.length > 0) {
        setAttendanceData(attendanceChartData);
        setUseDummyData(false);
      }

      // Calculate average attendance
      const totalDays = attendanceChartData.length;
      const totalPresent = attendanceChartData.reduce((sum, d) => sum + d.present, 0);
      const avgAttendance = totalDays > 0 ? Math.round((totalPresent / (totalDays * (employeesResponse?.total || 1))) * 100) : 0;

      // Fetch leave data
      let leaveRequests: any[] = [];
      try {
        const leaveResponse = await leaveService.getLeaveRequests(undefined, 1, 1000);
        leaveRequests = leaveResponse.requests || [];
      } catch (error) {
        console.warn('Failed to fetch leave data:', error);
      }

      // Filter leaves within date range and aggregate by type
      const leaveByType = new Map<string, number>();
      leaveRequests.forEach((leave: any) => {
        try {
          const leaveStart = parseISO(leave.startDate);
          if (isWithinInterval(leaveStart, { start: startOfDay(startDate), end: endOfDay(endDate) })) {
            const type = (leave.leaveType || leave.type || 'unpaid').toLowerCase();
            const current = leaveByType.get(type) || 0;
            leaveByType.set(type, current + (leave.duration || leave.days || 1));
          }
        } catch {
          // Skip invalid dates
        }
      });

      const totalLeaves = Array.from(leaveByType.values()).reduce((sum, count) => sum + count, 0);
      const leaveChartData = Array.from(leaveByType.entries()).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        percentage: totalLeaves > 0 ? Math.round((count / totalLeaves) * 100) : 0,
      }));

      if (leaveChartData.length > 0) {
        setLeaveData(leaveChartData);
      }

      // Fetch payroll data by department
      let salaryByDept = new Map<string, { salaries: number[]; count: number }>();
      if (employeesResponse && employeesResponse.items.length > 0) {
        const employeeList = employeesResponse.items.filter(emp => emp.role === 'EMPLOYEE' || emp.role === 'employee');
        
        // Fetch payroll for each employee (limit to first 20 to avoid too many requests)
        const payrollPromises = employeeList.slice(0, 20).map(async (employee) => {
          try {
            const payroll = await payrollService.getPayroll(employee.id);
            const dept = employee.department || 'Other';
            const current = salaryByDept.get(dept) || { salaries: [], count: 0 };
            current.salaries.push(payroll.summary.netSalary);
            current.count++;
            salaryByDept.set(dept, current);
          } catch (error) {
            // Skip employees without payroll data
          }
        });

        await Promise.all(payrollPromises);
      }

      // Calculate department salary stats
      const salaryChartData = Array.from(salaryByDept.entries()).map(([department, data]) => {
        const salaries = data.salaries.sort((a, b) => a - b);
        return {
          department,
          avgSalary: Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length),
          minSalary: salaries[0] || 0,
          maxSalary: salaries[salaries.length - 1] || 0,
        };
      });

      if (salaryChartData.length > 0) {
        setSalaryData(salaryChartData);
      }

      // Calculate monthly payroll total
      const monthlyPayrollTotal = salaryChartData.reduce((sum, dept) => sum + (dept.avgSalary * (salaryByDept.get(dept.department)?.count || 0)), 0);

      // Update stats
      setStats({
        totalEmployees: employeesResponse?.total || dashboard?.summary?.totalEmployees || dummyStats.totalEmployees,
        avgAttendance: avgAttendance || dummyStats.avgAttendance,
        monthlyPayroll: monthlyPayrollTotal || dummyStats.monthlyPayroll,
        pendingLeaves: dashboard?.summary?.pendingApprovals || leaveRequests.filter((l: any) => (l.status || '').toLowerCase() === 'pending').length || dummyStats.pendingLeaves,
      });

      // If we got any real data, mark as not using dummy data
      if (attendanceChartData.length > 0 || leaveChartData.length > 0 || salaryChartData.length > 0) {
        setUseDummyData(false);
      } else {
        setUseDummyData(true);
      }

    } catch (error: any) {
      console.error('Error fetching reports data:', error);
      setUseDummyData(true);
      toast({
        title: 'Warning',
        description: error.response?.data?.error?.message || 'Failed to fetch some data. Using available data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    switch (reportType) {
      case 'attendance':
        if (!attendanceData || attendanceData.length === 0) {
          return (
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No attendance data available</p>
            </div>
          );
        }
        return (
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={256} minWidth={0}>
              <LineChart data={attendanceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    try {
                      return format(new Date(value), 'MMM dd');
                    } catch {
                      return value;
                    }
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#22c55e" name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
                <Line type="monotone" dataKey="onLeave" stroke="#f59e0b" name="On Leave" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'leave':
        if (!leaveData || leaveData.length === 0) {
          return (
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No leave data available</p>
            </div>
          );
        }
        return (
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={256} minWidth={0}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'payroll':
        if (!salaryData || salaryData.length === 0) {
          return (
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No payroll data available</p>
            </div>
          );
        }
        return (
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={256} minWidth={0}>
              <BarChart data={salaryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={60} />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="avgSalary" fill="#8884d8" name="Avg Salary" />
                <Bar dataKey="minSalary" fill="#82ca9d" name="Min Salary" />
                <Bar dataKey="maxSalary" fill="#ffc658" name="Max Salary" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'employees':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground">Total Employees</div>
                <div className="text-2xl font-bold mt-1">{stats.totalEmployees}</div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground">Active Employees</div>
                <div className="text-2xl font-bold mt-1">{stats.totalEmployees}</div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground">Departments</div>
                <div className="text-2xl font-bold mt-1">
                  {salaryData.length > 0 ? salaryData.length : '-'}
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground">Avg. Salary</div>
                <div className="text-2xl font-bold mt-1">
                  {salaryData.length > 0 
                    ? formatCurrency(
                        salaryData.reduce((sum, d) => sum + d.avgSalary, 0) / salaryData.length
                      )
                    : '-'
                  }
                </div>
              </div>
            </div>
            {salaryData.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Employees by Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {salaryData.map((dept) => (
                    <div key={dept.department} className="p-3 rounded-lg border">
                      <div className="font-medium">{dept.department}</div>
                      <div className="text-sm text-muted-foreground">
                        Avg: {formatCurrency(dept.avgSalary)} | 
                        Min: {formatCurrency(dept.minSalary)} | 
                        Max: {formatCurrency(dept.maxSalary)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!isLoading && useDummyData && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-xs text-yellow-800">⚠️ Some data may be incomplete</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">
                {reportCards.find(c => c.type === reportType)?.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Select a report type to view data
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Reports Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Generate and download various reports
              </p>
            </div>
            <Button onClick={fetchReportsData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {reportCards.map((card) => (
              <Card
                key={card.type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  reportType === card.type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setReportType(card.type)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                      <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportCards.map((card) => (
                          <SelectItem key={card.type} value={card.type}>
                            {card.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">This Quarter</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {renderReportContent()}
                  
                  {!isLoading && useDummyData && (
                    <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Displaying sample data. Some data may not be available from the API.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Total Employees</div>
                      <div className="text-xs text-muted-foreground">Active staff</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">{stats.totalEmployees}</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Avg. Attendance</div>
                      <div className="text-xs text-muted-foreground">This month</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">{stats.avgAttendance}%</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Monthly Payroll</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">{formatCurrency(stats.monthlyPayroll)}</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Pending Leaves</div>
                      <div className="text-xs text-muted-foreground">Awaiting approval</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">{stats.pendingLeaves}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}

