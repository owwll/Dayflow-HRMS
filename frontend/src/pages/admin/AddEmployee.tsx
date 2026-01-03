import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '@/types';
import { mockUsers, departments, positions } from '@/data/mockUsers';
import { useToast } from '@/hooks/use-toast';

const USERS_KEY = 'dayflow_users';

export default function AddEmployee() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee' as 'employee' | 'admin',
    department: '',
    position: '',
    phone: '',
    address: '',
  });

  const getUsers = (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : mockUsers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const users = getUsers();

      // Check if email already exists
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        toast({
          title: 'Error',
          description: 'An account with this email already exists',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Check if employee ID already exists
      if (users.some(u => (u.employeeId || '').toLowerCase() === formData.employeeId.toLowerCase())) {
        toast({
          title: 'Error',
          description: 'This Employee ID is already registered',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const newUser: User = {
        id: String(users.length + 1),
        employeeId: formData.employeeId,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        phone: formData.phone,
        address: formData.address,
        joinDate: new Date().toISOString().split('T')[0],
        isVerified: true,
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      toast({
        title: 'Success',
        description: 'Employee added successfully',
      });

      navigate('/admin/employees');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add employee. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/admin/employees">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Employees
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">Add New Employee</h1>
            <p className="text-muted-foreground mt-1">Create a new employee account</p>
          </div>

          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
              <CardDescription>Enter the employee's details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      required
                      placeholder="EMP001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="employee@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      placeholder="Rahul"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      placeholder="Kumar"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                      required
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                      required
                    >
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, City, State, PIN Code"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value: 'employee' | 'admin') => setFormData({ ...formData, role: value })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="employee" id="employee" />
                      <Label htmlFor="employee" className="font-normal cursor-pointer">Employee</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin" className="font-normal cursor-pointer">Admin</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" asChild className="flex-1">
                    <Link to="/admin/employees">Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Employee...
                      </>
                    ) : (
                      'Add Employee'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </PageContainer>
      </main>
    </div>
  );
}

