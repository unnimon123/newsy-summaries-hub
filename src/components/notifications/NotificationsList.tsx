
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Send, Globe, Smartphone } from "lucide-react";
import { NotificationWithId } from "./NotificationTypes";

interface NotificationsListProps {
  notifications: NotificationWithId[];
  isLoading: boolean;
  type: "sent" | "scheduled";
  onDeleteScheduled?: (id: string) => void;
}

const NotificationsList = ({
  notifications,
  isLoading,
  type,
  onDeleteScheduled,
}: NotificationsListProps) => {
  const getAudienceLabel = (audience: string): string => {
    const audiences: Record<string, string> = {
      all: "All Users",
      education: "Foreign Education",
      visa: "Visas",
      scholarship: "Scholarships",
      course: "Courses",
      immigration: "Immigration",
      individual: "Individual User"
    };
    
    return audiences[audience] || audience;
  };

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'web':
        return <Globe className="h-4 w-4 mr-1" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4 mr-1" />;
      case 'both':
        return (
          <>
            <Globe className="h-4 w-4 mr-1" />
            <Smartphone className="h-4 w-4 mr-1" />
          </>
        );
      default:
        return <Globe className="h-4 w-4 mr-1" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          {type === "sent" ? (
            <>
              <Send className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold">No notifications sent</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your sent notifications will appear here.
              </p>
            </>
          ) : (
            <>
              <Clock className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold">No scheduled notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your scheduled notifications will appear here.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          type={type}
          getAudienceLabel={getAudienceLabel}
          formatDate={formatDate}
          getNotificationTypeIcon={getNotificationTypeIcon}
          onDeleteScheduled={onDeleteScheduled}
        />
      ))}
    </div>
  );
};

interface NotificationCardProps {
  notification: NotificationWithId;
  type: "sent" | "scheduled";
  getAudienceLabel: (audience: string) => string;
  formatDate: (dateString: string) => string;
  getNotificationTypeIcon: (type: string) => React.ReactNode;
  onDeleteScheduled?: (id: string) => void;
}

const NotificationCard = ({
  notification,
  type,
  getAudienceLabel,
  formatDate,
  getNotificationTypeIcon,
  onDeleteScheduled,
}: NotificationCardProps) => {
  if (type === "sent") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{notification.title}</CardTitle>
              <CardDescription className="mt-1 flex items-center">
                Sent: {notification.sent_at && formatDate(notification.sent_at)}
                <span className="ml-2 flex items-center text-xs">
                  {getNotificationTypeIcon(notification.type || 'web')}
                </span>
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {getAudienceLabel(notification.audience || notification.targetAudience)}
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
    );
  } else {
    return (
      <ScheduledNotificationCard 
        notification={notification} 
        getAudienceLabel={getAudienceLabel}
        formatDate={formatDate}
        getNotificationTypeIcon={getNotificationTypeIcon}
        onDeleteScheduled={onDeleteScheduled}
      />
    );
  }
};

interface ScheduledNotificationCardProps {
  notification: NotificationWithId;
  getAudienceLabel: (audience: string) => string;
  formatDate: (dateString: string) => string;
  getNotificationTypeIcon: (type: string) => React.ReactNode;
  onDeleteScheduled?: (id: string) => void;
}

const ScheduledNotificationCard = ({
  notification,
  getAudienceLabel,
  formatDate,
  getNotificationTypeIcon,
  onDeleteScheduled
}: ScheduledNotificationCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{notification.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center">
              Scheduled: {notification.scheduled_for && formatDate(notification.scheduled_for)}
              <span className="ml-2 flex items-center text-xs">
                {getNotificationTypeIcon(notification.type || 'web')}
              </span>
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
            <span>To: {getAudienceLabel(notification.audience || notification.targetAudience)}</span>
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
        
        {onDeleteScheduled && (
          <div className="mt-4 flex justify-end">
            <button
              className="text-red-600 hover:bg-red-50 hover:text-red-700 text-sm px-2 py-1 rounded flex items-center"
              onClick={() => onDeleteScheduled(notification.id)}
            >
              Cancel
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsList;
