import { compare, hash } from 'bcryptjs';

export const hashValue = async (password: string) => {
  return hash(password, 10);
};

export const compareHashedValue = async (
  value: string,
  hashedValue: string,
) => {
  return compare(value, hashedValue);
};
