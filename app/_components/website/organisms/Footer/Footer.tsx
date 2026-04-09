"use client";

import React, { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Input, Text, Image, Button, DateTimeInput } from '@/website/atoms';
import { FooterProps } from '@/website/organisms/Footer/Footer.types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactInput } from '@/schemas/website/contact.schema';
import { submitContactAction } from '@/actions/website/contact.actions';
import { toast } from 'sonner';

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      footer_name: '',
      footer_phone: '',
      footer_time: '',
    },
  });

  // Watch for any changes to clear the error status
  const watchedFields = watch();
  React.useEffect(() => {
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage(null);
    }
  }, [watchedFields.footer_name, watchedFields.footer_phone, watchedFields.footer_time]);

  const onSubmit = (data: ContactInput) => {
    startTransition(async () => {
      setStatus('idle');
      const result = await submitContactAction({
        ...data,
        locale,
      });

      if (result.success) {
        setStatus('success');
        toast.success(t('form.success'));
        reset();

        // Hide success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setErrorMessage(result.error || t('form.error'));
        toast.error(result.error || t('form.error'));
      }
    });
  };

  return (
    <footer id="contact" className="w-full bg-background-dark flex justify-center pt-16 pb-10 text-white h-auto">
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) flex flex-col gap-14">
        <div className="grid grid-cols-12 gap-x-(--spacing-gutter) gap-y-12 items-start">
          {/* Column 1: Links Sidebar */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:pt-[76px]">
            <Link href="/about" className="block w-fit">
              <Text variant="text-xs" className="text-white font-normal text-[23px] hover:text-white/80 transition-colors">{t('about')}</Text>
            </Link>
            <Link href="/faq" className="block w-fit">
              <Text variant="text-xs" className="text-white font-normal text-[23px] hover:text-white/80 transition-colors">{t('faq')}</Text>
            </Link>
            <div className="pt-8">
              <Text variant="text-xxs" className="text-white font-normal text-[21px] leading-tight w-[263px] max-w-[263px]">
                {t('service')}
              </Text>
            </div>
          </div>

          {/* Column 2: Main Contact & Legal section */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
            {/* Top: Phone icon & Questions */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0">
                  <Image
                    src="/assets/website/icons/Button_phone 2.png"
                    alt="Phone"
                    width={50.58}
                    height={50}
                    className="w-12 h-auto object-contain"
                  />
                </div>
                <Text variant="text-xs" className="text-white font-medium text-[22px] leading-snug max-w-[437px]">
                  {t('questions')}
                </Text>
              </div>

              {/* Form Inputs & CTA Button */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row items-start lg:items-center gap-6 w-full">
                <div className="flex flex-col gap-4 w-full max-w-[513px]">
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Controller
                      name="footer_name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="footer-name"
                          label={t('form.name')}
                          labelClassName="sr-only"
                          placeholder={t('form.name')}
                          className="w-[315px]"
                          inputClassName="!h-[36px] !min-h-0"
                          type='text'
                          error={!!errors.footer_name}
                          errorText={errors.footer_name?.message}
                          disabled={isPending}
                        />
                      )}
                    />
                    <Controller
                      name="footer_time"
                      control={control}
                      render={({ field }) => (
                        <DateTimeInput
                          {...field}
                          id="footer-time"
                          label={t('form.time')}
                          labelClassName="sr-only"
                          placeholder={t('form.time')}
                          className="w-[182px]"
                          inputClassName="!h-[36px] !min-h-0"
                          error={!!errors.footer_time}
                          errorText={errors.footer_time?.message}
                          disabled={isPending}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name="footer_phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="footer-phone"
                        label={t('form.phone')}
                        labelClassName="sr-only"
                        placeholder={t('form.phone')}
                        className="w-full"
                        inputClassName="!h-[36px] !min-h-0"
                        error={!!errors.footer_phone}
                        errorText={errors.footer_phone?.message}
                        disabled={isPending}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+\-\s]/g, '');
                        }}
                      />
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  variant="unstyled"
                  disabled={isPending}
                  className="relative w-[80px] h-[80px] p-0 flex-shrink-0 transition-transform hover:scale-105 active:scale-95 border-none bg-transparent hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image
                    src="/assets/website/icons/Button_call-me-back 1.png"
                    alt={t('form.cta')}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </Button>
              </form>

              {/* Status Messages */}
              <div className="h-6 -mt-4">
                {status === 'success' && (
                  <Text variant="text-xxs" className="text-accent font-medium animate-in fade-in slide-in-from-top-1">
                    {t('form.success')}
                  </Text>
                )}
                {status === 'error' && (
                  <Text variant="text-xxs" className="text-error-dark font-medium animate-in fade-in slide-in-from-top-1">
                    {errorMessage}
                  </Text>
                )}
              </div>
            </div>

            {/* Bottom: Legal Links & Logo aligned with Form & CTA */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-y-10 w-full pt-4">
              {/* This div aligns with the Left edge of Inputs (513px group) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-x-8 xl:gap-x-12 gap-y-4 max-w-[513px]">
                <Link href="/imprint">
                  <Text variant="text-xs" className="text-white font-normal text-[18px] hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.imprint')}
                  </Text>
                </Link>
                <Link href="/privacy">
                  <Text variant="text-xs" className="text-white font-normal text-[18px] hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.privacy')}
                  </Text>
                </Link>
                <Link href="/terms">
                  <Text variant="text-xs" className="text-white font-normal text-[18px] hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.terms')}
                  </Text>
                </Link>
                <Text variant="text-xs" className="text-white font-normal text-[18px] whitespace-nowrap">
                  {t('links.hotline')}
                </Text>
              </div>

              {/* Partnership logo aligned with CTA radius */}
              <div className="flex flex-col items-start lg:items-end gap-1 mb-[-4px]">
                <Text variant="text-xxs" className="text-white/60 lowercase italic !text-[11px] lg:mr-4">
                  {t('partnership')}
                </Text>
                <Image
                  src="/assets/website/logos/Logo_helvetia_022026 1.png"
                  alt="Helvetia"
                  width={293}
                  height={56}
                  className="w-[160px] h-auto brightness-0 invert object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
