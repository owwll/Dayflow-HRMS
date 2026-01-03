import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { User, UserPlus, Search, Edit, Trash2, Mail, Phone, User as LucideUser } from 'lucide-react';
import { User as UserType } from '@/types';
import { mockUsers } from '@/data/mockUsers';

const USERS_KEY = 'dayflow_users';

export default function Employees() {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      // Filter out admin users and current user
      const employeeList = users.filter((u: UserType) => u.role === 'employee');
      setEmployees(employeeList);
    } else {
      const employeeList = mockUsers.filter(u => u.role === 'employee');
      setEmployees(employeeList);
    }
  }, []);

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

  const handleDelete = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.filter((u: UserType) => u.id !== employeeId);
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        setEmployees(updatedUsers.filter((u: UserType) => u.role === 'employee'));
      }
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{employee.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{employee.employeeId}</TableCell>
                        <TableCell>{employee.department || 'N/A'}</TableCell>
                        <TableCell>{employee.position || 'N/A'}</TableCell>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/employees/${employee.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(employee.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

