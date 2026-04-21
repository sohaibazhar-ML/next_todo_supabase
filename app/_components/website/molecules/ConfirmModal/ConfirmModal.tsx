"use client";

import React from 'react';
import { Text, Button } from '@/website/atoms';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <Text variant="heading-m" className="text-secondary font-bold mb-4">
            {title}
          </Text>
          <Text variant="text-m" className="text-secondary/70 mb-8 leading-relaxed">
            {message}
          </Text>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="px-6 py-2.5 text-[#006A8B] hover:bg-secondary/5 font-semibold text-base border border-[#006A8B] rounded-lg"
            >
              {cancelText}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              className={`px-6 py-2.5 text-white font-semibold text-base rounded-lg transition-all ${
                isDanger ? 'bg-[#D24100] hover:bg-[#B03600]' : 'bg-secondary hover:bg-secondary/90'
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
