"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ValidationAction = "validated" | "rejected";

interface ValidationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  action: ValidationAction;
  postTitle: string;

  loading?: boolean;
  onConfirm: () => void;
}

export default function ValidationConfirmDialog({
  open,
  onOpenChange,
  action,
  postTitle,
  loading = false,
  onConfirm,
}: ValidationConfirmDialogProps) {
  const isValidate = action === "validated";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isValidate ? "Validate Content" : "Reject Content"}
          </DialogTitle>

          <DialogDescription className="text-sm">
            {isValidate ? (
              <>
                Are you sure you want to <b>validate</b> this content?
                <br />
                <span className="font-medium text-foreground">
                  “{postTitle}”
                </span>
              </>
            ) : (
              <>
                Are you sure you want to <b>reject</b> this content?
                <br />
                <span className="font-medium text-foreground">
                  “{postTitle}”
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={isValidate ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isValidate
              ? "Validate"
              : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
