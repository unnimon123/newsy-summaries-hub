
import { useState, useEffect } from "react";
import { format } from "date-fns";
import MainLayout from "@/components/MainLayout";
import NotificationForm, { NotificationData } from "@/components/NotificationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Send, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the interface for notifications as they come from Supabase
interface SupabaseNotification {
  id: string;
  title: string;
  body: string;
  target_audience: string;
  link_to_article: string | null;
  sent_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  created_by: string | null;
}

// Interface for our frontend notification model
interface NotificationWithId extends NotificationData {
  id: string;
  sent_at?: string;
  scheduled_for?: string;
}

const Notifications = () => {
  const [sentNotifications, setSentNotifications] = useState<NotificationWithId[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<NotificationWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Map Supabase notification to our frontend model
  const mapSupabaseNotification = (data: SupabaseNotification): NotificationWithId => {
    return {
      id: data.id,
      title: data.title,
      body: data.body,
      targetAudience: data.target_audience,
      linkToArticle: data.link_to_article || undefined,
      scheduleLater: !!data.scheduled_for,
      scheduledTime: data.scheduled_for || undefined,
      sent_at: data.sent_at || undefined,
      scheduled_for: data.scheduled_for || undefined
    };
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch sent notifications
      const { data: sentData, error: sentError } = await supabase
        .from('notifications')
        .select('*')
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false });

      if (sentError) throw sentError;
      
      // Fetch scheduled notifications
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('notifications')
        .select('*')
        .is('sent_at', null)
        .not('scheduled_for', 'is', null)
        .order('scheduled_for', { ascending: true });

      if (scheduledError) throw scheduledError;

      setSentNotifications(sentData ? sentData.map(mapSupabaseNotification) : []);
      setScheduledNotifications(scheduledData ? scheduledData.map(mapSupabaseNotification) : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async (data: NotificationData) => {
    try {
      const notificationData = {
        title: data.title,
        body: data.body,
        target_audience: data.targetAudience,
        link_to_article: data.linkToArticle || null,
        scheduled_for: data.scheduleLater ? data.scheduledTime : null,
        sent_at: data.scheduleLater ? null : new Date().toISOString(),
      };

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;
      
      // Refresh notifications list
      await fetchNotifications();
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error sending notification:", error);
      return Promise.reject(error);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setScheduledNotifications(scheduledNotifications.filter(n => n.id !== id));
      toast.success("Scheduled notification cancelled");
    } catch (error) {
      console.error("Error deleting scheduled notification:", error);
      toast.error("Failed to cancel scheduled notification");
    }
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
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>Loading notifications...</p>
                  </CardContent>
                </Card>
              ) : sentNotifications.length === 0 ? (
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
                            Sent: {notification.sent_at && formatDate(notification.sent_at)}
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
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>Loading scheduled notifications...</p>
                  </CardContent>
                </Card>
              ) : scheduledNotifications.length === 0 ? (
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
                            Scheduled: {notification.scheduled_for && formatDate(notification.scheduled_for)}
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
