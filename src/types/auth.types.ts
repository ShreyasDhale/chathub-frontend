// Request DTOs
export type LoginRequestDto = {
  Username: string;
  Password: string;
};

export type SignupRequestDto = {
  Username: string;
  Email: string;
  Password: string;
};

export type LoginResponseDto = {
  LoginStatus: boolean;
  LoginStatusMessge: string;
  Token: string;
};
