import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

const ATTENDANCE_KEY = 'dayflow_attendance';

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ATTENDANCE_KEY);
    if (stored) {
      const allRecords: AttendanceRecord[] = JSON.parse(stored);
      const userRecords = allRecords.filter(r => r.id.startsWith(user?.id || ''));
      setAttendance(userRecords);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRec = userRecords.find(r => r.date === today);
      if (todayRec) {
        setTodayRecord(todayRec);
        setIsCheckedIn(!!todayRec.checkIn && !todayRec.checkOut);
      }
    }
  }, [user]);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = format(now, 'HH:mm');
    const dateString = format(now, 'yyyy-MM-dd');
    
    const stored = localStorage.getItem(ATTENDANCE_KEY);
    const allRecords: AttendanceRecord[] = stored ? JSON.parse(stored) : [];
    
    const recordId = `${user?.id}_${dateString}`;
    const existingIndex = allRecords.findIndex(r => r.id === recordId);
    
    const newRecord: AttendanceRecord = {
      id: recordId,
      date: dateString,
      checkIn: timeString,
      checkOut: null,
      hours: 0,
      status: 'present',
    };

    if (existingIndex >= 0) {
      allRecords[existingIndex] = newRecord;
    } else {
      allRecords.push(newRecord);
    }

    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(allRecords));
    setTodayRecord(newRecord);
    setIsCheckedIn(true);
    
    toast({
      title: 'Checked in successfully',
      description: `Checked in at ${timeString}`,
    });
  };

  const handleCheckOut = () => {
    if (!todayRecord || !todayRecord.checkIn) return;

    const now = new Date();
    const timeString = format(now, 'HH:mm');
    
    const checkInTime = new Date(`${todayRecord.date} ${todayRecord.checkIn}`);
    const hours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    
    const stored = localStorage.getItem(ATTENDANCE_KEY);
    const allRecords: AttendanceRecord[] = stored ? JSON.parse(stored) : [];
    
    const recordId = `${user?.id}_${todayRecord.date}`;
    const existingIndex = allRecords.findIndex(r => r.id === recordId);
    
    if (existingIndex >= 0) {
      allRecords[existingIndex] = {
        ...allRecords[existingIndex],
        checkOut: timeString,
        hours: Math.round(hours * 10) / 10,
      };
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(allRecords));
      
      const updatedRecord = allRecords[existingIndex];
      setTodayRecord(updatedRecord);
      setIsCheckedIn(false);
      
      toast({
        title: 'Checked out successfully',
        description: `Checked out at ${timeString}. Total hours: ${updatedRecord.hours}h`,
      });
    }
  };

  const recentRecords = attendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);

  const thisMonthRecords = attendance.filter(r => {
    const recordDate = new Date(r.date);
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  });

  const totalHours = thisMonthRecords.reduce((sum, r) => sum + r.hours, 0);
  const presentDays = thisMonthRecords.filter(r => r.status === 'present' || r.checkIn).length;
  const averageHours = presentDays > 0 ? totalHours / presentDays : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-500">Present</Badge>;
      case 'late':
        return <Badge variant="secondary">Late</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'half-day':
        return <Badge variant="outline">Half Day</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">My Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Track your attendance and working hours
          </p>
        </div>

        {/* Check In/Out Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${isCheckedIn ? 'bg-green-500/10' : 'bg-muted'}`}>
                  <Clock className={`h-8 w-8 ${isCheckedIn ? 'text-green-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {todayRecord?.checkIn 
                      ? `Checked in at ${todayRecord.checkIn}${todayRecord.checkOut ? `, out at ${todayRecord.checkOut}` : ''}`
                      : 'Click the button to check in'
                    }
                  </p>
                  {todayRecord?.checkOut && (
                    <p className="text-sm font-medium mt-1">
                      Total hours: {todayRecord.hours}h
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!isCheckedIn ? (
                  <Button size="lg" onClick={handleCheckIn}>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Check In
                  </Button>
                ) : (
                  <Button size="lg" variant="destructive" onClick={handleCheckOut}>
                    <XCircle className="mr-2 h-5 w-5" />
                    Check Out
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Days Present</div>
                  <div className="text-2xl font-semibold mt-1">{presentDays}</div>
                  <div className="text-xs text-muted-foreground mt-1">This month</div>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                  <div className="text-2xl font-semibold mt-1">{totalHours.toFixed(1)}h</div>
                  <div className="text-xs text-muted-foreground mt-1">This month</div>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Avg. Hours/Day</div>
                  <div className="text-2xl font-semibold mt-1">{averageHours.toFixed(1)}h</div>
                  <div className="text-xs text-muted-foreground mt-1">This month</div>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  recentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{record.checkIn || '-'}</TableCell>
                      <TableCell>{record.checkOut || '-'}</TableCell>
                      <TableCell>{record.hours > 0 ? `${record.hours}h` : '-'}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}

