"use client";
import React, { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Text, Button, Input, Select, Checkbox, SelectOption, DateTimeInput } from '@/website/atoms';
import { RegisterFormProps } from '@/website/organisms/RegisterForm/RegisterForm.types';
import { registerAction } from '@/actions/website/auth.actions';
import { useRouter } from '@/i18n/routing';

export const RegisterForm: React.FC<RegisterFormProps> = ({ className = '' }) => {
  const t = useTranslations('Register');
  const locale = useLocale();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, {});
  const [petsSelection, setPetsSelection] = React.useState<string>('');

  const genderOptions: SelectOption[] = [
    { label: t('fields.gender.options.male'), value: 'male' },
    { label: t('fields.gender.options.female'), value: 'female' },
    { label: t('fields.gender.options.other'), value: 'other' },
  ];

  const countryOptions: SelectOption[] = Object.entries(
    t.raw('fields.country.options') as Record<string, string>
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const petOptions: SelectOption[] = [
    { label: t('fields.pets.options.yes'), value: 'yes' },
    { label: t('fields.pets.options.no'), value: 'no' },
  ];

  return (
    <div className={`w-full bg-white mt-10 md:mt-20 pt-12 md:pt-16 pb-0 md:pb-4 px-2 md:px-4 flex flex-col items-center rounded-none shadow-sm ${className}`}>
      <div className="flex flex-col items-center gap-4 text-center w-full mb-10">
        <Text variant="heading-xl" className="text-secondary font-bold">
          {t('title')}
        </Text>
        <Text variant="text-m" className="text-secondary/70">
          {t('subtitle')}
        </Text>
      </div>

      <div className="w-full mb-8">
        <Text variant="text-xs" className="text-secondary font-bold text-left px-1">
          {t('instruction')}
        </Text>
      </div>

      <form action={formAction} className="w-full flex flex-col items-center">
        <input type="hidden" name="locale" value={locale} />
        <div className="grid grid-cols-12 gap-x-6 gap-y-6 w-full mb-6">
          {/* Row 1 */}
          <div className="col-span-12 md:col-span-4">
            <Select
              id="gender"
              name="gender"
              label={t('fields.gender.label')}
              placeholder={t('fields.gender.placeholder')}
              options={genderOptions}
              error={!!state.errors?.gender}
              errorText={state.errors?.gender?.[0]}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Input
              id="firstName"
              name="firstName"
              label={t('fields.firstName')}
              error={!!state.errors?.firstName}
              errorText={state.errors?.firstName?.[0]}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Input
              id="lastName"
              name="lastName"
              label={t('fields.lastName')}
              error={!!state.errors?.lastName}
              errorText={state.errors?.lastName?.[0]}
            />
          </div>

          {/* Row 1.5 - Email and Password */}
          <div className="col-span-12 md:col-span-6">
            <Input
              id="email"
              name="email"
              type="email"
              label={t('fields.email.label')}
              placeholder={t('fields.email.placeholder')}
              error={!!state.errors?.email}
              errorText={state.errors?.email?.[0]}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input
              id="password"
              name="password"
              type="password"
              label={t('fields.password.label')}
              placeholder={t('fields.password.placeholder')}
              error={!!state.errors?.password}
              errorText={state.errors?.password?.[0]}
            />
          </div>

          {/* Row 2 */}
          <div className="col-span-12 md:col-span-8">
            <Input
              id="currentAddress"
              name="currentAddress"
              label={t('fields.currentAddress')}
              error={!!state.errors?.currentAddress}
              errorText={state.errors?.currentAddress?.[0]}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Select
              id="country"
              name="country"
              label={t('fields.country.label')}
              placeholder={t('fields.country.placeholder')}
              options={countryOptions}
              error={!!state.errors?.country}
              errorText={state.errors?.country?.[0]}
            />
          </div>

          {/* Row 3 */}
          <div className="col-span-12">
            <Input
              id="newAddress"
              name="newAddress"
              label={t('fields.newAddress')}
              error={!!state.errors?.newAddress}
              errorText={state.errors?.newAddress?.[0]}
            />
          </div>

          {/* Row 4 */}
          <div className="col-span-12 md:col-span-4">
            <Input
              id="numPersons"
              name="numPersons"
              label={t('fields.numPersons')}
              type="number"
              min="0"
              error={!!state.errors?.numPersons}
              errorText={state.errors?.numPersons?.[0]}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Input
              id="numAdults"
              name="numAdults"
              label={t('fields.numAdults')}
              type="number"
              min="0"
              error={!!state.errors?.numAdults}
              errorText={state.errors?.numAdults?.[0]}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Input
              id="numChildren"
              name="numChildren"
              label={t('fields.numChildren')}
              type="number"
              min="0"
              error={!!state.errors?.numChildren}
              errorText={state.errors?.numChildren?.[0]}
            />
          </div>

          {/* Row 5 */}
          <div className="col-span-12 md:col-span-4">
            <Select
              id="pets"
              name="pets"
              label={t('fields.pets.label')}
              placeholder={t('fields.pets.placeholder')}
              options={petOptions}
              value={petsSelection}
              onChange={(e) => setPetsSelection(e.target.value)}
              error={!!state.errors?.pets}
              errorText={state.errors?.pets?.[0]}
            />
          </div>
          <div className="col-span-12 md:col-span-8">
            <Input
              id="whichPets"
              name="whichPets"
              label={t('fields.whichPets')}
              disabled={petsSelection === 'no'}
              error={!!state.errors?.whichPets}
              errorText={state.errors?.whichPets?.[0]}
            />
          </div>

          {/* Checkbox */}
          <div className="col-span-12 mt-4">
            <Checkbox
              id="consent"
              name="consent"
              label={t('consent')}
              error={!!state.errors?.consent}
            />
            {state.errors?.consent && (
              <Text variant="text-xxs" className="text-error-dark mt-2 block">
                {state.errors.consent[0]}
              </Text>
            )}
          </div>

          {/* Phone & Time */}
          <div className="col-span-12 md:col-span-8">
            <Input
              id="phone"
              name="phone"
              label={t('fields.phone')}
              error={!!state.errors?.phone}
              errorText={state.errors?.phone?.[0]}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <DateTimeInput
              id="preferredTime"
              name="preferredTime"
              label={t('fields.preferredTime.label')}
              placeholder={t('fields.preferredTime.placeholder')}
              error={!!state.errors?.preferredTime}
              errorText={state.errors?.preferredTime?.[0]}
            />
          </div>
        </div>

        <div className="w-full mb-10 px-1">
          <Text variant="text-xs" className="text-secondary/60 leading-relaxed text-left">
            {t('legalNote')}
          </Text>
        </div>

        {state.success && (
          <div className="w-full bg-success-light border border-success-border p-4 rounded-[4px] mb-8 text-center animate-in fade-in slide-in-from-top-2">
            <Text variant="body-sm" className="text-success">
              {t('successMessage')}
            </Text>
          </div>
        )}

        {!state.success && (
          <div className="w-full flex justify-start px-1 pb-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              minWidth={294}
              isLoading={isPending}
              className="!h-[46px] !rounded-[6px] uppercase font-bold px-10"
            >
              {t('submit')}
            </Button>
          </div>
        )}

        {state.errors?.form && (
          <Text variant="body-sm" className="text-error-dark mt-4 text-center">
            {state.errors.form}
          </Text>
        )}
      </form>
    </div>
  );
};
