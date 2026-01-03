import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Search, Download, DollarSign, Calendar, Send, Filter, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: string;
  status: 'pending' | 'processed' | 'paid';
}

// Extended mock data for better visualization
const mockPayroll: PayrollRecord[] = [
  {
    id: '1',
    employeeId: 'EMP002',
    employeeName: 'Rahul Kumar',
    department: 'Engineering',
    position: 'Software Developer',
    baseSalary: 85000,
    allowances: 15000,
    deductions: 12000,
    netSalary: 88000,
    month: '2024-01',
    status: 'processed',
  },
  {
    id: '2',
    employeeId: 'EMP003',
    employeeName: 'Ananya Patel',
    department: 'Marketing',
    position: 'Marketing Specialist',
    baseSalary: 75000,
    allowances: 12000,
    deductions: 10000,
    netSalary: 77000,
    month: '2024-01',
    status: 'paid',
  },
  {
    id: '3',
    employeeId: 'EMP004',
    employeeName: 'Vikram Singh',
    department: 'Sales',
    position: 'Sales Representative',
    baseSalary: 60000,
    allowances: 10000,
    deductions: 8000,
    netSalary: 62000,
    month: '2024-01',
    status: 'pending',
  },
  {
    id: '4',
    employeeId: 'EMP005',
    employeeName: 'Sneha Reddy',
    department: 'Engineering',
    position: 'Senior Developer',
    baseSalary: 120000,
    allowances: 20000,
    deductions: 15000,
    netSalary: 125000,
    month: '2024-01',
    status: 'paid',
  },
  {
    id: '5',
    employeeId: 'EMP006',
    employeeName: 'Arjun Mehta',
    department: 'HR',
    position: 'HR Manager',
    baseSalary: 95000,
    allowances: 15000,
    deductions: 12000,
    netSalary: 98000,
    month: '2024-01',
    status: 'processed',
  },
  {
    id: '6',
    employeeId: 'EMP007',
    employeeName: 'Kavya Nair',
    department: 'Marketing',
    position: 'Marketing Manager',
    baseSalary: 100000,
    allowances: 18000,
    deductions: 13000,
    netSalary: 105000,
    month: '2024-01',
    status: 'paid',
  },
];

