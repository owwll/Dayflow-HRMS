import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, Bell, Shield, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    leaveApprovals: true,
    payrollAlerts: true,
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'Dayflow HR Suite',
    address: '123, MG Road, Bangalore, Karnataka - 560001',
    phone: '+91 98765 43210',
    email: 'contact@dayflow.com',
    website: 'www.dayflow.com',
  });

  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully',
    });
  };

  const handleSaveCompany = () => {
    toast({
      title: 'Company information updated',
      description: 'Company details have been saved',
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and system preferences
            </p>
          </div>

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="company">
                <Building className="h-4 w-4 mr-2" />
                Company
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about system events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, emailNotifications: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, pushNotifications: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Get weekly summary reports
                      </p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, weeklyReports: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="leave-approvals">Leave Approval Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when leave requests need approval
                      </p>
                    </div>
                    <Switch
                      id="leave-approvals"
                      checked={settings.leaveApprovals}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, leaveApprovals: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="payroll-alerts">Payroll Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get alerts for payroll processing
                      </p>
                    </div>
                    <Switch
                      id="payroll-alerts"
                      checked={settings.payrollAlerts}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, payrollAlerts: checked })
                      }
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companyInfo.companyName}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Address</Label>
                    <Input
                      id="company-address"
                      value={companyInfo.address}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Phone</Label>
                      <Input
                        id="company-phone"
                        value={companyInfo.phone}
                        onChange={(e) =>
                          setCompanyInfo({ ...companyInfo, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) =>
                          setCompanyInfo({ ...companyInfo, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-website">Website</Label>
                    <Input
                      id="company-website"
                      value={companyInfo.website}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, website: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveCompany}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name" defaultValue={user?.firstName || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" defaultValue={user?.lastName || ''} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input id="profile-email" type="email" defaultValue={user?.email || ''} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input id="profile-phone" defaultValue={user?.phone || ''} />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </PageContainer>
      </main>
    </div>
  );
}

