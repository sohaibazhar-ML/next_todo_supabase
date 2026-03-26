"use client";
import React from 'react';
import { useProfileForm } from '@/website/hooks';
import { AdaptiveIcon } from '@/website/atoms/AdaptiveIcon';
import { User } from 'lucide-react';

import { UserProfile } from '@/website/types';

interface ProfileFormProps {
    userId: string;
    isCreating?: boolean;
    defaultValues?: Partial<UserProfile>;
}

/**
 * ProfileForm Organism
 * 
 * A high-quality form for managing user profile information.
 * Features:
 * - Real-time validation (Zod)
 * - Premium aesthetics (vibrant accents, clean typography)
 * - Sectioned layout for better UX
 */
export const ProfileForm = ({ userId, isCreating = false, defaultValues }: ProfileFormProps) => {
    const { 
        form,
        onSubmit, 
        isLoading,
        onPasswordSubmit,
        isPasswordLoading
    } = useProfileForm({ userId, isCreating, defaultValues });

    const { register, formState: { errors } } = form;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <header className="flex items-center gap-4 pb-6 border-b">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <AdaptiveIcon lucide={User} size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isCreating ? 'Complete Your Profile' : 'Account Settings'}
                    </h2>
                    <p className="text-gray-500">Manage your moving details and account preferences.</p>
                </div>
            </header>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                        <label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name</label>
                        <input 
                            id="first_name"
                            {...register('first_name')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                        {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name</label>
                        <input 
                            id="last_name"
                            {...register('last_name')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                        {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label htmlFor="phone_number" className="text-sm font-medium text-gray-700">Phone Number</label>
                        <input 
                            id="phone_number"
                            {...register('phone_number')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="+41 XX XXX XX XX"
                        />
                        {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number.message}</p>}
                    </div>

                    {/* Username (only if creating) */}
                    {isCreating && (
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                            <input 
                                id="username"
                                {...register('username' as never)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                            {errors && 'username' in errors && (errors as any).username && (
                                <p className="text-sm text-red-500">{(errors as any).username.message}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Address */}
                    <div className="space-y-2">
                        <label htmlFor="current_address" className="text-sm font-medium text-gray-700">Current Address</label>
                        <input 
                            id="current_address"
                            {...register('current_address')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>

                    {/* Country of Origin */}
                    <div className="space-y-2">
                        <label htmlFor="country_of_origin" className="text-sm font-medium text-gray-700">Country of Origin</label>
                        <input 
                            id="country_of_origin"
                            {...register('country_of_origin')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="marketing_consent" {...register('marketing_consent')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="marketing_consent" className="text-sm text-gray-600">I agree to receive marketing updates.</label>
                    </div>
                    {isCreating && (
                        <>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="terms_accepted" {...register('terms_accepted' as never)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="terms_accepted" className="text-sm text-gray-600">I accept the Terms of Service.</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="data_privacy_accepted" {...register('data_privacy_accepted' as never)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="data_privacy_accepted" className="text-sm text-gray-600">I accept the Data Privacy Policy.</label>
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transform active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Security & Password</h3>
                <form onSubmit={onPasswordSubmit} className="space-y-6">
                    {/* Password fields... */}
                    <button 
                        type="submit"
                        disabled={isPasswordLoading}
                        className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};
