
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface NotificationFormProps {
  onSubmit: (data: NotificationData) => Promise<void>;
}

export interface NotificationData {
  title: string;
  body: string;
  targetAudience: string;
  notificationType: "web" | "mobile" | "both";
  linkToArticle?: string;
  scheduleLater: boolean;
  scheduledTime?: string;
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

  const audienceOptions = [
    { value: "all", label: "All Users" },
    { value: "education", label: "Foreign Education Subscribers" },
    { value: "visa", label: "Visa Subscribers" },
    { value: "scholarship", label: "Scholarship Subscribers" },
    { value: "course", label: "Course Subscribers" },
    { value: "immigration", label: "Immigration Subscribers" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Push Notification</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body">Message Body</Label>
            <Textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={3}
              className={errors.body ? "border-red-500" : ""}
            />
            {errors.body && (
              <p className="text-sm text-red-500">{errors.body}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notificationType">Notification Type</Label>
            <RadioGroup 
              value={formData.notificationType} 
              onValueChange={handleNotificationTypeChange as (value: string) => void}
              className="flex space-x-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="web" id="web" />
                <Label htmlFor="web">Web Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile">Mobile Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both Platforms</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Select
              value={formData.targetAudience}
              onValueChange={handleAudienceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an audience" />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkToArticle">Link to Article (Optional)</Label>
            <Input
              id="linkToArticle"
              name="linkToArticle"
              value={formData.linkToArticle}
              onChange={handleChange}
              placeholder="Article URL or ID"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="scheduleLater"
              checked={formData.scheduleLater}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="scheduleLater">Schedule for later</Label>
          </div>
          
          {formData.scheduleLater && (
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                name="scheduledTime"
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={handleChange}
                className={errors.scheduledTime ? "border-red-500" : ""}
              />
              {errors.scheduledTime && (
                <p className="text-sm text-red-500">{errors.scheduledTime}</p>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isSending} className="w-full">
            {isSending
              ? "Sending..."
              : formData.scheduleLater
              ? "Schedule Notification"
              : "Send Notification Now"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NotificationForm;
