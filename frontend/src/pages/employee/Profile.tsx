import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Building, Save, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    department: user?.department || '',
    position: user?.position || '',
  });

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully',
    });
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      department: user?.department || '',
      position: user?.position || '',
    });
    setIsEditing(false);
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <PageContainer>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your personal information
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.profilePic || undefined} alt={user?.firstName} />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{user?.position || 'Employee'}</p>
                <p className="text-sm text-muted-foreground">{user?.department || 'Department'}</p>
                <Separator className="my-4" />
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user?.phone}</span>
                    </div>
                  )}
                  {user?.employeeId && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground font-mono">{user?.employeeId}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.firstName || 'N/A'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.lastName || 'N/A'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, City, State, PIN Code"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.address || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.department || 'Not assigned'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contact HR to change department</p>
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.position || 'Not assigned'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contact HR to change position</p>
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{user?.employeeId || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}

