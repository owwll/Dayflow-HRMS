import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, TrendingUp, Users, Clock, DollarSign, FileText } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('attendance');

  const reportCards = [
    {
      title: 'Attendance Report',
      description: 'Daily, weekly, and monthly attendance statistics',
      icon: Clock,
      color: 'bg-blue-500',
      type: 'attendance',
    },
    {
      title: 'Leave Report',
      description: 'Employee leave requests and approvals',
      icon: Calendar,
      color: 'bg-green-500',
      type: 'leave',
    },
    {
      title: 'Payroll Report',
      description: 'Salary and compensation reports',
      icon: DollarSign,
      color: 'bg-yellow-500',
      type: 'payroll',
    },
    {
      title: 'Employee Report',
      description: 'Employee demographics and statistics',
      icon: Users,
      color: 'bg-purple-500',
      type: 'employees',
    },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Reports Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Generate and download various reports
              </p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {reportCards.map((card) => (
              <Card
                key={card.type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  reportType === card.type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setReportType(card.type)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                      <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportCards.map((card) => (
                          <SelectItem key={card.type} value={card.type}>
                            {card.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select defaultValue="month">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">This Quarter</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground font-medium">
                        {reportCards.find(c => c.type === reportType)?.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Report preview will be displayed here
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Total Employees</div>
                      <div className="text-xs text-muted-foreground">Active staff</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">48</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Avg. Attendance</div>
                      <div className="text-xs text-muted-foreground">This month</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">87%</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Monthly Payroll</div>
                      <div className="text-xs text-muted-foreground">January 2024</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">₹12.45L</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Pending Leaves</div>
                      <div className="text-xs text-muted-foreground">Awaiting approval</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">5</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}

