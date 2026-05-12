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

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "İşlem Başarılı",
  description = "İşlem başarıyla tamamlandı.",
  confirmText = "Tamam",
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative h-20 w-20">
              <Image
                src="/success.png"
                alt="Success"
                fill
                className="object-contain"
              />
            </div>
            <DialogTitle className="text-xl text-green-900 dark:text-green-100">{title}</DialogTitle>
            <DialogDescription className="text-center text-green-700 dark:text-green-300">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
          <Button
            variant="default"
            onClick={onClose}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
