
import { useState } from "react";
import { format } from "date-fns";
import MainLayout from "@/components/MainLayout";
import NotificationForm, { NotificationData } from "@/components/NotificationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Send, Trash2, User } from "lucide-react";

const Notifications = () => {
  // Mock data - in a real app this would come from Supabase
  const [sentNotifications, setSentNotifications] = useState<(NotificationData & { id: string, sentAt: string })[]>([
    {
      id: "1",
      title: "New Scholarships Available",
      body: "Check out the latest scholarship opportunities for international students",
      targetAudience: "scholarship",
      linkToArticle: "https://example.com/scholarships",
      scheduleLater: false,
      sentAt: "2023-11-10T10:30:00Z",
    },
    {
      id: "2",
      title: "Visa Process Updates",
      body: "Important changes to the student visa application process for US-bound students",
      targetAudience: "visa",
      linkToArticle: "https://example.com/visa-updates",
      scheduleLater: false,
      sentAt: "2023-11-05T14:20:00Z",
    },
    {
      id: "3",
      title: "New Immigration Pathways",
      body: "Discover new immigration routes for skilled professionals in Canada",
      targetAudience: "immigration",
      linkToArticle: "https://example.com/immigration-canada",
      scheduleLater: false,
      sentAt: "2023-10-28T09:15:00Z",
    },
  ]);

  const [scheduledNotifications, setScheduledNotifications] = useState<(NotificationData & { id: string })[]>([
    {
      id: "4",
      title: "New Course Recommendations",
      body: "Explore our top picks for online courses starting next month",
      targetAudience: "course",
      linkToArticle: "https://example.com/recommended-courses",
      scheduleLater: true,
      scheduledTime: "2023-12-15T09:00:00Z",
    },
  ]);

  const handleSendNotification = (data: NotificationData) => {
    // In a real app, this would be sent to Supabase
    // Mocking an async operation
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (data.scheduleLater && data.scheduledTime) {
          const newScheduled = {
            ...data,
            id: Date.now().toString(),
          };
          setScheduledNotifications([newScheduled, ...scheduledNotifications]);
        } else {
          const newSent = {
            ...data,
            id: Date.now().toString(),
            sentAt: new Date().toISOString(),
          };
          setSentNotifications([newSent, ...sentNotifications]);
        }
        resolve();
      }, 500);
    });
  };

  const handleDeleteScheduled = (id: string) => {
    setScheduledNotifications(scheduledNotifications.filter((n) => n.id !== id));
  };

  const getAudienceLabel = (audience: string): string => {
    const audiences: Record<string, string> = {
      all: "All Users",
      education: "Foreign Education",
      visa: "Visas",
      scholarship: "Scholarships",
      course: "Courses",
      immigration: "Immigration",
    };
    
    return audiences[audience] || audience;
  };

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>
          <p className="text-muted-foreground">
            Send push notifications to your app users about important updates.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NotificationForm onSubmit={handleSendNotification} />

          <Tabs defaultValue="sent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sent" className="mt-4 space-y-4">
              {sentNotifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Send className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold">No notifications sent</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your sent notifications will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sentNotifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{notification.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Sent: {formatDate(notification.sentAt)}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {getAudienceLabel(notification.targetAudience)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{notification.body}</p>
                      {notification.linkToArticle && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Link: </span>
                          <a
                            href={notification.linkToArticle}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {notification.linkToArticle}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="scheduled" className="mt-4 space-y-4">
              {scheduledNotifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Clock className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold">No scheduled notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your scheduled notifications will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                scheduledNotifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{notification.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Scheduled: {notification.scheduledTime && formatDate(notification.scheduledTime)}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Scheduled
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{notification.body}</p>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="mr-1 h-3 w-3" />
                          <span>To: {getAudienceLabel(notification.targetAudience)}</span>
                        </div>
                        
                        {notification.linkToArticle && (
                          <div className="text-xs text-gray-500">
                            <span>Link: </span>
                            <a
                              href={notification.linkToArticle}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {notification.linkToArticle}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteScheduled(notification.id)}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
