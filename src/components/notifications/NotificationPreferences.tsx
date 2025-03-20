import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateNotificationPreferences } from "@/services/pushNotificationService";

interface NotificationPreferencesProps {
  preferences: {
    push_enabled: boolean;
    subscriptions: string[];
    fcm_token: string | null;
  };
  onUpdate: () => void;
}

const NotificationPreferences = ({ preferences, onUpdate }: NotificationPreferencesProps) => {
  const [pushEnabled, setPushEnabled] = useState(preferences.push_enabled);
  const [subscriptions, setSubscriptions] = useState<string[]>(preferences.subscriptions || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPushEnabled(preferences.push_enabled);
    setSubscriptions(preferences.subscriptions || []);
  }, [preferences]);

  const categoryOptions = [
    { id: "all", label: "All Notifications" },
    { id: "education", label: "Foreign Education" },
    { id: "visa", label: "Visa Updates" },
    { id: "scholarship", label: "Scholarship Opportunities" },
    { id: "course", label: "Course Information" },
    { id: "immigration", label: "Immigration News" },
  ];

  const handleSubscriptionChange = (id: string, checked: boolean) => {
    if (id === "all" && checked) {
      // If "all" is checked, uncheck others
      setSubscriptions(["all"]);
    } else if (id === "all" && !checked) {
      // If "all" is unchecked, remove it but keep others
      setSubscriptions(subscriptions.filter(s => s !== "all"));
    } else if (checked) {
      // If a specific category is checked
      const newSubscriptions = subscriptions.filter(s => s !== "all");
      newSubscriptions.push(id);
      setSubscriptions(newSubscriptions);
    } else {
      // If a specific category is unchecked
      setSubscriptions(subscriptions.filter(s => s !== id));
    }
  };

  const savePreferences = async () => {
    // Ensure at least one subscription is selected
    if (subscriptions.length === 0) {
      toast.error("Please select at least one notification category");
      return;
    }

    setIsSaving(true);
    try {
      await updateNotificationPreferences({
        push_enabled: pushEnabled,
        subscriptions: subscriptions,
      });
      toast.success("Notification preferences updated");
      onUpdate();
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on your devices
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={pushEnabled}
            onCheckedChange={setPushEnabled}
          />
        </div>

        <div className="space-y-4">
          <Label>Notification Categories</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categoryOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${option.id}`}
                  checked={subscriptions.includes(option.id)}
                  onCheckedChange={(checked) => 
                    handleSubscriptionChange(option.id, checked === true)
                  }
                  disabled={option.id === "all" && subscriptions.includes("all") && subscriptions.length === 1}
                />
                <Label
                  htmlFor={`category-${option.id}`}
                  className="text-sm font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={savePreferences}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
