import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Download, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { attendanceService } from '@/services/attendance.service';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  employeeId?: string;
  employeeName?: string;
  employee?: {
    id: string;
    name: string;
    employeeCode?: string;
  };
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  status: string;
}

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const [year, month] = selectedDate.split('-');
      const response = await attendanceService.getAttendanceRecords(`${year}-${month}`, 1, 100);
      // For admin, get all employees' attendance
      const records = response.records || [];
      // Ensure all records have valid date strings
      const validRecords = records.map((record: any) => ({
        ...record,
        date: record.date || new Date().toISOString().split('T')[0], // Fallback to today if date is missing
      }));
      setAttendance(validRecords);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to fetch attendance records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | null | undefined, formatStr: string): string => {
    if (!dateString) return '-';
    try {
      // Handle different date formats
      let dateObj: Date;
      if (dateString.includes('T')) {
        // ISO format
        dateObj = new Date(dateString);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format
        dateObj = new Date(dateString + 'T00:00:00');
      } else {
        // Try parsing as is
        dateObj = new Date(dateString);
      }
      
      if (isNaN(dateObj.getTime())) {
        return dateString; // Return original if invalid
      }
      return format(dateObj, formatStr);
    } catch (e) {
      return dateString; // Return original if error
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const employeeName = record.employeeName || record.employee?.name || '';
    const employeeId = record.employeeId || record.employee?.employeeCode || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Safely format date - handle invalid dates
    let recordDate = '';
    if (record.date) {
      try {
        // Handle different date formats
        let dateObj: Date;
        if (record.date.includes('T')) {
          dateObj = new Date(record.date);
        } else if (record.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateObj = new Date(record.date + 'T00:00:00');
        } else {
          dateObj = new Date(record.date);
        }
        
        if (!isNaN(dateObj.getTime())) {
          recordDate = format(dateObj, 'yyyy-MM-dd');
        }
      } catch (e) {
        // Invalid date, use original string
        recordDate = record.date;
      }
    }
    const matchesDate = !recordDate || recordDate === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present':
        return 'default';
      case 'late':
        return 'secondary';
      case 'absent':
        return 'destructive';
      case 'half-day':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleExport = () => {
    const csv = [
      ['Employee', 'Employee ID', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'],
      ...filteredAttendance.map(record => {
        const employeeName = record.employeeName || record.employee?.name || 'Unknown';
        const employeeId = record.employeeId || record.employee?.employeeCode || 'N/A';
        return [
          employeeName,
          employeeId,
          record.date,
          record.checkIn || '-',
          record.checkOut || '-',
          record.workHours ? record.workHours.toFixed(1) : '0',
          record.status,
        ];
      }),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Attendance Management</h1>
              <p className="text-muted-foreground mt-1">
                View and manage employee attendance records
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Present Today</div>
                <div className="text-2xl font-semibold mt-1">
                  {attendance.filter(a => a.status === 'present' && a.date === selectedDate).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Absent Today</div>
                <div className="text-2xl font-semibold mt-1">
                  {attendance.filter(a => a.status === 'absent' && a.date === selectedDate).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Late Today</div>
                <div className="text-2xl font-semibold mt-1">
                  {attendance.filter(a => a.status === 'late' && a.date === selectedDate).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Hours</div>
                <div className="text-2xl font-semibold mt-1">
                  {attendance
                    .filter(a => {
                      const recordDate = safeFormatDate(a.date, 'yyyy-MM-dd');
                      return recordDate === selectedDate;
                    })
                    .reduce((sum, a) => sum + (a.workHours || 0), 0)
                    .toFixed(1)}h
                </div>
              </CardContent>
            </Card>
          </div>

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
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="half-day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.map((record) => {
                      const employeeName = record.employeeName || record.employee?.name || 'Unknown';
                      const employeeId = record.employeeId || record.employee?.employeeCode || 'N/A';
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{employeeName}</TableCell>
                          <TableCell className="font-mono">{employeeId}</TableCell>
                        <TableCell>{safeFormatDate(record.date, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{safeFormatDate(record.checkIn, 'HH:mm')}</TableCell>
                        <TableCell>{safeFormatDate(record.checkOut, 'HH:mm')}</TableCell>
                          <TableCell>{record.workHours ? `${record.workHours.toFixed(1)}h` : '-'}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(record.status)}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </PageContainer>
      </main>
    </div>
  );
}
