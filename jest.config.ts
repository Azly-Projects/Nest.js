import dotenv from 'dotenv';
import { Config } from '@jest/types';

// Environment for testing
dotenv.config({ path: '.env.test' });

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/$1',
  },
  coveragePathIgnorePatterns: ['<rootDir>/main.ts', '.*\\.bak\\.(t|j)s$'],
  verbose: true,
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;
