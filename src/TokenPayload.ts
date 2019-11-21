export interface TokenPayload<Extra = any> {
  username: string;
  userId: number;
  sessionId: string;
  expiresAt: Date;
  extra: Extra;
}
