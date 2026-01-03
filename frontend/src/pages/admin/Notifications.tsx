import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'New Employee Joined',
    message: 'Sneha Reddy has joined the Engineering department',
    time: '2024-01-15T10:30:00',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Leave Request Pending',
    message: 'Rahul Kumar has requested leave from Jan 20-22',
    time: '2024-01-15T09:15:00',
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Payroll Processed',
    message: 'January payroll has been processed successfully',
    time: '2024-01-14T16:00:00',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Attendance Alert',
    message: '5 employees have not checked in today',
    time: '2024-01-14T09:30:00',
    read: true,
  },
];

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <PageContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                Stay updated with system alerts and activities
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          <div className="mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</div>
                    <div className="text-sm text-muted-foreground">Latest updates and system alerts</div>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="default">{unreadCount}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {unreadNotifications.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Unread Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(notification.time), 'MMM dd, yyyy • hh:mm a')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {readNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Read Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {readNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 rounded-lg border opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-muted-foreground">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(notification.time), 'MMM dd, yyyy • hh:mm a')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {notifications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up! Check back later for new updates.
                </p>
              </CardContent>
            </Card>
          )}
        </PageContainer>
      </main>
    </div>
  );
}

