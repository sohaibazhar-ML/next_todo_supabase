export type UserRole = 'user' | 'admin'

export interface UserProfile {
  id: string
  username: string
  first_name: string
  last_name: string
  current_address: string
  country_of_origin: string
  email: string
  phone_number: string
  number_of_adults: number
  number_of_children: number
  pets_type: string | null
  new_address_switzerland: string
  marketing_consent: boolean
  terms_accepted: boolean
  data_privacy_accepted: boolean
  email_confirmed: boolean
  email_confirmed_at: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface SignUpFormData {
  // Personal Information
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  
  // Address Information
  currentAddress: string
  countryOfOrigin: string
  newAddressSwitzerland: string
  
  // Family Information
  numberOfAdults: number
  numberOfChildren: number
  petsType: string
  
  // Consents
  marketingConsent: boolean
  termsAccepted: boolean
  dataPrivacyAccepted: boolean
}

