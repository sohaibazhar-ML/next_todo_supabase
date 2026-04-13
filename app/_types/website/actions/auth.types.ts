export type ActionState = {
  errors?: {
    email?: string[];
    password?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
    firstName?: string[];
    lastName?: string[];
    gender?: string[];
    currentAddress?: string[];
    country?: string[];
    newAddress?: string[];
    numPersons?: string[];
    numAdults?: string[];
    numChildren?: string[];
    pets?: string[];
    whichPets?: string[];
    phone?: string[];
    preferredTime?: string[];
    consent?: string[];
    form?: string;
  };
  success?: boolean;
  needsConfirmation?: boolean;
  email?: string;
};
