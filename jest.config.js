/** @type {import('jest').Config} */

export default {
  verbose: true,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png)$': '<rootDir>/mocks/fileMock.js',
    '\\.(css|less)$': '<rootDir>/mocks/fileMock.js',
  },
};
