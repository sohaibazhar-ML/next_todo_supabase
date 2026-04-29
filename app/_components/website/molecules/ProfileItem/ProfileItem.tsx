"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, LucideIcon, Check, X, Loader2, Pencil } from 'lucide-react';
import { Text, Button, Input, Select, Image } from '@/website/atoms';
import { FormMessage } from '@/website/molecules';
import { Link } from '@/i18n/routing';
import { twMerge } from 'tailwind-merge';

interface Option {
  label: string;
  value: string;
  flag?: string;
}

interface ProfileItemProps {
  icon?: LucideIcon;
  label: string;
  value?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  onSave?: (newValue: string) => Promise<void>;
  className?: string;
  isField?: boolean;
  isEditable?: boolean;
  options?: Option[]; // If provided, uses Select instead of Input
  isOpen?: boolean; // For rotating the chevron
  bottomBorderOnly?: boolean; // For Account page styling: only bottom border on input/select
  target?: string;
}

export const ProfileItem: React.FC<ProfileItemProps> = ({
  icon: Icon,
  label,
  value,
  href,
  onClick,
  onSave,
  className,
  isField = false,
  isEditable = false,
  options,
  isOpen = false,
  bottomBorderOnly = false,
  target,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(typeof value === 'string' ? value : '');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync edit value with external value prop
  useEffect(() => {
    if (typeof value === 'string') {
      setEditValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setErrorMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleEditToggle = (e: React.MouseEvent) => {
    if (!isEditable || isEditing) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSave) return;
    
    setIsLoading(true);
    setStatus('idle');
    try {
      await onSave(editValue);
      setIsEditing(false);
      setStatus('success');
    } catch (error: unknown) {
      console.error('Failed to save:', error);
      setStatus('error');
      setErrorMsg(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(typeof value === 'string' ? value : '');
    setIsEditing(false);
  };

  const content = (
    <div 
      onClick={handleEditToggle}
      className={twMerge(
        "flex items-center gap-6 py-4 border-b border-secondary/5 transition-all w-full group",
        (isEditable && !isEditing) || (!isField && !isEditable) ? "hover:bg-secondary/[0.02] cursor-pointer" : "",
        className
      )}
    >
      {/* Icon Circle */}
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105 group-active:scale-95">
          <Icon size={20} />
        </div>
      )}

      {/* Label and Value/Input */}
      <div className={twMerge(
        "flex flex-col flex-1",
        isField || isEditing ? "gap-0.5" : "justify-center"
      )}>
        <Text variant="text-xxs" className={twMerge(
          "text-text-label font-bold uppercase tracking-wider"
        )}>
          {label}
        </Text>
        {(isField || isEditing) && (
          isEditing ? (
            <div className="w-full pt-1" onClick={(e) => e.stopPropagation()}>
              {options ? (
                <Select
                  autoFocus
                  options={options}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={twMerge(
                    "w-full",
                    bottomBorderOnly && "border-0 border-b border-secondary/20 rounded-none shadow-none px-0 focus:border-primary"
                  )}
                  disabled={isLoading}
                />
              ) : (
                <Input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  inputSize="sm"
                  className="w-full"
                  inputClassName={twMerge(
                    "font-medium bg-transparent border-primary/20 focus:border-primary",
                    bottomBorderOnly && "border-0 border-b border-secondary/20 rounded-none shadow-none px-0 focus:border-primary"
                  )}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(e as any);
                    if (e.key === 'Escape') handleCancel(e as any);
                  }}
                />
              )}
            </div>
          ) : (
            options ? (
              <div className="flex items-center gap-2">
                {options.find(opt => opt.value === value)?.flag && (
                  <div className="relative w-[20px] h-[20px] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <Image
                      src={options.find(opt => opt.value === value)!.flag!}
                      alt=""
                      width={20}
                      height={20}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <Text variant="text-m" className="text-secondary font-medium leading-tight">
                  {options.find(opt => opt.value === value)?.label || value || '–'}
                </Text>
              </div>
            ) : typeof value === 'string' ? (
              <Text variant="text-m" className="text-secondary font-medium leading-tight">
                {value || '–'}
              </Text>
            ) : (
              <div className="pt-1">{value}</div>
            )
          )
        )}
        
        {status !== 'idle' && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
            <FormMessage 
              variant={status === 'success' ? 'success' : 'error'} 
              message={status === 'success' ? 'Saved successfully' : errorMsg} 
              className="!min-h-0 py-1 px-3 text-[14px]"
            />
          </div>
        )}
      </div>

      {/* Action Indicators */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button 
              variant="unstyled"
              onClick={handleSave}
              disabled={isLoading}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            </Button>
            <Button 
              variant="unstyled"
              onClick={handleCancel}
              disabled={isLoading}
              className="p-2 text-secondary/40 hover:bg-secondary/10 rounded-full transition-colors"
            >
              <X size={18} />
            </Button>
          </>
        ) : isEditable ? (
          <div className="text-secondary/30 group-hover:text-primary transition-colors">
            <Pencil size={16} />
          </div>
        ) : !isField ? (
          <div className={twMerge(
            "text-secondary/20 group-hover:text-secondary/60 transition-all duration-300",
            isOpen && "rotate-90 text-primary/80"
          )}>
            <ChevronRight size={22} />
          </div>
        ) : null}
      </div>
    </div>
  );

  if (href && !isEditing) {
    return (
      <Link href={href as any} target={target} className="w-full">
        {content}
      </Link>
    );
  }

  if (onClick && !isEditing) {
    return (
      <div 
        onClick={onClick} 
        className="w-full text-left appearance-none cursor-pointer active:scale-[0.98] transition-all"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
