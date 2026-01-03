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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { leaveService } from '@/services/leave.service';
import { LeaveRequest } from '@/types';

export default function LeaveManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Dialog state to show leave details
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const getLeaveTypeLabel = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'paid':
        return 'Paid Leave';
      case 'sick':
        return 'Sick Leave';
      case 'unpaid':
        return 'Unpaid Leave';
      default:
        return type || 'Leave';
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const response = await leaveService.getLeaveRequests(undefined, 1, 100);
      setLeaves(response.requests || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to fetch leave requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const employeeName = leave.employeeName || leave.employee?.name || '';
    const employeeId = leave.employeeId || leave.employee?.employeeCode || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (leave.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const pendingLeaves = filteredLeaves.filter(l => (l.status || '').toLowerCase() === 'pending');
  const approvedLeaves = filteredLeaves.filter(l => (l.status || '').toLowerCase() === 'approved');
  const rejectedLeaves = filteredLeaves.filter(l => (l.status || '').toLowerCase() === 'rejected');

  const updateLeaveStatus = async (id: string, action: 'approve' | 'reject') => {
    try {
      await leaveService.approveLeave(id, action);
      toast({
        title: `Leave ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The leave request has been ${action === 'approve' ? 'approved' : 'rejected'}`,
        variant: action === 'approve' ? 'default' : 'destructive',
      });
      fetchLeaves(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || `Failed to ${action} leave request`,
        variant: 'destructive',
      });
    }
  };

  const handleApprove = (id: string) => {
    updateLeaveStatus(id, 'approve');
  };

  const handleReject = (id: string) => {
    updateLeaveStatus(id, 'reject');
  };

  const getStatusBadge = (status: string) => {
    switch ((status || '').toLowerCase()) {
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
          <TableHead>Employee</TableHead>
          <TableHead>Leave Type</TableHead>
          <TableHead>Date Range</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Applied Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              No leave requests found
            </TableCell>
          </TableRow>
        ) : (
          leaveList.map((leave) => {
            const employeeName = leave.employeeName || leave.employee?.name || 'Unknown';
            const employeeId = leave.employeeId || leave.employee?.employeeCode || 'N/A';

            const startDateObj = leave.startDate ? new Date(leave.startDate) : null;
            const endDateObj = leave.endDate ? new Date(leave.endDate) : null;
            const startLabel = startDateObj && !isNaN(startDateObj.getTime()) ? format(startDateObj, 'MMM dd') : 'N/A';
            const endLabel = endDateObj && !isNaN(endDateObj.getTime()) ? format(endDateObj, 'MMM dd, yyyy') : 'N/A';
            const dates = leave.startDate === leave.endDate ? startLabel : `${startLabel} - ${endLabel}`;
            const days = leave.duration || leave.days || 0;
            const appliedObj = leave.appliedDate || leave.appliedOn ? new Date(leave.appliedDate || leave.appliedOn) : null;
            const appliedLabel = appliedObj && !isNaN(appliedObj.getTime()) ? format(appliedObj, 'MMM dd, yyyy') : 'N/A';

            return (
              <TableRow key={leave.id} className="cursor-pointer hover:bg-muted/20" onClick={() => { setSelectedLeave(leave); setIsDetailsDialogOpen(true); }}>
                <TableCell>
                  <div>
                    <div className="font-medium">{employeeName}</div>
                    <div className="text-sm text-muted-foreground font-mono">{employeeId}</div>
                  </div>
                </TableCell>
              <TableCell>{getLeaveTypeLabel(leave.leaveType || leave.type)}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {dates}
                </div>
              </TableCell>
              <TableCell>{days} day{days > 1 ? 's' : ''}</TableCell>
              <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
              <TableCell>{appliedLabel}</TableCell>
              <TableCell>{getStatusBadge(leave.status)}</TableCell>
              <TableCell className="text-right">
                {(leave.status || '').toLowerCase() === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); handleReject(leave.id); }}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleApprove(leave.id); }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Leave Management</h1>
              <p className="text-muted-foreground mt-1">
                Approve or reject employee leave requests
              </p>
            </div>
          </div>

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
                    <div className="text-2xl font-semibold mt-1">{approvedLeaves.length}</div>
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
                    <div className="text-2xl font-semibold mt-1">{rejectedLeaves.length}</div>
                  </div>
                  <XCircle className="h-8 w-8 text-destructive" />
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>

          {/* Leave details dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => { if (!open) setSelectedLeave(null); setIsDetailsDialogOpen(open); }}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Leave Details</DialogTitle>
                <DialogDescription>View leave request details and attachment</DialogDescription>
              </DialogHeader>

              {selectedLeave ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Employee</div>
                      <div className="font-medium">{selectedLeave.employeeName || selectedLeave.employee?.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">{selectedLeave.employeeId || selectedLeave.employee?.employeeCode}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Leave Type</div>
                      <div className="font-medium">{getLeaveTypeLabel(selectedLeave.leaveType || (selectedLeave as any).type)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Date Range</div>
                      <div className="font-medium">{selectedLeave.startDate || 'N/A'} - {selectedLeave.endDate || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Days</div>
                      <div className="font-medium">{selectedLeave.duration || (selectedLeave as any).days || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="font-medium">{(selectedLeave.status || '').toLowerCase()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Reason</div>
                    <div className="font-medium">{selectedLeave.reason}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Attachment</div>
                    {selectedLeave.attachment ? (
                      <img src={selectedLeave.attachment} alt="Attachment" className="max-w-full max-h-80 object-contain rounded" />
                    ) : (
                      <div className="text-sm text-muted-foreground">No attachment</div>
                    )}
                  </div>
                </div>
              ) : null}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </PageContainer>
      </main>
    </div>
  );
}