// Mock data for previous months (for trends)
const monthlyTrendData = [
  { month: 'Oct 2023', total: 450000, paid: 420000, pending: 30000 },
  { month: 'Nov 2023', total: 470000, paid: 450000, pending: 20000 },
  { month: 'Dec 2023', total: 490000, paid: 480000, pending: 10000 },
  { month: 'Jan 2024', total: 510000, paid: 480000, pending: 30000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Payroll() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payroll, setPayroll] = useState<PayrollRecord[]>(mockPayroll);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const filteredPayroll = useMemo(() => {
    return payroll.filter((record) => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMonth = record.month === selectedMonth;
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
      return matchesSearch && matchesMonth && matchesStatus && matchesDepartment;
    });
  }, [payroll, searchQuery, selectedMonth, statusFilter, departmentFilter]);

  const totalPayroll = filteredPayroll.reduce((sum, record) => sum + record.netSalary, 0);
  const totalBaseSalary = filteredPayroll.reduce((sum, record) => sum + record.baseSalary, 0);
  const totalAllowances = filteredPayroll.reduce((sum, record) => sum + record.allowances, 0);
  const totalDeductions = filteredPayroll.reduce((sum, record) => sum + record.deductions, 0);
  const paidCount = filteredPayroll.filter(r => r.status === 'paid').length;
  const pendingCount = filteredPayroll.filter(r => r.status === 'pending').length;
  const processedCount = filteredPayroll.filter(r => r.status === 'processed').length;

  // Department-wise payroll data for charts
  const departmentPayroll = useMemo(() => {
    const deptMap = new Map<string, { total: number; count: number }>();
    filteredPayroll.forEach(record => {
      const existing = deptMap.get(record.department) || { total: 0, count: 0 };
      deptMap.set(record.department, {
        total: existing.total + record.netSalary,
        count: existing.count + 1
      });
    });
    return Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      value: data.total,
      count: data.count
    }));
  }, [filteredPayroll]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    return [
      { name: 'Paid', value: paidCount, color: '#22c55e' },
      { name: 'Processed', value: processedCount, color: '#3b82f6' },
      { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    ];
  }, [paidCount, processedCount, pendingCount]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(payroll.map(r => r.department))).sort();
  }, [payroll]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'processed':
        return <Badge variant="secondary">Processed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Position', 'Base Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status'];
    const rows = filteredPayroll.map(record => [
      record.employeeId,
      record.employeeName,
      record.department,
      record.position,
      record.baseSalary.toString(),
      record.allowances.toString(),
      record.deductions.toString(),
      record.netSalary.toString(),
      record.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_${selectedMonth}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export successful',
      description: 'Payroll data has been exported to CSV',
    });
  };

  const handleProcessPayroll = () => {
    const pendingRecords = filteredPayroll.filter(r => r.status === 'pending');
    if (pendingRecords.length === 0) {
      toast({
        title: 'No pending records',
        description: 'There are no pending payroll records to process',
        variant: 'destructive',
      });
      return;
    }

    setPayroll(prevPayroll =>
      prevPayroll.map(record =>
        record.status === 'pending' && record.month === selectedMonth
          ? { ...record, status: 'processed' as const }
          : record
      )
    );

    toast({
      title: 'Payroll processed',
      description: `${pendingRecords.length} payroll record(s) have been processed`,
    });
  };

  const chartConfig = {
    total: {
      label: 'Total Payroll',
      color: '#8884d8',
    },
    paid: {
      label: 'Paid',
      color: '#22c55e',
    },
    pending: {
      label: 'Pending',
      color: '#f59e0b',
    },
    value: {
      label: 'Payroll',
      color: '#8884d8',
    },
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Payroll Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage employee salaries and payroll processing
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={handleProcessPayroll}>
                <Send className="mr-2 h-4 w-4" />
                Process Payroll
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Payroll</div>
                    <div className="text-2xl font-semibold mt-1">{formatCurrency(totalPayroll)}</div>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Employees</div>
                <div className="text-2xl font-semibold mt-1">{filteredPayroll.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Paid</div>
                <div className="text-2xl font-semibold mt-1 text-green-600">{paidCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-semibold mt-1 text-orange-600">{pendingCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Base Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBaseSalary)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Allowances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAllowances)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports and Charts */}
          <Tabs defaultValue="table" className="w-full mb-6">
            <TabsList>
              <TabsTrigger value="table">Payroll Table</TabsTrigger>
              <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-40"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Base Salary</TableHead>
                        <TableHead>Allowances</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayroll.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No payroll records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayroll.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{record.employeeName}</div>
                                <div className="text-sm text-muted-foreground font-mono">{record.employeeId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{record.department}</div>
                              <div className="text-xs text-muted-foreground">{record.position}</div>
                            </TableCell>
                            <TableCell>{formatCurrency(record.baseSalary)}</TableCell>
                            <TableCell className="text-green-600">{formatCurrency(record.allowances)}</TableCell>
                            <TableCell className="text-red-600">{formatCurrency(record.deductions)}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(record.netSalary)}</TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-4 space-y-6">
              {/* Monthly Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Payroll Trends</CardTitle>
                  <CardDescription>Payroll trends over the last 4 months</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyTrendData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Payroll" strokeWidth={2} />
                        <Line type="monotone" dataKey="paid" stroke="#22c55e" name="Paid" strokeWidth={2} />
                        <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" strokeWidth={2} />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available for trends
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department-wise Payroll Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payroll by Department</CardTitle>
                    <CardDescription>Total payroll distribution across departments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {departmentPayroll.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <BarChart data={departmentPayroll}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                          <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                          <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No department data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Status Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                    <CardDescription>Current payroll status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statusDistribution.some(item => item.value > 0) ? (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <RechartsPieChart>
                          <Pie
                            data={statusDistribution.filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusDistribution.filter(item => item.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </RechartsPieChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No status data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Summary Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Summary Report</CardTitle>
                  <CardDescription>Detailed breakdown for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="text-sm text-muted-foreground">Total Employees</div>
                      <div className="text-2xl font-bold mt-1">{filteredPayroll.length}</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="text-sm text-muted-foreground">Avg. Salary</div>
                      <div className="text-2xl font-bold mt-1">
                        {formatCurrency(filteredPayroll.length > 0 ? totalPayroll / filteredPayroll.length : 0)}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="text-sm text-muted-foreground">Paid Employees</div>
                      <div className="text-2xl font-bold mt-1 text-green-600">{paidCount}</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="text-sm text-muted-foreground">Pending Employees</div>
                      <div className="text-2xl font-bold mt-1 text-orange-600">{pendingCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </PageContainer>
      </main>
    </div>
  );
}
