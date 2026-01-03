import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  User, UserPlus, Search, Eye, Mail, Phone, MapPin, Calendar, Briefcase, Building, 
  Clock, Wallet, Loader2, UserCircle, CreditCard, FileText
} from 'lucide-react';
import { Employee, ProfileData } from '@/types';
import { adminService } from '@/services/admin.service';
import { profileService } from '@/services/profile.service';
import { payrollService } from '@/services/payroll.service';
import { attendanceService } from '@/services/attendance.service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getImageUrlWithCacheBust } from '@/lib/utils';

export default function Employees() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState<{
    profile: ProfileData | null;
    attendance: { daysPresent: number; totalHours: number; thisMonth: number };
    salary: any;
  } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getEmployees(1, 100);
      // Filter out admin users
      const employeeList = response.items.filter((emp) => emp.role === 'EMPLOYEE' || emp.role === 'employee');
      setEmployees(employeeList);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to fetch employees',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      (emp.employeeId || '').toLowerCase().includes(query) ||
      (emp.department || '').toLowerCase().includes(query) ||
      (emp.position || '').toLowerCase().includes(query)
    );
  });

  const handleViewEmployee = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    setIsLoadingDetails(true);
    
    try {
      // Fetch employee profile
      const profile = await profileService.getProfile(employee.id);
      
      // Fetch attendance records for current month
      const currentDate = new Date();
      const month = format(currentDate, 'yyyy-MM');
      let daysPresent = 0;
      let totalHours = 0;
      let thisMonthPresent = 0;
      
      try {
        const attendanceData = await attendanceService.getAttendanceRecords(month, 1, 100, employee.id);
        if (attendanceData.records) {
          const thisMonthRecords = attendanceData.records.filter((r: any) => {
            const recordDate = r.date ? new Date(r.date) : null;
            if (!recordDate) return false;
            return recordDate.getMonth() === currentDate.getMonth() && 
                   recordDate.getFullYear() === currentDate.getFullYear();
          });
          
          thisMonthPresent = thisMonthRecords.filter((r: any) => 
            r.status === 'PRESENT' || r.status === 'present'
          ).length;
          
          totalHours = thisMonthRecords.reduce((sum: number, r: any) => 
            sum + (r.workHours || 0), 0
          );
          
          // Get all-time present days
          daysPresent = thisMonthRecords.filter((r: any) => 
            r.status === 'PRESENT' || r.status === 'present' || r.checkIn
          ).length;
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
      
      // Fetch salary information
      let salary = null;
      try {
        salary = await payrollService.getPayroll(employee.id);
      } catch (error) {
        console.error('Error fetching salary:', error);
      }
      
      setEmployeeDetails({
        profile,
        attendance: {
          daysPresent: thisMonthPresent,
          totalHours,
          thisMonth: thisMonthPresent,
        },
        salary,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to fetch employee details',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Employee Directory</h1>
              <p className="text-muted-foreground mt-1">
                Manage and view all employees ({filteredEmployees.length} total)
              </p>
            </div>
            <Button asChild>
              <Link to="/admin/employees/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Employee
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow 
                          key={employee.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewEmployee(employee)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={getImageUrlWithCacheBust(employee.profilePic)} alt={`${employee.firstName} ${employee.lastName}`} key={employee.profilePic} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {employee.firstName?.[0]?.toUpperCase() || ''}{employee.lastName?.[0]?.toUpperCase() || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {employee.firstName} {employee.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">{employee.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{employee.employeeId || employee.employeeCode || 'N/A'}</TableCell>
                          <TableCell>{employee.department || 'N/A'}</TableCell>
                          <TableCell>{employee.position || employee.jobPosition || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{employee.email}</span>
                              </div>
                              {employee.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{employee.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={employee.isVerified ? 'default' : 'secondary'}>
                              {employee.isVerified ? 'Active' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewEmployee(employee)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </PageContainer>
      </main>

      {/* Employee Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="px-6 pb-6 flex-shrink-0">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : employeeDetails && selectedEmployee ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full px-6 pb-6">
                <div className="pr-4">
                <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="personal">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="professional">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Professional
                  </TabsTrigger>
                  <TabsTrigger value="attendance">
                    <Clock className="h-4 w-4 mr-2" />
                    Attendance
                  </TabsTrigger>
                  <TabsTrigger value="salary">
                    <Wallet className="h-4 w-4 mr-2" />
                    Salary
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="mt-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-center mb-4">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={getImageUrlWithCacheBust(employeeDetails.profile?.personal.profilePic || selectedEmployee.profilePic)} key={employeeDetails.profile?.personal.profilePic || selectedEmployee.profilePic} />
                            <AvatarFallback className="text-2xl">
                              {selectedEmployee.firstName?.[0]?.toUpperCase() || ''}{selectedEmployee.lastName?.[0]?.toUpperCase() || ''}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">First Name</label>
                            <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{employeeDetails.profile?.personal.firstName || selectedEmployee.firstName}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                            <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{employeeDetails.profile?.personal.lastName || selectedEmployee.lastName}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{employeeDetails.profile?.personal.email || selectedEmployee.email}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                            <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{employeeDetails.profile?.personal.phone || selectedEmployee.phone || 'Not provided'}</span>
                            </div>
                          </div>
                          {employeeDetails.profile?.personal.address && (
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium text-muted-foreground">Address</label>
                              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{employeeDetails.profile.personal.address}</span>
                              </div>
                            </div>
                          )}
                          {employeeDetails.profile?.personal.dateOfBirth && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{format(new Date(employeeDetails.profile.personal.dateOfBirth), 'MMM dd, yyyy')}</span>
                              </div>
                            </div>
                          )}
                          {employeeDetails.profile?.personal.gender && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Gender</label>
                              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{employeeDetails.profile.personal.gender}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Professional Information Tab */}
                <TabsContent value="professional" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                          <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono">{employeeDetails.profile?.professional.employeeCode || selectedEmployee.employeeId || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                          <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{employeeDetails.profile?.professional.department || selectedEmployee.department || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Position</label>
                          <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{employeeDetails.profile?.professional.jobPosition || selectedEmployee.position || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Company</label>
                          <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{employeeDetails.profile?.professional.company || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{employeeDetails.profile?.professional.location || selectedEmployee.location || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Date of Joining</label>
                          <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {employeeDetails.profile?.professional.dateOfJoining 
                                ? format(new Date(employeeDetails.profile.professional.dateOfJoining), 'MMM dd, yyyy')
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                        {employeeDetails.profile?.professional.manager && (
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Manager</label>
                            <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{employeeDetails.profile.professional.manager.name}</span>
                              <span className="text-muted-foreground">({employeeDetails.profile.professional.manager.email})</span>
                            </div>
                          </div>
                        )}
                        {employeeDetails.profile?.professional.workSchedule && (
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Work Schedule</label>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-2 rounded-md border bg-muted/50 text-center">
                                <div className="text-xs text-muted-foreground">Working Days</div>
                                <div className="font-semibold">{employeeDetails.profile.professional.workSchedule.workingDays} days/week</div>
                              </div>
                              <div className="p-2 rounded-md border bg-muted/50 text-center">
                                <div className="text-xs text-muted-foreground">Daily Hours</div>
                                <div className="font-semibold">{employeeDetails.profile.professional.workSchedule.dailyHours} hours</div>
                              </div>
                              <div className="p-2 rounded-md border bg-muted/50 text-center">
                                <div className="text-xs text-muted-foreground">Break Time</div>
                                <div className="font-semibold">{employeeDetails.profile.professional.workSchedule.breakTime}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank Details */}
                  {employeeDetails.profile?.bank && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Bank Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {employeeDetails.profile.bank.accountNumber && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">{employeeDetails.profile.bank.accountNumber}</span>
                              </div>
                            </div>
                          )}
                          {employeeDetails.profile.bank.bankName && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{employeeDetails.profile.bank.bankName}</span>
                              </div>
                            </div>
                          )}
                          {employeeDetails.profile.bank.ifscCode && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">{employeeDetails.profile.bank.ifscCode}</span>
                              </div>
                            </div>
                          )}
                          {employeeDetails.profile.bank.panNumber && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
                              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">{employeeDetails.profile.bank.panNumber}</span>
                              </div>
                            </div>
                          )}
                          {employeeDetails.profile.bank.uanNumber && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">UAN Number</label>
                              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">{employeeDetails.profile.bank.uanNumber}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Attendance Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-success/10">
                              <Clock className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Days Present</div>
                              <div className="text-2xl font-semibold">{employeeDetails.attendance.daysPresent}</div>
                              <div className="text-xs text-muted-foreground">This month</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Total Hours</div>
                              <div className="text-2xl font-semibold">{employeeDetails.attendance.totalHours.toFixed(1)}h</div>
                              <div className="text-xs text-muted-foreground">This month</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-accent/10">
                              <Calendar className="h-5 w-5 text-accent-foreground" />
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Avg. Hours/Day</div>
                              <div className="text-2xl font-semibold">
                                {employeeDetails.attendance.daysPresent > 0 
                                  ? (employeeDetails.attendance.totalHours / employeeDetails.attendance.daysPresent).toFixed(1)
                                  : '0.0'}h
                              </div>
                              <div className="text-xs text-muted-foreground">This month</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Salary Tab */}
                <TabsContent value="salary" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Salary Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {employeeDetails.salary ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border bg-muted/50">
                              <div className="text-sm text-muted-foreground">Gross Salary</div>
                              <div className="text-2xl font-semibold mt-1">
                                ₹{employeeDetails.salary.summary?.grossSalary?.toLocaleString('en-IN') || '0'}
                              </div>
                            </div>
                            <div className="p-4 rounded-lg border bg-muted/50">
                              <div className="text-sm text-muted-foreground">Total Deductions</div>
                              <div className="text-2xl font-semibold mt-1 text-destructive">
                                ₹{employeeDetails.salary.summary?.totalDeductions?.toLocaleString('en-IN') || '0'}
                              </div>
                            </div>
                            <div className="p-4 rounded-lg border bg-primary/10">
                              <div className="text-sm text-muted-foreground">Net Salary</div>
                              <div className="text-2xl font-semibold mt-1 text-primary">
                                ₹{employeeDetails.salary.summary?.netSalary?.toLocaleString('en-IN') || '0'}
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h4 className="font-medium mb-3">Salary Components</h4>
                            <div className="space-y-2">
                              {employeeDetails.salary.salaryComponents?.map((component: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    {component.type === 'EARNING' ? (
                                      <FileText className="h-4 w-4 text-success" />
                                    ) : (
                                      <CreditCard className="h-4 w-4 text-destructive" />
                                    )}
                                    <span className="font-medium">{component.name}</span>
                                  </div>
                                  <span className={`font-semibold ${component.type === 'EARNING' ? 'text-success' : 'text-destructive'}`}>
                                    {component.type === 'EARNING' ? '+' : '-'}₹{component.amount?.toLocaleString('en-IN') || '0'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Salary information not available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="px-6 pb-6 flex-shrink-0">
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No employee details available</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

