export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  is_installer: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/** Response from POST /api/auth/register/ — no tokens until the user
 *  clicks the activation link emailed to them. */
export interface RegisterResponse {
  detail: string;
  email: string;
}

export interface Address {
  id: string;
  label: string;
  address_type: 'shipping' | 'billing';
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export type AddressInput = Omit<Address, 'id' | 'created_at'>;
