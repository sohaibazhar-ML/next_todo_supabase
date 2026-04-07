'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, PawPrint, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Text, Image, Button } from '@/website/atoms';

interface ProfileAvatarProps {
  firstName: string;
  imageUrl?: string | null;
  onUpload?: (file: File) => Promise<{ success: boolean; error?: string }>;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ firstName, imageUrl, onUpload }) => {
  const t = useTranslations('Dashboard.account.avatar');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Clean up object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
    setError(null);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    // 5MB limit check
    if (file.size > 5 * 1024 * 1024) {
      setError(t('tooLarge'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Show instant local preview before upload completes
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setIsUploading(true);
    setShowSuccess(false);
    setError(null);

    try {
      const result = await onUpload(file);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || t('failed'));
        setLocalPreview(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError(t('failed'));
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const displayImage = localPreview ?? imageUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Avatar Container */}
      <div className="relative group">
        {/* Pulsing ring while uploading */}
        {isUploading && (
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/25 z-0" />
        )}

        <div
          className={`w-[120px] h-[120px] rounded-full border-2 flex items-center justify-center overflow-hidden shadow-sm relative z-10 transition-all duration-300 ${
            isUploading
              ? 'border-primary/60'
              : showSuccess
              ? 'border-green-400'
              : 'border-secondary/10 bg-white'
          }`}
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={firstName}
              width={120}
              height={120}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isUploading ? 'opacity-50' : 'opacity-100'
              }`}
              unoptimized={!!localPreview}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-background-neutral/30 group-hover:bg-background-neutral/50 transition-colors">
              <PawPrint size={48} className="text-secondary/20" />
            </div>
          )}

          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="text-white animate-spin drop-shadow-lg" size={36} />
            </div>
          )}
        </div>

        {/* Camera / Success Badge */}
        <Button
          variant="primary"
          className={`absolute bottom-1 right-1 z-20 w-9 h-9 rounded-full text-white flex items-center justify-center border-2 border-white shadow-md transition-all duration-300 active:scale-95 p-0 min-w-0 ${
            showSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary-hover'
          }`}
          aria-label="Edit Profile Picture"
          size="sm"
          onClick={handleCameraClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : showSuccess ? (
            <CheckCircle2 size={18} />
          ) : (
            <Camera size={18} />
          )}
        </Button>
      </div>

      {/* User Name */}
      <Text variant="heading-l" className="text-secondary font-medium tracking-tight mt-2">
        {firstName}
      </Text>

      {/* Success/Error Toast */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          showSuccess || error ? 'max-h-20 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'
        }`}
      >
        {showSuccess && (
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap mb-2">
            <CheckCircle2 size={13} />
            {t('success')}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap mb-2">
            <AlertTriangle size={13} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
