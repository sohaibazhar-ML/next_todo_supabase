"use client";
import React, { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Text, Button, Input, Select, Checkbox, SelectOption, DateTimeInput, LoadingOverlay } from '@/website/atoms';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { RegisterFormProps } from '@/website/organisms/RegisterForm/RegisterForm.types';
import { registerSchema } from '@/schemas/website/register.schema';
import { registerAction } from '@/actions/website/auth.actions';
import { useRouter } from '@/i18n/routing';

export const RegisterForm: React.FC<RegisterFormProps> = ({ className = '' }) => {
  const t = useTranslations('Register');
  const locale = useLocale();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, {});
  const [petsSelection, setPetsSelection] = React.useState<string>('');
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const initialFormData = {
    gender: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    currentAddress: '',
    country: '',
    newAddress: '',
    numPersons: '',
    numAdults: '',
    numChildren: '',
    pets: '',
    whichPets: '',
    phone: '',
    preferredTime: '',
    consent: false,
  };

  const [formData, setFormData] = React.useState(initialFormData);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    if (state.success) {
      setFormData(initialFormData);
      setTouchedFields({});
      setShowSuccess(true);
      setShowError(false);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (state.errors?.form) {
      setShowError(true);
    }
  }, [state.success, state.errors?.form]);

  const clearFeedback = () => {
    setShowError(false);
    setShowSuccess(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    clearFeedback();
    let { name, value } = e.target;
    
    // Sanitize phone input: only allow numbers, +, and -
    if (name === 'phone') {
      value = value.replace(/[^0-9+\-]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const clientValidation = registerSchema.safeParse(formData);
  const clientErrors: Record<string, string[]> = !clientValidation.success
    ? clientValidation.error.flatten().fieldErrors as Record<string, string[]>
    : {};

  const isFormValid = clientValidation.success;

  const getFieldError = (name: string) => {
    const value = formData[name as keyof typeof formData];
    // Rule 1: Don't show validation if field is empty (matching user request: "validation should disappear if the user clears the field")
    if (value === '' || value === false || value === undefined) return undefined;

    // Rule 2: Only show validation if the field has been touched
    const serverError = (state as any).errors?.[name]?.[0];
    if (!touchedFields[name]) return serverError;

    // Rule 3: Prioritize client-side real-time errors, fallback to server errors
    return clientErrors[name]?.[0] || serverError;
  };

  const passwordRules = [
    { key: 'length', label: t('fields.password.rules.length'), check: (val: string) => val.length >= 8 },
    { key: 'uppercase', label: t('fields.password.rules.uppercase'), check: (val: string) => /[A-Z]/.test(val) },
    { key: 'number', label: t('fields.password.rules.number'), check: (val: string) => /[0-9]/.test(val) },
    { key: 'special', label: t('fields.password.rules.special'), check: (val: string) => /[^a-zA-Z0-9]/.test(val) },
  ];

  const unmetPasswordRules = formData.password === ''
    ? []
    : passwordRules.filter(rule => !rule.check(formData.password));

  const genderOptions: SelectOption[] = [
    { label: t('fields.gender.options.male'), value: 'male' },
    { label: t('fields.gender.options.female'), value: 'female' },
    { label: t('fields.gender.options.other'), value: 'other' },
  ];

  const countryOptions: SelectOption[] = Object.entries(
    t.raw('fields.country.options') as Record<string, string>
  )
    .map(([value, label]) => ({
      value,
      label,
      flag: `https://flagcdn.com/w40/${value.toLowerCase()}.png`
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const petOptions: SelectOption[] = [
    { label: t('fields.pets.options.yes'), value: 'yes' },
    { label: t('fields.pets.options.no'), value: 'no' },
  ];


  return (
    <div className={`w-full bg-white mt-10 md:mt-20 pt-12 md:pt-16 pb-0 md:pb-4 px-2 md:px-4 flex flex-col items-center rounded-none shadow-sm relative overflow-hidden ${className}`}>
      <div className="flex flex-col items-center gap-4 text-center w-full mb-10">
        <Text className="text-secondary font-semibold text-[43px]">
          {t('title')}
        </Text>
        <Text className="text-secondary font-semibold text-[29px]">
          {t('subtitle')}
        </Text>
      </div>

      <div className="w-full mb-8">
        <Text className="text-[#565655] font-semibold text-[23px] text-left px-1">
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
              required
              value={formData.gender}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, gender: e.target.value }));
                setTouchedFields(prev => ({ ...prev, gender: true }));
              }}
              error={!!getFieldError('gender')}
              errorText={getFieldError('gender')}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Input
              id="firstName"
              name="firstName"
              label={t('fields.firstName')}
              required
              maxLength={50}
              value={formData.firstName}
              onChange={handleInputChange}
              error={!!getFieldError('firstName')}
              errorText={getFieldError('firstName')}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Input
              id="lastName"
              name="lastName"
              label={t('fields.lastName')}
              required
              maxLength={50}
              value={formData.lastName}
              onChange={handleInputChange}
              error={!!getFieldError('lastName')}
              errorText={getFieldError('lastName')}
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
              required
              maxLength={100}
              value={formData.email}
              onChange={handleInputChange}
              error={!!getFieldError('email')}
              errorText={getFieldError('email')}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label={t('fields.password.label')}
              placeholder={t('fields.password.placeholder')}
              required
              value={formData.password}
              onChange={handleInputChange}
              error={formData.password === '' && !!getFieldError('password')}
              errorText={formData.password === '' ? getFieldError('password') : undefined}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              helperText={
                unmetPasswordRules.length > 0 && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    {unmetPasswordRules.map((rule) => (
                      <span key={rule.key} className="block">• {rule.label}</span>
                    ))}
                  </div>
                )
              }
            />
          </div>

          {/* Row 2 */}
          <div className="col-span-12 md:col-span-8">
            <Input
              id="currentAddress"
              name="currentAddress"
              label={t('fields.currentAddress')}
              required
              maxLength={200}
              value={formData.currentAddress}
              onChange={handleInputChange}
              error={!!getFieldError('currentAddress')}
              errorText={getFieldError('currentAddress')}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Select
              id="country"
              name="country"
              label={t('fields.country.label')}
              placeholder={t('fields.country.placeholder')}
              options={countryOptions}
              required
              value={formData.country}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, country: e.target.value }));
                setTouchedFields(prev => ({ ...prev, country: true }));
              }}
              error={!!getFieldError('country')}
              errorText={getFieldError('country')}
            />
          </div>

          {/* Row 3 */}
          <div className="col-span-12">
            <Input
              id="newAddress"
              name="newAddress"
              label={t('fields.newAddress')}
              required
              maxLength={200}
              value={formData.newAddress}
              onChange={handleInputChange}
              error={!!getFieldError('newAddress')}
              errorText={getFieldError('newAddress')}
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
              max="999"
              required
              value={formData.numPersons}
              onChange={handleInputChange}
              error={!!getFieldError('numPersons')}
              errorText={getFieldError('numPersons')}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Input
              id="numAdults"
              name="numAdults"
              label={t('fields.numAdults')}
              type="number"
              min="0"
              max="999"
              required
              value={formData.numAdults}
              onChange={handleInputChange}
              error={!!getFieldError('numAdults')}
              errorText={getFieldError('numAdults')}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Input
              id="numChildren"
              name="numChildren"
              label={t('fields.numChildren')}
              type="number"
              min="0"
              max="999"
              value={formData.numChildren}
              onChange={handleInputChange}
              error={!!getFieldError('numChildren')}
              errorText={getFieldError('numChildren')}
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
              required
              value={formData.pets}
              onChange={(e) => {
                setPetsSelection(e.target.value);
                setFormData(prev => ({ ...prev, pets: e.target.value }));
                setTouchedFields(prev => ({ ...prev, pets: true }));
              }}
              error={!!getFieldError('pets')}
              errorText={getFieldError('pets')}
            />
          </div>
          <div className="col-span-12 md:col-span-8">
            <Input
              id="whichPets"
              name="whichPets"
              label={t('fields.whichPets')}
              disabled={petsSelection === 'no'}
              maxLength={300}
              value={formData.whichPets}
              onChange={handleInputChange}
              error={!!getFieldError('whichPets')}
              errorText={getFieldError('whichPets')}
            />
          </div>

          {/* Checkbox */}
          <div className="col-span-12 mt-4">
            <Checkbox
              id="consent"
              name="consent"
              label={t('consent')}
              labelClassName="text-[21px] font-medium text-[#362E2D]"
              checked={formData.consent}
              onChange={(e: any) => {
                setFormData(prev => ({ ...prev, consent: e.target.checked }));
                setTouchedFields(prev => ({ ...prev, consent: true }));
              }}
              error={!!getFieldError('consent')}
            />
            {getFieldError('consent') && (
              <Text variant="text-xxs" className="text-error-dark mt-2 block">
                {getFieldError('consent')}
              </Text>
            )}
          </div>

          {/* Phone & Time */}
          <div className="col-span-12 md:col-span-8">
            <Input
              id="phone"
              name="phone"
              label={t('fields.phone')}
              maxLength={20}
              value={formData.phone}
              onChange={handleInputChange}
              error={!!getFieldError('phone')}
              errorText={getFieldError('phone')}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <DateTimeInput
              id="preferredTime"
              name="preferredTime"
              label={t('fields.preferredTime.label')}
              placeholder={t('fields.preferredTime.placeholder')}
              value={formData.preferredTime}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, preferredTime: val || '' }));
                setTouchedFields(prev => ({ ...prev, preferredTime: true }));
              }}
              error={!!getFieldError('preferredTime')}
              errorText={getFieldError('preferredTime')}
            />
          </div>
        </div>

        <div className="w-full mb-10 px-1">
          <Text variant="text-xs" className="text-secondary leading-relaxed text-left">
            {t('legalNote')}
          </Text>
        </div>

        <div className="w-full flex justify-start px-1 pb-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            disabled={!isFormValid || isPending}
            className="!h-[46px] !rounded-[6px] uppercase py-[8.5px] px-4 min-w-[294px]"
            textClassName="text-[22px] font-medium"
          >
            {t('submit')}
          </Button>
        </div>

        {showError && (state as any).errors?.form && (
          <Text variant="body-sm" className="text-error-dark mt-4 text-center">
            {(state as any).errors.form}
          </Text>
        )}

        {showSuccess && (
          <Text variant="body-sm" className="text-success mt-4 text-center font-bold">
            {t('successMessage')}
          </Text>
        )}
      </form>
    </div>
  );
};
