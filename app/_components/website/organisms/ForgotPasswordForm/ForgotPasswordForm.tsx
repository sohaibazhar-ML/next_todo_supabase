"use client";
import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button, Input, LoadingOverlay } from '@/website/atoms';
import { ForgotPasswordFormProps } from '@/website/organisms/ForgotPasswordForm/ForgotPasswordForm.types';
import { forgotPasswordAction } from '@/actions/website/auth.actions';
import { forgotPasswordSchema } from '@/app/_schemas/website/forgot-password.schema';
import { useRouter } from '@/i18n/routing';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ className = '' }) => {
  const t = useTranslations('Login.forgotPassword');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, {});
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});

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
    const { name, value } = e.target;
    setEmail(value);
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const clientValidation = forgotPasswordSchema.safeParse({ email });
  const clientErrors: Record<string, string[]> = !clientValidation.success
    ? clientValidation.error.flatten().fieldErrors as Record<string, string[]>
    : {};

  const getFieldError = (name: string) => {
    const value = email;
    // Don't show validation if field is empty
    if (value === '') return undefined;
    // Only show validation if the field has been touched
    const serverErrors = (state.errors as any);
    if (!touchedFields[name]) return serverErrors?.[name]?.[0];
    // Prioritize client-side errors
    return clientErrors[name]?.[0] || serverErrors?.[name]?.[0];
  };

  return (
    <div className={`w-full bg-white mt-10 md:mt-20 pt-12 md:pt-16 pb-16 md:pb-20 px-6 md:px-20 flex flex-col items-center rounded-none shadow-sm relative ${className}`}>
      <div className="flex flex-col items-center gap-4 text-center mb-10">
        <Text variant="login-title" className="text-secondary uppercase">
          {t('title')}
        </Text>
        <Text className="text-secondary font-semibold text-[29px] font-heading max-w-prose">
          {t('subtitle')}
        </Text>
        <Text className="text-secondary font-semibold text-[23px] max-w-[550px] leading-relaxed mt-2">
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
            error={!!getFieldError('email')}
            errorText={getFieldError('email')}
            onFocus={() => {
              clearFeedback();
              setTouchedFields(prev => ({ ...prev, email: true }));
            }}
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

        {!(state.success && showFeedback) && (
          <div className="flex flex-col items-center w-full">
             <Button
              type="submit"
              variant="primary"
              size="sm"
              minWidth={294}
              isLoading={isPending}
              disabled={!email.trim() || isPending}
              className="!h-[46px] !rounded-[6px] flex items-center justify-center gap-[10px] uppercase font-medium text-[22px] py-[8.5px] px-4"
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
