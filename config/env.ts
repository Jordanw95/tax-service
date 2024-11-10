import dotenv from 'dotenv';

dotenv.config();

const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.TEST_DATABASE_URL;
  }
  return process.env.DATABASE_URL;
};

export const config = {
  DATABASE_URL: getDatabaseUrl() || '',
  PORT: process.env.PORT || 3000,
};
