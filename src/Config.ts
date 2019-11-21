import * as dotenv from "dotenv";
dotenv.config();

const getValue = <T>(key: string, transformer?: (value: string) => T): T | undefined => {
  const value = process.env[key];
  if (!value) {
    return undefined;
  }
  return transformer ? transformer(value || "") : value as any;
};

export class Config {
  static optional<T = string>(key: string, transformer?: (value: string) => T): T | undefined {
    return getValue<T>(key, transformer);
  }

  static required<T = string>(key: string, transformer?: (value: string) => T): T {
    const value = getValue<T>(key, transformer);
    if (!value) {
      console.error(`Missing required environment variable ${key}`);
      process.exit(1);
    }
    return value;
  }
}
