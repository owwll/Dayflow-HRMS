import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { attendanceService } from '@/services/attendance.service';
import { AttendanceRecord, AttendanceHistory } from '@/types';

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [todayAttendanceId, setTodayAttendanceId] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const currentDate = new Date();
      const month = format(currentDate, 'yyyy-MM');
      const response: AttendanceHistory = await attendanceService.getAttendanceRecords(month, 1, 100);
      const records = response.records || [];
      setAttendance(records);
      
      // Find today's record
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRec = records.find(r => {
        try {
          const recordDate = safeParseDate(r.date);
          return recordDate && format(recordDate, 'yyyy-MM-dd') === today;
        } catch {
          return false;
        }
      });
      
      if (todayRec) {
        setTodayRecord(todayRec);
        setIsCheckedIn(!!todayRec.checkIn && !todayRec.checkOut);
        // If we don't have the attendance ID but we're checked in, we need to get it
        // This can happen if the page was refreshed after check-in
        if (todayRec.checkIn && !todayRec.checkOut && !todayAttendanceId) {
          // Try to get the attendance ID from the backend
          // For now, we'll need to store it when checking in
        }
      } else {
        setTodayRecord(null);
        setIsCheckedIn(false);
        setTodayAttendanceId(null);
      }
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

  // Helper to safely parse dates
  const safeParseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
      let dateObj: Date;
      if (dateString.includes('T')) {
        dateObj = new Date(dateString);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateObj = new Date(dateString + 'T00:00:00');
      } else {
        dateObj = new Date(dateString);
      }
      return !isNaN(dateObj.getTime()) ? dateObj : null;
    } catch {
      return null;
    }
  };

  // Helper to safely format dates
  const safeFormatDate = (dateString: string | null | undefined, formatStr: string): string => {
    if (!dateString) return '-';
    const dateObj = safeParseDate(dateString);
    if (!dateObj) return dateString;
    try {
      return format(dateObj, formatStr);
    } catch {
      return dateString;
    }
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      // Get user's current location (required by backend)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const result = await attendanceService.checkIn({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            
            toast({
              title: 'Checked in successfully',
              description: `Checked in at ${result.checkInTime ? safeFormatDate(result.checkInTime, 'h:mm a') : 'now'}`,
            });
            
            // Store attendance ID for check-out
            if (result.attendanceId) {
              setTodayAttendanceId(result.attendanceId);
              // Refresh attendance data to get the full record
              await fetchAttendance();
            }
          } catch (error: any) {
            toast({
              title: 'Error',
              description: error.response?.data?.error?.message || 'Failed to check in',
              variant: 'destructive',
            });
          } finally {
            setIsCheckingIn(false);
          }
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Please enable location access to check in',
            variant: 'destructive',
          });
          setIsCheckingIn(false);
        }
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to check in. Please try again.',
        variant: 'destructive',
      });
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord || !todayRecord.checkIn) {
      toast({
        title: 'Error',
        description: 'No check-in record found for today.',
        variant: 'destructive',
      });
      return;
    }
    
    // Use stored attendance ID from check-in, or find it from today's record
    let attendanceId = todayAttendanceId;
    
    // If we don't have the ID, try to find today's attendance record
    if (!attendanceId && todayRecord) {
      // The record should have an ID field, but if not, we need to fetch it
      // For now, we'll try to use the record's date to find it
      try {
        // Re-fetch today's attendance to get the ID
        const currentDate = new Date();
        const month = format(currentDate, 'yyyy-MM');
        const response: AttendanceHistory = await attendanceService.getAttendanceRecords(month, 1, 100);
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayRec = response.records?.find(r => {
          try {
            const recordDate = safeParseDate(r.date);
            return recordDate && format(recordDate, 'yyyy-MM-dd') === today;
          } catch {
            return false;
          }
        });
        
        if (todayRec && (todayRec as any).id) {
          attendanceId = (todayRec as any).id;
        }
      } catch (error) {
        console.error('Error finding attendance ID:', error);
      }
    }
    
    if (!attendanceId) {
      toast({
        title: 'Error',
        description: 'Attendance record not found. Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      // Get user's current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const result = await attendanceService.checkOut(attendanceId, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            
            toast({
              title: 'Checked out successfully',
              description: `Checked out at ${result.checkOutTime ? safeFormatDate(result.checkOutTime, 'h:mm a') : 'now'}. Total hours: ${result.workHours?.toFixed(1) || 0}h`,
            });
            
            // Clear attendance ID and refresh data
            setTodayAttendanceId(null);
            await fetchAttendance();
          } catch (error: any) {
            toast({
              title: 'Error',
              description: error.response?.data?.error?.message || 'Failed to check out',
              variant: 'destructive',
            });
          } finally {
            setIsCheckingOut(false);
          }
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Please enable location access to check out',
            variant: 'destructive',
          });
          setIsCheckingOut(false);
        }
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to check out. Please try again.',
        variant: 'destructive',
      });
      setIsCheckingOut(false);
    }
  };

  const recentRecords = attendance
    .sort((a, b) => {
      const dateA = safeParseDate(a.date);
      const dateB = safeParseDate(b.date);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 30);

  const thisMonthRecords = attendance.filter(r => {
    const recordDate = safeParseDate(r.date);
    if (!recordDate) return false;
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  });

  const totalHours = thisMonthRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);
  const presentDays = thisMonthRecords.filter(r => r.status === 'PRESENT' || r.status === 'present' || r.checkIn).length;
  const averageHours = presentDays > 0 ? totalHours / presentDays : 0;

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'present':
      case 'presence':
        return <Badge variant="default" className="bg-green-500">Present</Badge>;
      case 'late':
        return <Badge variant="secondary">Late</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'half-day':
      case 'half_day':
        return <Badge variant="outline">Half Day</Badge>;
      case 'on_leave':
        return <Badge variant="outline">On Leave</Badge>;
      default:
        return <Badge variant="secondary">{status || '-'}</Badge>;
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
                      ? `Checked in at ${safeFormatDate(todayRecord.checkIn, 'h:mm a')}${todayRecord.checkOut ? `, out at ${safeFormatDate(todayRecord.checkOut, 'h:mm a')}` : ''}`
                      : 'Click the button to check in'
                    }
                  </p>
                  {todayRecord?.checkOut && todayRecord.workHours && (
                    <p className="text-sm font-medium mt-1">
                      Total hours: {todayRecord.workHours.toFixed(1)}h
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!isCheckedIn ? (
                  <Button size="lg" onClick={handleCheckIn} disabled={isCheckingIn || isLoading}>
                    {isCheckingIn ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Checking In...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Check In
                      </>
                    )}
                  </Button>
                ) : (
                  <Button size="lg" variant="destructive" onClick={handleCheckOut} disabled={isCheckingOut || isLoading}>
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Checking Out...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-5 w-5" />
                        Check Out
                      </>
                    )}
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
                    <TableRow key={record.date || Math.random()}>
                      <TableCell className="font-medium">
                        {safeFormatDate(record.date, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{safeFormatDate(record.checkIn, 'h:mm a')}</TableCell>
                      <TableCell>{safeFormatDate(record.checkOut, 'h:mm a')}</TableCell>
                      <TableCell>{record.workHours ? `${record.workHours.toFixed(1)}h` : '-'}</TableCell>
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

