export type UserRole = 'admin' | 'subadmin' | 'user';

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    current_address?: string;
    country_of_origin?: string;
    number_of_adults?: number;
    number_of_children?: number;
    pets_type?: string | null;
    new_address_switzerland?: string;
    marketing_consent?: boolean;
    terms_accepted?: boolean;
    data_privacy_accepted?: boolean;
    email_confirmed?: boolean;
    email_confirmed_at?: string | null;
    keep_me_logged_in?: boolean;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface SignUpFormData {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password?: string;
}
