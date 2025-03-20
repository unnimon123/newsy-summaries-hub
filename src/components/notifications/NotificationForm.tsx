
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import NotificationFormHeader from "./NotificationFormHeader";
import NotificationFormFields from "./NotificationFormFields";
import NotificationFormFooter from "./NotificationFormFooter";
import { NotificationData } from "./NotificationTypes";

interface NotificationFormProps {
  onSubmit: (data: NotificationData) => Promise<void>;
}

const NotificationForm = ({ onSubmit }: NotificationFormProps) => {
  const [formData, setFormData] = useState<NotificationData>({
    title: "",
    body: "",
    targetAudience: "all",
    notificationType: "both",
    linkToArticle: "",
    scheduleLater: false,
    scheduledTime: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, scheduleLater: checked }));
  };

  const handleAudienceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, targetAudience: value }));
  };

  const handleNotificationTypeChange = (value: "web" | "mobile" | "both") => {
    setFormData((prev) => ({ ...prev, notificationType: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.body.trim()) {
      newErrors.body = "Message body is required";
    }
    
    if (formData.scheduleLater && !formData.scheduledTime) {
      newErrors.scheduledTime = "Scheduled time is required when scheduling for later";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSending(true);
    
    try {
      await onSubmit(formData);
      
      toast.success(
        formData.scheduleLater
          ? "Notification scheduled successfully"
          : "Notification sent successfully"
      );
      
      // Reset form
      setFormData({
        title: "",
        body: "",
        targetAudience: "all",
        notificationType: "both",
        linkToArticle: "",
        scheduleLater: false,
        scheduledTime: "",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full">
      <NotificationFormHeader />
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <NotificationFormFields
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleSwitchChange={handleSwitchChange}
            handleAudienceChange={handleAudienceChange}
            handleNotificationTypeChange={handleNotificationTypeChange}
          />
        </CardContent>
        <NotificationFormFooter 
          isSending={isSending} 
          isScheduled={formData.scheduleLater} 
        />
      </form>
    </Card>
  );
};

export default NotificationForm;
