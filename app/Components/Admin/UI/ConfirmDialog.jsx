"use client";

import { AlertTriangle } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={
              danger ? "danger" : "primary"
            }
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-500/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <AlertTriangle size={18} />
        </div>

        <p className="text-xs leading-5 text-red-700 dark:text-red-300">
          Please make sure you want to continue before
          confirming this action.
        </p>
      </div>
    </Modal>
  );
}
