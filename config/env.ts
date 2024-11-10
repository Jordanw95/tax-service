import dotenv from 'dotenv';

dotenv.config();

export const config = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  PORT: process.env.PORT || 3000,
};
