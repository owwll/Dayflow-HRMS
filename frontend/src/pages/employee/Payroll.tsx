import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, DollarSign, Calendar, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { payrollService } from '@/services/payroll.service';
import { PayrollData, SalaryComponent } from '@/types';

export default function EmployeePayroll() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPayrollData();
    }
  }, [user, selectedMonth]);

  const fetchPayrollData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await payrollService.getPayroll(user.id);
      setPayrollData(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to fetch payroll data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDownloadPayslip = async () => {
    if (!user?.id) return;
    
    setIsDownloading(true);
    try {
      await payrollService.downloadPayslip(user.id, selectedMonth);
      toast({
        title: 'Payslip downloaded',
        description: 'Your payslip has been downloaded',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to download payslip',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate list of months (last 12 months)
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, 'yyyy-MM');
  });

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
            <Button onClick={handleDownloadPayslip} disabled={isDownloading || !payrollData}>
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Payslip
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading payroll data...</p>
            </CardContent>
          </Card>
        ) : payrollData ? (
          <>
            {/* Current Month Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Gross Salary</div>
                      <div className="text-2xl font-semibold mt-1">{formatCurrency(payrollData.summary.grossSalary)}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Deductions</div>
                      <div className="text-2xl font-semibold mt-1 text-red-600">{formatCurrency(payrollData.summary.totalDeductions)}</div>
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
                      <div className="text-2xl font-semibold mt-1">{formatCurrency(payrollData.summary.netSalary)}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Period</div>
                      <div className="text-lg font-semibold mt-1">{format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</div>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
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
                  {/* Earnings */}
                  {payrollData.salaryComponents
                    .filter((comp: SalaryComponent) => comp.type === 'EARNING')
                    .map((comp: SalaryComponent) => (
                      <div key={comp.name} className="flex justify-between items-center p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                        <div>
                          <div className="font-medium text-green-700 dark:text-green-400">{comp.name}</div>
                          {comp.formula && (
                            <div className="text-sm text-muted-foreground">{comp.formula}</div>
                          )}
                        </div>
                        <div className="text-lg font-semibold text-green-700 dark:text-green-400">+{formatCurrency(comp.amount)}</div>
                      </div>
                    ))}
                  
                  {/* Deductions */}
                  {payrollData.salaryComponents
                    .filter((comp: SalaryComponent) => comp.type === 'DEDUCTION')
                    .map((comp: SalaryComponent) => (
                      <div key={comp.name} className="flex justify-between items-center p-4 rounded-lg border bg-red-50 dark:bg-red-950/20">
                        <div>
                          <div className="font-medium text-red-700 dark:text-red-400">{comp.name}</div>
                          {comp.formula && (
                            <div className="text-sm text-muted-foreground">{comp.formula}</div>
                          )}
                        </div>
                        <div className="text-lg font-semibold text-red-700 dark:text-red-400">-{formatCurrency(comp.amount)}</div>
                      </div>
                    ))}
                  
                  <div className="flex justify-between items-center p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <div>
                      <div className="font-semibold text-lg">Net Salary</div>
                      <div className="text-sm text-muted-foreground">Amount credited to your account</div>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(payrollData.summary.netSalary)}</div>
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

      </PageContainer>
    </div>
  );
}

