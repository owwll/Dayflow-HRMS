import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

const LEAVES_KEY = 'dayflow_leaves';

export default function LeaveRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Paid Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem(LEAVES_KEY);
    if (stored) {
      const allLeaves: LeaveRequest[] = JSON.parse(stored);
      const userLeaves = allLeaves.filter(l => l.employeeId === user?.employeeId);
      setLeaves(userLeaves);
    }
  }, [user]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days <= 0) {
      toast({
        title: 'Invalid dates',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    const stored = localStorage.getItem(LEAVES_KEY);
    const allLeaves: LeaveRequest[] = stored ? JSON.parse(stored) : [];

    const newLeave: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId: user?.employeeId || '',
      employeeName: user ? `${user.firstName} ${user.lastName}` : '',
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days,
      reason: formData.reason,
      status: 'pending',
      appliedDate: format(new Date(), 'yyyy-MM-dd'),
    };

    allLeaves.push(newLeave);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(allLeaves));
    setLeaves([...leaves, newLeave]);

    setIsDialogOpen(false);
    setFormData({ type: 'Paid Leave', startDate: '', endDate: '', reason: '' });

    toast({
      title: 'Leave request submitted',
      description: 'Your leave request has been submitted for approval',
    });
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const approvedLeaves = leaves.filter(l => l.status === 'approved');
  const rejectedLeaves = leaves.filter(l => l.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderTable = (leaveList: LeaveRequest[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Leave Type</TableHead>
          <TableHead>Date Range</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Applied Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No leave requests found
            </TableCell>
          </TableRow>
        ) : (
          leaveList.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell className="font-medium">{leave.type}</TableCell>
              <TableCell>
                {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{leave.days} day{leave.days > 1 ? 's' : ''}</TableCell>
              <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
              <TableCell>{format(new Date(leave.appliedDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{getStatusBadge(leave.status)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <PageContainer>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Leave Requests</h1>
            <p className="text-muted-foreground mt-1">
              Apply for leave and track your leave requests
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Fill in the details to submit your leave request
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Leave Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid Leave">Paid Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                      <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate || format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>
                {formData.startDate && formData.endDate && (
                  <div className="text-sm text-muted-foreground">
                    Total days: {calculateDays(formData.startDate, formData.endDate)}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter the reason for leave"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Pending Requests</div>
                  <div className="text-2xl font-semibold mt-1">{pendingLeaves.length}</div>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                  <div className="text-2xl font-semibold mt-1 text-green-600">{approvedLeaves.length}</div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                  <div className="text-2xl font-semibold mt-1 text-red-600">{rejectedLeaves.length}</div>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pendingLeaves.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedLeaves.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedLeaves.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">
                {renderTable(pendingLeaves)}
              </TabsContent>
              <TabsContent value="approved" className="mt-4">
                {renderTable(approvedLeaves)}
              </TabsContent>
              <TabsContent value="rejected" className="mt-4">
                {renderTable(rejectedLeaves)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}

