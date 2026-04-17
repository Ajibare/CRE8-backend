import crypto from 'crypto';

export const generateReference = (prefix: string = 'FUN'): string => {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${randomBytes}`;
};
