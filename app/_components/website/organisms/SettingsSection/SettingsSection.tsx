"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Languages, ShieldCheck, Lock, HelpCircle, Check, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { ProfileAvatar } from '@/website/molecules/ProfileAvatar/ProfileAvatar';
import { ProfileItem } from '@/website/molecules/ProfileItem/ProfileItem';
import { FormMessage } from '@/website/molecules/FormMessage/FormMessage';
import { Text, Button, Input, Switch } from '@/website/atoms';
import { Link, useRouter } from '@/i18n/routing';
import { updateLanguageAction, updateKeepLoggedInAction, changePasswordAction } from '@/app/_actions/website/settings.actions';
import { updateProfileField, uploadAvatarAction } from '@/app/_actions/website/profile.actions';
import { passwordChangeSchema } from '@/app/_schemas/website/profile.schema';
import { twMerge } from 'tailwind-merge';

interface SettingsSectionProps {
  firstName: string;
  lastName: string;
  currentLanguage: string;
  keepMeLoggedIn: boolean;
  avatarUrl?: string | null;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  firstName,
  currentLanguage,
  keepMeLoggedIn,
  avatarUrl,
}) => {
  const t = useTranslations('Dashboard.settings');
  const tAccount = useTranslations('Dashboard.account');
  const tr = useTranslations('Register');
  const router = useRouter();
  
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordState, setPasswordState] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Real-time client-side validation
  const clientValidation = passwordChangeSchema.safeParse(passwordState);
  const clientErrors: Record<string, string[]> = !clientValidation.success
    ? (clientValidation.error.flatten().fieldErrors as Record<string, string[]>)
    : {};

  const getFieldError = (name: string) => {
    const value = (passwordState as any)[name];
    if (!value && name !== 'confirmPassword') return undefined;
    if (!touchedFields[name]) return undefined;
    return clientErrors[name]?.[0];
  };

  const passwordRules = [
    { key: 'length', label: tr('fields.password.rules.length'), check: (val: string) => val.length >= 8 },
    { key: 'uppercase', label: tr('fields.password.rules.uppercase'), check: (val: string) => /[A-Z]/.test(val) },
    { key: 'number', label: tr('fields.password.rules.number'), check: (val: string) => /[0-9]/.test(val) },
    { key: 'special', label: tr('fields.password.rules.special'), check: (val: string) => /[^a-zA-Z0-9]/.test(val) },
  ];

  const passwordRulesStatus = passwordRules.map(rule => ({
    ...rule,
    isMet: rule.check(passwordState.newPassword)
  }));

  const showRulesList = passwordState.newPassword.length > 0 || touchedFields.newPassword;

  const clearPasswordFeedback = () => {
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const languageOptions = [
    { label: 'English', value: 'en', flag: '/assets/website/icons/uk.png' },
    { label: 'Deutsch', value: 'de', flag: '/assets/website/icons/switzerland.png' },
    { label: 'Français', value: 'fr', flag: '/assets/website/icons/french.png' },
    { label: 'Italiano', value: 'it', flag: '/assets/website/icons/italy.png' },
  ];

  const handlePasswordChange = async () => {
    clearPasswordFeedback();

    if (!clientValidation.success) {
      setTouchedFields({
        oldPassword: true,
        newPassword: true,
        confirmPassword: true,
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      const res = await changePasswordAction(
        passwordState.oldPassword,
        passwordState.newPassword,
        passwordState.confirmPassword
      );
      if (res.success) {
        setPasswordSuccess(true);
        setPasswordState({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTouchedFields({});
        setTimeout(() => setIsPasswordOpen(false), 2000);
      } else {
        if (res.errors) {
          // Field-specific validation errors from server (unlikely with client validation but for safety)
          const firstError = Object.values(res.errors)[0]?.[0];
          setPasswordError(firstError || t('passwordChangeFailed'));
        } else {
          setPasswordError((res as any).error || t('passwordChangeFailed'));
        }
      }
    } catch {
      setPasswordError(t('unexpectedError'));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSessionToggle = async (val: boolean) => {
    try {
      const res = await updateKeepLoggedInAction(val);
      if (!res.success) alert(res.error);
    } catch (error) {
      console.error('Session toggle failed:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await uploadAvatarAction(formData);
  };

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
            {t('breadcrumbs.settings')}
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

        {/* Settings List */}
        <div className="w-full flex flex-col items-stretch">
          {/* Preferred Language */}
          <ProfileItem 
            icon={Languages} 
            label={t('preferredLanguage')} 
            value={currentLanguage} 
            isField
            isEditable
            options={languageOptions}
            onSave={async (newLang) => {
              const dbRes = await updateProfileField('preferred_language', newLang);
              if (!dbRes.success) throw new Error(dbRes.error);
              const res = await updateLanguageAction(newLang);
              if (res.success) router.replace('/account/settings', { locale: newLang as any });
              else throw new Error(res.error);
            }}
          />

          {/* Session Persistence */}
          <ProfileItem 
            icon={ShieldCheck} 
            label={t('keepMeLoggedIn')} 
            value={
              <Switch 
                checked={keepMeLoggedIn} 
                onChange={handleSessionToggle} 
              />
            } 
            isField
            onClick={() => handleSessionToggle(!keepMeLoggedIn)}
            className="cursor-pointer"
          />

          {/* Change Password (Expandable) */}
          <ProfileItem 
            icon={Lock} 
            label={t('securityPassword')} 
            onClick={() => setIsPasswordOpen(!isPasswordOpen)}
            isOpen={isPasswordOpen}
            className={twMerge(
              isPasswordOpen && "bg-secondary/[0.03] border-b-0 text-primary"
            )}
          />
          
          {isPasswordOpen && (
            <div className="flex flex-col gap-4 p-6 border-l-2 border-primary/10 bg-secondary/[0.01] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-3">
                <Input 
                  type={showOldPassword ? "text" : "password"}
                  placeholder={t('oldPassword')}
                  value={passwordState.oldPassword}
                  onChange={(e) => {
                    clearPasswordFeedback();
                    setPasswordState({ ...passwordState, oldPassword: e.target.value });
                    setTouchedFields(prev => ({ ...prev, oldPassword: true }));
                  }}
                  onFocus={clearPasswordFeedback}
                  error={!!getFieldError('oldPassword')}
                  errorText={getFieldError('oldPassword')}
                  rightIcon={showOldPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowOldPassword(!showOldPassword)}
                  inputSize="sm"
                />
                <Input 
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t('newPassword')}
                  value={passwordState.newPassword}
                  onChange={(e) => {
                    clearPasswordFeedback();
                    setPasswordState({ ...passwordState, newPassword: e.target.value });
                    setTouchedFields(prev => ({ ...prev, newPassword: true }));
                  }}
                  onFocus={clearPasswordFeedback}
                  error={!!getFieldError('newPassword')}
                  errorText={getFieldError('newPassword')}
                  rightIcon={showNewPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowNewPassword(!showNewPassword)}
                  inputSize="sm"
                  helperText={
                    showRulesList && (
                      <div className="flex flex-col gap-1 mt-2">
                        {passwordRulesStatus.map((rule) => (
                          <div key={rule.key} className={`flex items-center gap-2 text-xs transition-colors ${rule.isMet ? 'text-success' : 'text-secondary/60'}`}>
                            {rule.isMet ? <CheckCircle2 size={12} className="shrink-0" /> : <span className="w-3 h-3 flex items-center justify-center">•</span>}
                            <span>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                />
                <Input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('confirmNewPassword')}
                  value={passwordState.confirmPassword}
                  onChange={(e) => {
                    clearPasswordFeedback();
                    setPasswordState({ ...passwordState, confirmPassword: e.target.value });
                    setTouchedFields(prev => ({ ...prev, confirmPassword: true }));
                  }}
                  onFocus={clearPasswordFeedback}
                  error={!!getFieldError('confirmPassword')}
                  errorText={getFieldError('confirmPassword')}
                  rightIcon={showConfirmPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  inputSize="sm"
                />
              </div>

              {passwordError && (
                <FormMessage 
                  variant="error" 
                  message={passwordError} 
                  className="!min-h-0 py-2 px-4 shadow-none"
                />
              )}

              {passwordSuccess && (
                <FormMessage 
                  variant="success" 
                  message={t('passwordChanged')} 
                  className="!min-h-0 py-2 px-4 shadow-none"
                />
              )}

              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsPasswordOpen(false)}
                  disabled={isPasswordLoading}
                  textClassName="text-secondary"
                >
                  {t('cancel')}
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handlePasswordChange}
                  isLoading={isPasswordLoading}
                  disabled={!clientValidation.success || isPasswordLoading}
                >
                  {t('saveChanges')}
                </Button>
              </div>
            </div>
          )}

          {/* FAQ/Help Link */}
          <ProfileItem 
            icon={HelpCircle} 
            label={t('helpFaq')} 
            href="/faq" 
          />
        </div>
      </div>
    </section>
  );
};
