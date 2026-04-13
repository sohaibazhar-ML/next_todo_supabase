"use client";
import React, { useActionState } from 'react';

import { useTranslations } from 'next-intl';
import { Text, Button, Input, LoadingOverlay } from '@/website/atoms';
import { FormMessage } from '@/website/molecules';
import { Eye, EyeOff } from 'lucide-react';
import { LoginFormProps } from '@/website/organisms/LoginForm/LoginForm.types';
import { loginAction, resendConfirmationAction } from '@/actions/website/auth.actions';
import { loginSchema } from '@/app/_schemas/website/login.schema';
import { useRouter } from '@/i18n/routing';

export const LoginForm: React.FC<LoginFormProps> = ({ className = '', initialSuccessMessage }) => {
  const t = useTranslations('Login');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, {});
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});
  const [resendStatus, setResendStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isResendPending, startResendTransition] = React.useTransition();

  React.useEffect(() => {
    if (state.errors?.form || state.success || initialSuccessMessage) {
      setShowFeedback(true);
      if (state.success || initialSuccessMessage) {
        if (state.success) setFormData({ email: '', password: '' });
        const timer = setTimeout(() => {
          setShowFeedback(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [state.errors?.form, state.success, initialSuccessMessage]);

  const clearFeedback = () => setShowFeedback(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFeedback();
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    if (resendStatus !== 'idle') setResendStatus('idle');
  };

  const handleResend = () => {
    if (!state.email || isResendPending) return;
    setResendStatus('loading');
    startResendTransition(async () => {
      const result = await resendConfirmationAction(state.email!);
      setResendStatus(result.success ? 'success' : 'error');
    });
  };

  const clientValidation = loginSchema.safeParse(formData);
  const clientErrors: Record<string, string[]> = !clientValidation.success
    ? clientValidation.error.flatten().fieldErrors as Record<string, string[]>
    : {};

  const getFieldError = (name: string) => {
    const value = formData[name as keyof typeof formData];
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
        <Text variant="login-description" className="text-secondary max-w-[450px] font-semibold">
          {t('description')}
        </Text>
      </div>

      <form action={formAction} className="w-full flex flex-col items-center">
        <div className="w-full max-w-[519px] flex flex-col gap-6 mb-8">
          <Input
            id="email"
            name="email"
            label={t('email')}
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!getFieldError('email')}
            errorText={getFieldError('email')}
            onFocus={() => {
              clearFeedback();
              setTouchedFields(prev => ({ ...prev, email: true }));
            }}
            required
          />
          <Input
            id="password"
            name="password"
            label={t('password')}
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            error={!!getFieldError('password')}
            errorText={getFieldError('password')}
            onFocus={() => {
              clearFeedback();
              setTouchedFields(prev => ({ ...prev, password: true }));
            }}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword(!showPassword)}
            required
          />

          {showFeedback && (
            <>
              {state.errors?.form && (
                <div className="flex flex-col items-center w-full gap-2">
                  <FormMessage 
                    variant="error" 
                    message={state.errors.form} 
                  />
                  
                  {state.needsConfirmation && (
                    <div className="mt-2">
                      {resendStatus === 'success' ? (
                        <FormMessage 
                          variant="success" 
                          message={t('resendSuccess')} 
                        />
                      ) : resendStatus === 'error' ? (
                        <FormMessage 
                          variant="error" 
                          message={t('resendError')} 
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={isResendPending}
                          className="text-secondary underline underline-offset-4 hover:text-primary transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {isResendPending ? t('loading') : t('resendConfirmation')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(state.success || initialSuccessMessage) && (
                <FormMessage 
                  variant="success" 
                  message={state.success ? t('successMessage') : initialSuccessMessage} 
                />
              )}
            </>
          )}
        </div>

        <div className="flex flex-col items-center w-full">
          <Button
            type="submit"
            variant="primary"
            minWidth={294}
            isLoading={isPending}
            disabled={!formData.email.trim() || !formData.password.trim()}
            className="!h-[46px] !rounded-[6px] flex items-center justify-center gap-[10px] font-medium text-[22px] py-[8.5px] px-4"
          >
            {t('submit')}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/forgot-password')}
            className="text-secondary focus:outline-none transition-colors mt-8 group !h-auto !p-0 hover:bg-transparent"
          >
            <Text variant="login-forgot" className="text-secondary/60 group-hover:text-secondary underline underline-offset-4 decoration-primary/30 group-hover:decoration-primary">
              {t('forgot')}
            </Text>
          </Button>
        </div>
      </form>
    </div>
  );
};
