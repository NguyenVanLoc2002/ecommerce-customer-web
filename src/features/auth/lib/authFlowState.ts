export type ForgotPasswordRouteState = {
  email: string;
};

export type ResetPasswordRouteState = {
  email: string;
  resetToken: string;
  expiresAt: string;
};
