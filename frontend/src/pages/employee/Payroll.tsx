import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, DollarSign, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
}

const PAYROLL_KEY = 'dayflow_payroll';

export default function EmployeePayroll() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    const stored = localStorage.getItem(PAYROLL_KEY);
    if (stored) {
      const allPayroll: PayrollRecord[] = JSON.parse(stored);
      const userPayroll = allPayroll.filter(p => p.employeeId === user?.employeeId);
      setPayroll(userPayroll);
    } else {
      // Create mock data for the current user
      const mockPayroll: PayrollRecord[] = [
        {
          id: '1',
          employeeId: user?.employeeId || '',
          month: '2024-01',
          baseSalary: 85000,
          allowances: 15000,
          deductions: 12000,
          netSalary: 88000,
          status: 'paid',
        },
        {
          id: '2',
          employeeId: user?.employeeId || '',
          month: '2023-12',
          baseSalary: 85000,
          allowances: 15000,
          deductions: 12000,
          netSalary: 88000,
          status: 'paid',
        },
      ];
      setPayroll(mockPayroll);
    }
  }, [user]);

  const filteredPayroll = payroll.filter(p => p.month === selectedMonth);
  const currentRecord = filteredPayroll[0];

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

  const handleDownloadPayslip = () => {
    if (!currentRecord) {
      toast({
        title: 'No payslip available',
        description: 'No payslip found for the selected month',
        variant: 'destructive',
      });
      return;
    }

    // Create a simple payslip content
    const payslipContent = `
PAYSLIP
Employee ID: ${user?.employeeId}
Employee Name: ${user?.firstName} ${user?.lastName}
Period: ${format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}

Base Salary: ${formatCurrency(currentRecord.baseSalary)}
Allowances: ${formatCurrency(currentRecord.allowances)}
Deductions: ${formatCurrency(currentRecord.deductions)}
────────────────────────
Net Salary: ${formatCurrency(currentRecord.netSalary)}

Status: ${currentRecord.status.toUpperCase()}
    `.trim();

    const blob = new Blob([payslipContent], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payslip_${selectedMonth}_${user?.employeeId}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Payslip downloaded',
      description: 'Your payslip has been downloaded',
    });
  };

  const allMonths = Array.from(new Set(payroll.map(p => p.month))).sort().reverse();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <PageContainer>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Payroll</h1>
            <p className="text-muted-foreground mt-1">
              View your salary details and download pay slips
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allMonths.length > 0 ? (
                  allMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(month + '-01'), 'MMMM yyyy')}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={selectedMonth}>
                    {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {currentRecord && (
              <Button onClick={handleDownloadPayslip}>
                <Download className="mr-2 h-4 w-4" />
                Download Payslip
              </Button>
            )}
          </div>
        </div>

        {currentRecord ? (
          <>
            {/* Current Month Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Base Salary</div>
                      <div className="text-2xl font-semibold mt-1">{formatCurrency(currentRecord.baseSalary)}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Allowances</div>
                      <div className="text-2xl font-semibold mt-1 text-green-600">{formatCurrency(currentRecord.allowances)}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Deductions</div>
                      <div className="text-2xl font-semibold mt-1 text-red-600">{formatCurrency(currentRecord.deductions)}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Net Salary</div>
                      <div className="text-2xl font-semibold mt-1">{formatCurrency(currentRecord.netSalary)}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Salary Breakdown - {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</CardTitle>
                <CardDescription>Detailed breakdown of your salary components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-lg border">
                    <div>
                      <div className="font-medium">Base Salary</div>
                      <div className="text-sm text-muted-foreground">Monthly base salary</div>
                    </div>
                    <div className="text-lg font-semibold">{formatCurrency(currentRecord.baseSalary)}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-400">Allowances</div>
                      <div className="text-sm text-muted-foreground">Transport, medical, etc.</div>
                    </div>
                    <div className="text-lg font-semibold text-green-700 dark:text-green-400">+{formatCurrency(currentRecord.allowances)}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border bg-red-50 dark:bg-red-950/20">
                    <div>
                      <div className="font-medium text-red-700 dark:text-red-400">Deductions</div>
                      <div className="text-sm text-muted-foreground">Tax, insurance, etc.</div>
                    </div>
                    <div className="text-lg font-semibold text-red-700 dark:text-red-400">-{formatCurrency(currentRecord.deductions)}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <div>
                      <div className="font-semibold text-lg">Net Salary</div>
                      <div className="text-sm text-muted-foreground">Amount credited to your account</div>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(currentRecord.netSalary)}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border">
                    <div>
                      <div className="font-medium">Status</div>
                      <div className="text-sm text-muted-foreground">Payment status</div>
                    </div>
                    <div>{getStatusBadge(currentRecord.status)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No payroll data found</h3>
              <p className="text-sm text-muted-foreground">
                No payroll information available for the selected month.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Payroll History */}
        {payroll.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>View your past payroll records</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {format(new Date(record.month + '-01'), 'MMMM yyyy')}
                      </TableCell>
                      <TableCell>{formatCurrency(record.baseSalary)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(record.allowances)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(record.deductions)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(record.netSalary)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </PageContainer>
    </div>
  );
}

