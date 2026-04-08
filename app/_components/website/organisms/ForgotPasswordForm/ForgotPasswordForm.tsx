"use client";
import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button, Input, LoadingOverlay } from '@/website/atoms';
import { ForgotPasswordFormProps } from '@/website/organisms/ForgotPasswordForm/ForgotPasswordForm.types';
import { forgotPasswordAction } from '@/actions/website/auth.actions';
import { useRouter } from '@/i18n/routing';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ className = '' }) => {
  const t = useTranslations('Login.forgotPassword');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, {});
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    if (state.errors?.form || state.success) {
      setShowFeedback(true);
      if (state.success) {
        setEmail('');
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
    setEmail(e.target.value);
  };

  return (
    <div className={`w-full bg-white mt-10 md:mt-20 pt-12 md:pt-16 pb-16 md:pb-20 px-6 md:px-20 flex flex-col items-center rounded-none shadow-sm relative ${className}`}>
      <LoadingOverlay isVisible={isPending} />
      <div className="flex flex-col items-center gap-4 text-center mb-10">
        <Text variant="login-title" className="text-secondary uppercase">
          {t('title')}
        </Text>
        <Text variant="login-description" className="text-secondary font-bold max-w-prose">
          {t('subtitle')}
        </Text>
        <Text variant="text-xs" className="text-secondary/70 max-w-[450px] leading-relaxed mt-2">
          {t('instruction')}
        </Text>
      </div>

      <form action={formAction} className="w-full flex flex-col items-center">
        <div className="w-full max-w-[519px] flex flex-col gap-6 mb-10">
          <Input
            id="email"
            name="email"
            label={t('emailLabel')}
            type="email"
            placeholder=" "
            value={email}
            onChange={handleInputChange}
            error={!!state.errors?.email}
            errorText={state.errors?.email?.[0]}
            onFocus={clearFeedback}
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
              minWidth={294}
              isLoading={isPending}
              className="!h-[46px] !rounded-[6px] flex items-center justify-center gap-[10px] uppercase font-bold px-10"
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
