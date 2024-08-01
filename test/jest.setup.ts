// tests/jest.setup.ts
jest.mock('../src/config/rollbar', () => {
  return {
    error: jest.fn(),
    errorHandler: () => (err: any, req: any, res: any, next: any) => next(err),
  };
});

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  // Any other methods you use
};

jest.mock('winston', () => ({
  createLogger: () => mockLogger,
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
  },
}));
