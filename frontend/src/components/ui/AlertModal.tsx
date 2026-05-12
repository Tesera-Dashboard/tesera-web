"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "danger" | "info";
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Evet",
  cancelText = "İptal",
  variant = "warning",
}: AlertModalProps) {
  const getImage = () => {
    switch (variant) {
      case "warning":
        return "/warning.png";
      case "danger":
        return "/warning.png";
      case "info":
        return "/warning.png";
      default:
        return "/warning.png";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20";
      case "warning":
        return "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20";
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20";
      default:
        return "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${getVariantStyles()}`}>
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative h-20 w-20">
              <Image
                src={getImage()}
                alt="Warning"
                fill
                className="object-contain"
              />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
