
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

interface NotificationFormFooterProps {
  isSending: boolean;
  isScheduled: boolean;
}

const NotificationFormFooter = ({
  isSending,
  isScheduled,
}: NotificationFormFooterProps) => {
  return (
    <CardFooter>
      <Button type="submit" disabled={isSending} className="w-full">
        {isSending
          ? "Sending..."
          : isScheduled
          ? "Schedule Notification"
          : "Send Notification Now"}
      </Button>
    </CardFooter>
  );
};

export default NotificationFormFooter;
