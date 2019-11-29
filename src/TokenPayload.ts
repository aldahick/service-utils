export interface TokenPayload<Data = any> {
  expiresAt: Date;
  data: Data;
};
