"use client";
import React, { useActionState } from 'react';

import { useTranslations } from 'next-intl';
import { Text, Button, Input } from '@/website/atoms';
import { LoginFormProps } from '@/website/organisms/LoginForm/LoginForm.types';
import { loginAction } from '@/actions/website/auth.actions';
import { useRouter } from '@/i18n/routing';

export const LoginForm: React.FC<LoginFormProps> = ({ className = '' }) => {
  const t = useTranslations('Login');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className={`w-full bg-white mt-10 md:mt-20 pt-12 md:pt-16 pb-16 md:pb-20 px-6 md:px-20 flex flex-col items-center rounded-none shadow-sm ${className}`}>
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
            error={!!state.errors?.email}
            errorText={state.errors?.email?.[0]}
            required
          />
          <Input
            id="password"
            name="password"
            label={t('password')}
            type="password"
            error={!!state.errors?.password}
            errorText={state.errors?.password?.[0]}
            required
          />

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
        </div>

        <div className="flex flex-col items-center w-full">
          <Button
            type="submit"
            variant="primary"
            minWidth={294}
            isLoading={isPending}
            className="!h-[46px] !rounded-[6px] flex items-center justify-center gap-[10px] uppercase font-medium text-[22px] py-[8.5px] px-4"
          >
            {t('submit')}
          </Button>

          <div className="mt-10 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/forgot-password')}
              className="!p-0 !h-auto hover:bg-transparent"
            >
              <Text variant="body-sm" className="text-secondary font-medium text-[22px] hover:text-secondary transition-colors">
                {t('forgot')}
              </Text>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
