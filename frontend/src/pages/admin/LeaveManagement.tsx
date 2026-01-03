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
import { Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { mockUsers } from '@/data/mockUsers';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

const LEAVES_KEY = 'dayflow_leaves';
const USERS_KEY = 'dayflow_users';

export default function LeaveManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Load leave requests from localStorage
    const stored = localStorage.getItem(LEAVES_KEY);
    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;

    if (stored) {
      const allLeaves: any[] = JSON.parse(stored);

      // Add employee names to leave requests
      const leavesWithNames: LeaveRequest[] = allLeaves.map(leave => {
        const employee = users.find(u => u.employeeId === leave.employeeId);
        return {
          ...leave,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
        };
      }).filter(leave => leave.employeeName !== 'Unknown'); // Filter out records without valid users

      setLeaves(leavesWithNames);
    }
  }, []);

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch = leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingLeaves = filteredLeaves.filter(l => l.status === 'pending');
  const approvedLeaves = filteredLeaves.filter(l => l.status === 'approved');
  const rejectedLeaves = filteredLeaves.filter(l => l.status === 'rejected');

  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected') => {
    // Update local state
    const updatedLeaves = leaves.map(leave =>
      leave.id === id ? { ...leave, status } : leave
    );
    setLeaves(updatedLeaves);

    // Update localStorage (remove employeeName before saving)
    const leavesToSave = updatedLeaves.map(({ employeeName, ...leave }) => leave);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(leavesToSave));

    toast({
      title: `Leave ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `The leave request has been ${status === 'approved' ? 'approved' : 'rejected'}`,
      variant: status === 'approved' ? 'default' : 'destructive',
    });
  };

  const handleApprove = (id: string) => {
    updateLeaveStatus(id, 'approved');
  };

  const handleReject = (id: string) => {
    updateLeaveStatus(id, 'rejected');
  };

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
          leaveList.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{leave.employeeName}</div>
                  <div className="text-sm text-muted-foreground font-mono">{leave.employeeId}</div>
                </div>
              </TableCell>
              <TableCell>{leave.type}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                </div>
              </TableCell>
              <TableCell>{leave.days} day{leave.days > 1 ? 's' : ''}</TableCell>
              <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
              <TableCell>{format(new Date(leave.appliedDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{getStatusBadge(leave.status)}</TableCell>
              <TableCell className="text-right">
                {leave.status === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(leave.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(leave.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))
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
      </main>
    </div>
  );
}
