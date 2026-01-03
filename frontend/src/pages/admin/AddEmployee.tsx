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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin.service';
import { Role } from '@/types';

// Department and position options
const departments = [
  'Human Resources',
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
];

const positions = [
  'Software Developer',
  'Senior Developer',
  'Marketing Specialist',
  'Marketing Manager',
  'Sales Representative',
  'Sales Manager',
  'HR Manager',
  'HR Specialist',
  'Finance Manager',
  'Accountant',
  'Operations Manager',
  'Project Manager',
];

export default function AddEmployee() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: Role.EMPLOYEE as Role,
    company: '',
    department: '',
    location: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    monthlyWage: '',
    jobPosition: '',
    managerId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminService.createEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        company: formData.company,
        department: formData.department,
        location: formData.location,
        dateOfJoining: formData.dateOfJoining,
        monthlyWage: parseFloat(formData.monthlyWage),
        jobPosition: formData.jobPosition || undefined,
        managerId: formData.managerId || undefined,
      });

      toast({
        title: 'Success',
        description: 'Employee created successfully. Login credentials have been sent to their email.',
      });

      navigate('/admin/employees');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to create employee. Please try again.',
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
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                      placeholder="Company Name"
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
                    <Label htmlFor="jobPosition">Job Position</Label>
                    <Select
                      value={formData.jobPosition}
                      onValueChange={(value) => setFormData({ ...formData, jobPosition: value })}
                    >
                      <SelectTrigger id="jobPosition">
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

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder="City, State"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyWage">Monthly Wage (₹) *</Label>
                    <Input
                      id="monthlyWage"
                      type="number"
                      value={formData.monthlyWage}
                      onChange={(e) => setFormData({ ...formData, monthlyWage: e.target.value })}
                      required
                      placeholder="50000"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={Role.EMPLOYEE} id="employee" />
                        <Label htmlFor="employee" className="font-normal cursor-pointer">Employee</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={Role.ADMIN} id="admin" />
                        <Label htmlFor="admin" className="font-normal cursor-pointer">Admin</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Login ID and password will be auto-generated and sent to the employee's email address.
                  </p>
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

