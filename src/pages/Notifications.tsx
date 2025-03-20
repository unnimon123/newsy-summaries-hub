
import MainLayout from "@/components/MainLayout";
import NotificationForm from "@/components/notifications/NotificationForm";
import NotificationsList from "@/components/notifications/NotificationsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/components/notifications/useNotifications";

const Notifications = () => {
  const {
    sentNotifications,
    scheduledNotifications,
    isLoading,
    handleSendNotification,
    handleDeleteScheduled,
  } = useNotifications();

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
            
            <TabsContent value="sent" className="mt-4">
              <NotificationsList
                notifications={sentNotifications}
                isLoading={isLoading}
                type="sent"
              />
            </TabsContent>
            
            <TabsContent value="scheduled" className="mt-4">
              <NotificationsList
                notifications={scheduledNotifications}
                isLoading={isLoading}
                type="scheduled"
                onDeleteScheduled={handleDeleteScheduled}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
