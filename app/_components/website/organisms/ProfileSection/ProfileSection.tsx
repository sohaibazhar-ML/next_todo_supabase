"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Mail, Box, Settings, Phone } from 'lucide-react';
import { ProfileAvatar } from '@/website/molecules/ProfileAvatar/ProfileAvatar';
import { ProfileItem } from '@/website/molecules/ProfileItem/ProfileItem';
import { Text } from '@/website/atoms';
import { Link } from '@/i18n/routing';
import { updateProfileName, updateProfileField, uploadAvatarAction } from '@/app/_actions/website/profile.actions';

interface ProfileSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  currentAddress: string;
  countryOfOrigin: string;
  newAddressSwitzerland: string;
  avatarUrl?: string | null;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  firstName,
  lastName,
  email,
  phoneNumber,
  currentAddress,
  countryOfOrigin,
  newAddressSwitzerland,
  avatarUrl,
}) => {
  const t = useTranslations('Dashboard.account');
  const tSettings = useTranslations('Dashboard.settings');
  const tRegister = useTranslations('Register');
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await uploadAvatarAction(formData);
  };

  // Full country list from translations with flags
  const countryOptions = Object.entries(
    tRegister.raw('fields.country.options') as Record<string, string>
  )
    .map(([value, label]) => ({
      value,
      label,
      flag: `https://flagcdn.com/w40/${value.toLowerCase()}.png`
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <section className="w-full flex justify-center md:justify-start py-12 md:py-20 min-h-[60vh]">
      <div className="max-w-[480px] w-full px-6 flex flex-col items-start translate-x-0 md:translate-x-[40%]">
        
        {/* Breadcrumb Navigation */}
        <div className="w-full flex justify-start mb-12 items-center gap-2">
          <Link href="/dashboard" className="text-secondary/40 hover:text-primary transition-colors font-medium uppercase tracking-[0.1em]">
            <Text variant="text-xxs" className="font-bold">{t('breadcrumbs.account')}</Text>
          </Link>
          <Text variant="text-xxs" className="text-secondary/20">/</Text>
          <Text variant="text-xxs" className="text-secondary/40 font-medium uppercase tracking-[0.1em]">
            {t('breadcrumbs.profile')}
          </Text>
        </div>

        {/* Profile Avatar & Display Name */}
        <div className="mb-14 w-full flex justify-center">
          <ProfileAvatar 
            firstName={firstName} 
            imageUrl={avatarUrl} 
            onUpload={handleAvatarUpload}
          />
        </div>

        {/* Action/Info List */}
        <div className="w-full flex flex-col">
          {/* Primary Profile Details */}
          <ProfileItem 
            icon={User} 
            label={t('myNameLabel')} 
            value={`${firstName} ${lastName}`} 
            isField
            isEditable
            bottomBorderOnly
            onSave={async (newName) => {
              const res = await updateProfileName(newName);
              if (!res.success) throw new Error(res.error);
            }}
          />
          <ProfileItem 
            icon={Mail} 
            label={t('emailLabel')} 
            value={email} 
            isField
            isEditable={false}
          />

          {/* Expandable Contact Details */}
          <ProfileItem 
            icon={Phone} 
            label={t('contactDetails')} 
            onClick={() => setIsContactOpen(!isContactOpen)}
            isOpen={isContactOpen}
            className={isContactOpen ? "bg-secondary/[0.03] border-b-0 text-primary" : ""}
          />
          
          {isContactOpen && (
            <div className="flex flex-col pl-8 border-l-2 border-primary/10 bg-secondary/[0.01] animate-in fade-in slide-in-from-top-2 duration-300">
              <ProfileItem 
                label={t('currentAddress')} 
                value={currentAddress} 
                isField
                isEditable
                bottomBorderOnly
                onSave={async (val) => {
                  const res = await updateProfileField('current_address', val);
                  if (!res.success) throw new Error(res.error);
                }}
              />
              <ProfileItem 
                label={t('country')} 
                value={countryOfOrigin} 
                isField
                isEditable
                options={countryOptions}
                bottomBorderOnly
                onSave={async (val) => {
                  const res = await updateProfileField('country_of_origin', val);
                  if (!res.success) throw new Error(res.error);
                }}
              />
              <ProfileItem 
                label={t('newAddressSwitzerland')} 
                value={newAddressSwitzerland} 
                isField
                isEditable
                bottomBorderOnly
                onSave={async (val) => {
                  const res = await updateProfileField('new_address_switzerland', val);
                  if (!res.success) throw new Error(res.error);
                }}
              />
              <ProfileItem 
                label={t('phoneNumber')} 
                value={phoneNumber} 
                isField
                isEditable
                bottomBorderOnly
                onSave={async (val) => {
                  const res = await updateProfileField('phone_number', val);
                  if (!res.success) throw new Error(res.error);
                }}
              />
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col">
            <ProfileItem 
              icon={Box} 
              label={t('myDocuments')} 
              href="/account/my-documents" 
            />
            <ProfileItem 
              icon={Settings} 
              label={t('settings')} 
              href="/account/settings" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};
