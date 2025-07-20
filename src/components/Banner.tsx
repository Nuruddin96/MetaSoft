import { X } from "lucide-react";
import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Banner = () => {
  const { settings } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(true);

  if (!settings.banner_enabled || !isVisible) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 text-center relative">
      <p className="text-sm font-medium">
        {settings.banner_text || "Special announcement"}
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-75"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};