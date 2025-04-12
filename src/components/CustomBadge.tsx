"use client";

import { cn } from "@/lib/utils";

interface CustomBadgeProps {
  text?: string;
  color?: string;
  className?: string;
}

const colorClasses = {
  blue: "bg-blue-300 text-blue-800 border-blue-500",
  green: "bg-green-300 text-green-800 border-green-500",
  red: "bg-red-200 text-red-800 border-red-400",
  yellow: "bg-yellow-300 text-yellow-800 border-yellow-500",
  purple: "bg-purple-300 text-purple-800 border-purple-500",
  pink: "bg-pink-300 text-pink-800 border-pink-500",
  indigo: "bg-indigo-300 text-indigo-800 border-indigo-500",
  orange: "bg-orange-300 text-orange-800 border-orange-500",
  teal: "bg-teal-300 text-teal-800 border-teal-500",
  gray: "bg-gray-300 text-gray-800 border-gray-500",
};

export default function CustomBadge({ 
  text = "", 
  color = "blue",
  className
}: CustomBadgeProps) {
  if (!text) return null;
  
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {text}
    </span>
  );
}