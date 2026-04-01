export type JwtPayload = {
  sub: string;
};

export type AuthenticatedUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];
};
