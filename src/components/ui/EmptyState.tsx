import React from "react";
import { Camera, Sparkles, FolderOpen } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Be the first to capture this moment",
  description = "No photos or videos shared yet. Scan the QR code or tap upload below to publish your memory!",
  actionText = "Upload Memory",
  onAction,
  icon,
}) => {
  return (
    <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-white/10 max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-400 mx-auto flex items-center justify-center border border-brand-500/40 shadow-glow-brand">
        {icon || <Camera className="w-8 h-8" />}
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
      </div>

      {onAction && (
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={onAction} className="shadow-glow-brand">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
