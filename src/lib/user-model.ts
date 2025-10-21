export type UserRole = 'user' | 'admin' | 'moderator'


export interface User {
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  username: string;
  phone_number: string;
  id: number;
  role: UserRole;
  is_verified: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
  last_login: Date | string | null;
}


