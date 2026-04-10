"use client";
import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button, Input, LoadingOverlay } from '@/website/atoms';
import { Eye, EyeOff } from 'lucide-react';
import { ResetPasswordFormProps } from '@/website/organisms/ResetPasswordForm/ResetPasswordForm.types';
import { resetPasswordAction } from '@/actions/website/auth.actions';
import { useRouter } from '@/i18n/routing';

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ className = '' }) => {
  const t = useTranslations('Login.resetPassword');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(resetPasswordAction, {});
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({ newPassword: '', confirmPassword: '' });

  React.useEffect(() => {
    if (state.errors?.form || state.success) {
      setShowFeedback(true);
      if (state.success) {
        setFormData({ newPassword: '', confirmPassword: '' });
        const timer = setTimeout(() => {
          setShowFeedback(false);
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
            error={!!state.errors?.newPassword}
            errorText={state.errors?.newPassword?.[0]}
            onFocus={clearFeedback}
            rightIcon={showNewPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowNewPassword(!showNewPassword)}
            required
            className="w-full"
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label={t('confirmPasswordLabel')}
            type={showConfirmPassword ? "text" : "password"}
            placeholder=" "
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={!!state.errors?.confirmPassword}
            errorText={state.errors?.confirmPassword?.[0]}
            onFocus={clearFeedback}
            rightIcon={showConfirmPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
            required
            className="w-full"
          />

          {showFeedback && (
            <>
              {state.errors?.form && (
                <Text variant="body-sm" className="text-error-dark text-center">
                  {state.errors.form}
                </Text>
              )}

              {state.success && (
                <div className="bg-success-light border border-success-border p-4 rounded-[4px] text-center">
                  <Text variant="body-sm" className="text-success">
                    {t('successMessage')}
                  </Text>
                </div>
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
