"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateUserBadge } from "@/actions/user.action";
import { toast } from "sonner";
import CustomBadge from "@/components/CustomBadge";

const BADGE_COLORS = [
  "blue", "green", "red", "yellow", "purple", 
  "pink", "indigo", "orange", "teal", "gray"
];

interface BadgeSettingsFormProps {
  initialBadgeText?: string;
  initialBadgeColor?: string;
  initialBadgeEnabled?: boolean;
}

export default function BadgeSettingsForm({
  initialBadgeText = "",
  initialBadgeColor = "blue",
  initialBadgeEnabled = false
}: BadgeSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [badgeText, setBadgeText] = useState(initialBadgeText);
  const [badgeColor, setBadgeColor] = useState(initialBadgeColor);
  const [badgeEnabled, setBadgeEnabled] = useState(initialBadgeEnabled);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateUserBadge({
        badgeText,
        badgeColor,
        badgeEnabled
      });
      toast.success("Badge updated successfully!");
    } catch (error) {
      console.error("Failed to update badge:", error);
      toast.error("Failed to update badge. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="badgeText">Badge Text (max 3 words)</Label>
        <Input
          id="badgeText"
          value={badgeText}
          onChange={(e) => setBadgeText(e.target.value)}
          maxLength={30}
          placeholder="Enter badge text"
        />
        <p className="text-sm text-gray-500">
          {badgeText.length}/30 characters
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Badge Color</Label>
        <div className="flex flex-wrap gap-2">
          {BADGE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setBadgeColor(color)}
              className={`w-8 h-8 rounded-full transition-all ${
                badgeColor === color ? "ring-2 ring-offset-2 ring-blue-500" : ""
              }`}
              style={{ 
                backgroundColor: `var(--${color}-100)`,
                border: `1px solid var(--${color}-200)`
              }}
              aria-label={`${color} color`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="badgeEnabled">Display Badge</Label>
          <p className="text-sm text-gray-500">
            Toggle to show or hide your badge
          </p>
        </div>
        <Switch
          id="badgeEnabled"
          checked={badgeEnabled}
          onCheckedChange={setBadgeEnabled}
        />
      </div>

      <div className="pt-4">
        <Label>Preview</Label>
        <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          {badgeEnabled && badgeText ? (
            <CustomBadge text={badgeText} color={badgeColor} />
          ) : (
            <p className="text-sm text-gray-500">
              {!badgeEnabled 
                ? "Badge is disabled" 
                : "Enter badge text to preview"}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Save Badge Settings"}
      </Button>
    </form>
  );
}