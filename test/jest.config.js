module.exports = {
  roots: ['<rootDir>'],
  rootDir: '../',
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  coverageReporters: ['text-summary', 'lcov', 'cobertura'],
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/jest.setup.ts', 'dotenv/config'],
  coverageDirectory: '<rootDir>/report/coverage',
  testPathIgnorePatterns: ['<rootDir>/.build'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
};
