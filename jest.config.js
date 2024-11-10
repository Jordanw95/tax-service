/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['reflect-metadata'],
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    moduleFileExtensions: ['ts', 'js'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    maxWorkers: 1,
  };
