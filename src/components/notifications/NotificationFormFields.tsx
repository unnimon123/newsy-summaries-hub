
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
import { NotificationData } from "./NotificationTypes";

interface NotificationFormFieldsProps {
  formData: NotificationData;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSwitchChange: (checked: boolean) => void;
  handleAudienceChange: (value: string) => void;
  handleNotificationTypeChange: (value: "web" | "mobile" | "both") => void;
}

const NotificationFormFields = ({
  formData,
  errors,
  handleChange,
  handleSwitchChange,
  handleAudienceChange,
  handleNotificationTypeChange,
}: NotificationFormFieldsProps) => {
  const audienceOptions = [
    { value: "all", label: "All Users" },
    { value: "education", label: "Foreign Education Subscribers" },
    { value: "visa", label: "Visa Subscribers" },
    { value: "scholarship", label: "Scholarship Subscribers" },
    { value: "course", label: "Course Subscribers" },
    { value: "immigration", label: "Immigration Subscribers" },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Notification Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
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
        {errors.body && <p className="text-sm text-red-500">{errors.body}</p>}
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
    </div>
  );
};

export default NotificationFormFields;
