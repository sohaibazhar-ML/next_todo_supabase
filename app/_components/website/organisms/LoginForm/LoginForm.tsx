"use client";
import React, { useActionState } from 'react';

import { useTranslations } from 'next-intl';
import { Text, Button, Input, LoadingOverlay } from '@/website/atoms';
import { Eye, EyeOff } from 'lucide-react';
import { LoginFormProps } from '@/website/organisms/LoginForm/LoginForm.types';
import { loginAction } from '@/actions/website/auth.actions';
import { loginSchema } from '@/app/_schemas/website/login.schema';
import { useRouter } from '@/i18n/routing';

export const LoginForm: React.FC<LoginFormProps> = ({ className = '' }) => {
  const t = useTranslations('Login');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, {});
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (state.errors?.form || state.success) {
      setShowFeedback(true);
      if (state.success) {
        setFormData({ email: '', password: '' });
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
    setTouchedFields(prev => ({ ...prev, [name]: true }));
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
                <Text variant="body-sm" className="text-error-dark text-center">
                  {state.errors.form}
                </Text>
              )}

              {state.success && (
                <Text variant="body-sm" className="text-success text-center">
                  {t('successMessage')}
                </Text>
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
            className="!h-[46px] !rounded-[6px] flex items-center justify-center gap-[10px] uppercase font-medium text-[22px] py-[8.5px] px-4"
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
