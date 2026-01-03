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
import { Search, Calendar, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/types';
import { mockUsers } from '@/data/mockUsers';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

interface EmployeeAttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

const ATTENDANCE_KEY = 'dayflow_attendance';
const USERS_KEY = 'dayflow_users';

export default function Attendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    // Load attendance records from localStorage
    const stored = localStorage.getItem(ATTENDANCE_KEY);
    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;

    if (stored) {
      const allRecords: EmployeeAttendanceRecord[] = JSON.parse(stored);

      // Convert employee attendance records to admin format
      const adminRecords: AttendanceRecord[] = allRecords.map(record => {
        // Extract userId from id (format: userId_date)
        const userId = record.id.split('_')[0];
        const employee = users.find(u => u.id === userId);

        return {
          id: record.id,
          employeeId: employee?.employeeId || 'N/A',
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
          date: record.date,
          checkIn: record.checkIn || '-',
          checkOut: record.checkOut || '-',
          hours: record.hours || 0,
          status: record.status,
        };
      }).filter(record => record.employeeName !== 'Unknown'); // Filter out records without valid users

      setAttendance(adminRecords);
    }
  }, []);

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDate = record.date === selectedDate;
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
      ...filteredAttendance.map(record => [
        record.employeeName,
        record.employeeId,
        record.date,
        record.checkIn,
        record.checkOut,
        record.hours.toString(),
        record.status,
      ]),
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
                    .filter(a => a.date === selectedDate)
                    .reduce((sum, a) => sum + a.hours, 0)
                    .toFixed(1)}
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
                    filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell className="font-mono">{record.employeeId}</TableCell>
                        <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell>{record.hours > 0 ? `${record.hours}h` : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(record.status)}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </PageContainer>
      </main>
    </div>
  );
}
