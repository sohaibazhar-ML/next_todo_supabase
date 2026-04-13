"use client";
import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button, Input, LoadingOverlay } from '@/website/atoms';
import { FormMessage } from '@/website/molecules';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { ResetPasswordFormProps } from '@/website/organisms/ResetPasswordForm/ResetPasswordForm.types';
import { resetPasswordSchema } from '@/app/_schemas/website/reset-password.schema';
import { resetPasswordAction } from '@/app/_actions/website/auth.actions';
import { useRouter } from '@/i18n/routing';

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ className = '' }) => {
  const t = useTranslations('Login.resetPassword');
  const tr = useTranslations('Register');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(resetPasswordAction, {});
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({ newPassword: '', confirmPassword: '' });
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});

  // Real-time client-side validation
  const clientValidation = resetPasswordSchema.safeParse(formData);
  const clientErrors: Record<string, string[]> = !clientValidation.success
    ? clientValidation.error.flatten().fieldErrors as Record<string, string[]>
    : {};

  const getFieldError = (name: string) => {
    const value = (formData as any)[name];
    // Don't show validation if field is empty (except for match check on confirm)
    if (!value && name !== 'confirmPassword') return undefined;
    
    // Only show validation if the field has been touched
    const serverErrors = (state.errors as any);
    if (!touchedFields[name]) return serverErrors?.[name]?.[0];

    // Prioritize client-side errors
    return clientErrors[name]?.[0] || serverErrors?.[name]?.[0];
  };

  const passwordRules = [
    { key: 'length', label: tr('fields.password.rules.length'), check: (val: string) => val.length >= 8 },
    { key: 'uppercase', label: tr('fields.password.rules.uppercase'), check: (val: string) => /[A-Z]/.test(val) },
    { key: 'number', label: tr('fields.password.rules.number'), check: (val: string) => /[0-9]/.test(val) },
    { key: 'special', label: tr('fields.password.rules.special'), check: (val: string) => /[^a-zA-Z0-9]/.test(val) },
  ];

  const passwordRulesStatus = passwordRules.map(rule => ({
    ...rule,
    isMet: rule.check(formData.newPassword)
  }));

  const showRulesList = formData.newPassword.length > 0 || touchedFields.newPassword;

  React.useEffect(() => {
    if (state.errors?.form || state.success) {
      setShowFeedback(true);
      if (state.success) {
        setFormData({ newPassword: '', confirmPassword: '' });
        setTouchedFields({}); // Clear validation state
        const timer = setTimeout(() => {
          setShowFeedback(false);
          router.push('/login'); // Redirect to login
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [state.errors?.form, state.success]);

  const clearFeedback = () => setShowFeedback(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFeedback();
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Mark as touched on change for immediate feedback
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  return (
    <div className={`w-full bg-white mt-10 md:mt-20 pt-12 md:pt-16 pb-16 md:pb-20 px-6 md:px-20 flex flex-col items-center rounded-none shadow-sm relative ${className}`}>
      <div className="flex flex-col items-center gap-4 text-center mb-10">
        <Text variant="login-title" className="text-secondary uppercase">
          {t('title')}
        </Text>
        <Text variant="login-description" className="text-secondary max-w-prose">
          {t('subtitle')}
        </Text>
      </div>

      <form action={formAction} className="w-full flex flex-col items-center">
        <div className="w-full max-w-[519px] flex flex-col gap-6 mb-10">
          <Input
            id="newPassword"
            name="newPassword"
            label={t('newPasswordLabel')}
            type={showNewPassword ? "text" : "password"}
            placeholder=" "
            value={formData.newPassword}
            onChange={handleInputChange}
            error={!!getFieldError('newPassword')}
            errorText={getFieldError('newPassword')}
            onFocus={() => {
              clearFeedback();
              setTouchedFields(prev => ({ ...prev, newPassword: true }));
            }}
            rightIcon={showNewPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowNewPassword(!showNewPassword)}
            required
            className="w-full"
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
            id="confirmPassword"
            name="confirmPassword"
            label={t('confirmPasswordLabel')}
            type={showConfirmPassword ? "text" : "password"}
            placeholder=" "
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={!!getFieldError('confirmPassword')}
            errorText={getFieldError('confirmPassword')}
            onFocus={() => {
              clearFeedback();
              setTouchedFields(prev => ({ ...prev, confirmPassword: true }));
            }}
            rightIcon={showConfirmPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
            required
            className="w-full"
          />

          {showFeedback && (
            <>
              {state.errors?.form && (
                <FormMessage 
                  variant="error" 
                  message={state.errors.form} 
                />
              )}

              {state.success && (
                <FormMessage 
                  variant="success" 
                  message={t('successMessage')} 
                />
              )}
            </>
          )}
        </div>

        {!state.success && (
          <div className="flex flex-col items-center w-full">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isPending}
              disabled={!clientValidation.success || isPending}
              className="!h-[46px] !rounded-[6px] flex items-center justify-center gap-[10px] font-medium text-[22px] py-[8.5px] px-4"
              width={294}
            >
              {t('submit')}
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/login')}
          className="text-secondary focus:outline-none transition-colors mt-8 group !h-auto !p-0 hover:bg-transparent"
        >
          <Text variant="login-forgot" className="text-secondary/60 group-hover:text-secondary underline underline-offset-4 decoration-primary/30 group-hover:decoration-primary">
            {t('backToLogin')}
          </Text>
        </Button>
      </form>
    </div>
  );
};
